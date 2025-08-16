import connection from "../config/connectDB.js";
import jwt from "jsonwebtoken";
import md5 from "md5";
import request from "request";
import dotenv from "dotenv";
dotenv.config();
import axios from "axios";
import multer from "multer";
import path from "path";
import base64url from "base64-url";
import fs from "fs";
let timeNow = Date.now();

const randomNumber = (min, max) => {
  return String(Math.floor(Math.random() * (max - min + 1)) + min);
};

const verifyCode = async (req, res) => {
  let auth = req.cookies.auth;
  let now = new Date().getTime();
  let timeEnd = +new Date() + 1000 * (60 * 2 + 0) + 500;
  let otp = randomNumber(100000, 999999);

  conswit[rows] = await connection.query(
    "SELECT * FROM users WHERE `token` = ? ",
    [auth]
  );
  if (!rows) {
    return res.status(200).json({
      message: "Account does not exist",
      status: false,
      timeStamp: timeNow,
    });
  }
  let user = rows[0];
  if (user.time_otp - now <= 0) {
    request(
      `http://47.243.168.18:9090/sms/batch/v2?appkey=NFJKdK&appsecret=brwkTw&phone=84${user.phone}&msg=Your verification code is ${otp}&extend=${now}`,
      async (error, response, body) => {
        let data = JSON.parse(body);
        if (data.code == "00000") {
          await connection.execute(
            "UPDATE users SET otp = ?, time_otp = ? WHERE phone = ? ",
            [otp, timeEnd, user.phone]
          );
          return res.status(200).json({
            message: "Submitted successfully",
            status: true,
            timeStamp: timeNow,
            timeEnd: timeEnd,
          });
        }
      }
    );
  } else {
    return res.status(200).json({
      message: "Send SMS regularly.",
      status: false,
      timeStamp: timeNow,
    });
  }
};

const aviator = async (req, res) => {
  let auth = req.cookies.auth;
  res.redirect(
    `https://aviator.rubblelottery.com/theninja/src/api/userapi.php?action=loginandregisterbyauth&token=${auth}`
  );
};

const userInfo = async (req, res) => {
    
    try{
        
    
    
  let auth = req.cookies.auth;

  if (!auth) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }
  const [rows] = await connection.query(
    "SELECT * FROM users WHERE `token` = ? ",
    [auth]
  );

  if (!rows) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }
  const [recharge] = await connection.query(
    "SELECT * FROM recharge WHERE `phone` = ? AND status = 1",
    [rows[0].phone]
  );
  let totalRecharge = 0;
  recharge.forEach((data) => {
    totalRecharge += data.money;
  });
  const [withdraw] = await connection.query(
    "SELECT * FROM withdraw WHERE `phone` = ? AND status = 1",
    [rows[0].phone]
  );
  let totalWithdraw = 0;
  withdraw.forEach((data) => {
    totalWithdraw += data.money;
  });

  const { id, password, ip, veri, ip_address, status, time, token, ...others } =
    rows[0];
  return res.status(200).json({
    message: "Success",
    status: true,
    data: {
      code: others.code,
      avator: others.avatar || 0,
      id_user: others.id_user,
      name_user: others.name_user,
      phone_user: others.phone,
      money_user: others.money,
      winning: others.winning,
    },
    totalRecharge: totalRecharge,
    totalWithdraw: totalWithdraw,
    timeStamp: timeNow,
  });
  
    }catch(error){
         console.error(error);
    res.status(500).json({
      message: "Internal Server Error",
      status: false,
    });
    }
};

const changeUser = async (req, res) => {
  let auth = req.cookies.auth;
  let name = req.body.name;
  let type = req.body.type;

  const [rows] = await connection.query(
    "SELECT * FROM users WHERE `token` = ? ",
    [auth]
  );
  if (!rows || !type || !name)
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  switch (type) {
    case "editname":
      await connection.query(
        "UPDATE users SET name_user = ? WHERE `token` = ? ",
        [name, auth]
      );
      return res.status(200).json({
        message: "Username modification successful",
        status: true,
        timeStamp: timeNow,
      });
      break;

    default:
      return res.status(200).json({
        message: "Failed",
        status: false,
        timeStamp: timeNow,
      });
      break;
  }
};

const changePassword = async (req, res) => {
  let auth = req.cookies.auth;
  let password = req.body.password;
  let newPassWord = req.body.newPassWord;
  // let otp = req.body.otp;

  if (!password || !newPassWord)
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  const [rows] = await connection.query(
    "SELECT * FROM users WHERE `token` = ? AND `password` = ? ",
    [auth, md5(password)]
  );
  if (rows.length == 0)
    return res.status(200).json({
      message: "Incorrect password",
      status: false,
      timeStamp: timeNow,
    });

  // let getTimeEnd = Number(rows[0].time_otp);
  // let tet = new Date(getTimeEnd).getTime();
  // var now = new Date().getTime();
  // var timeRest = tet - now;
  // if (timeRest <= 0) {
  //     return res.status(200).json({
  //         message: 'Mã OTP đã hết hiệu lực',
  //         status: false,
  //         timeStamp: timeNow,
  //     });
  // }

  // const [check_otp] = await connection.query('SELECT * FROM users WHERE `token` = ? AND `password` = ? AND otp = ? ', [auth, md5(password), otp]);
  // if(check_otp.length == 0) return res.status(200).json({
  //     message: 'Mã OTP không chính xác',
  //     status: false,
  //     timeStamp: timeNow,
  // });;

  await connection.query(
    "UPDATE users SET otp = ?, password = ?, plain_password = ? WHERE `token` = ? ",
    [randomNumber(100000, 999999), md5(newPassWord), newPassWord, auth]
  );
  return res.status(200).json({
    message: "Password modification successful",
    status: true,
    timeStamp: timeNow,
  });
};

const checkInHandling = async (req, res) => {
  let auth = req.cookies.auth;
  let data = req.body.data;

  console.log("test 1");

  if (!auth)
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  const [rows] = await connection.query(
    "SELECT * FROM users WHERE `token` = ? ",
    [auth]
  );
  if (!rows)
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  if (!data) {
    const [point_list] = await connection.query(
      "SELECT * FROM point_list WHERE `phone` = ? ",
      [rows[0].phone]
    );
    return res.status(200).json({
      message: "No More Data",
      datas: point_list,
      status: true,
      timeStamp: timeNow,
    });
  }

  let today = new Date().toISOString().slice(0, 10);
  if (data) {
    // Transfer_money me aaj ki entry check karo
    const [existingTransfer] = await connection.query(
      "SELECT * FROM transfer_money WHERE phone = ? AND type = ? AND DATE(time) = ? AND status = 1",
      [rows[0].phone, "Attendance Bonus", today]
    );

    if (existingTransfer.length > 0) {
      return res.status(200).json({
        message: "Reward for today already claim. try again tomorrow.",
        status: false,
        timeStamp: timeNow,
      });
    }
  }
  if (data) {
    if (data == 1) {
      const [point_lists] = await connection.query(
        "SELECT * FROM point_list WHERE `phone` = ? ",
        [rows[0].phone]
      );
      let check = rows[0].money;
      let point_list = point_lists[0];
      let get = 500;
      if (check >= data && point_list.total1 != 0) {
        await connection.query(
          "UPDATE users SET winning = winning + ? WHERE phone = ? ",
          [point_list.total1, rows[0].phone]
        );
        let trans =
          "INSERT INTO transfer_money SET amount = ?, phone = ?, type = ?, status = 1";
        await connection.query(trans, [
          point_list.total1,
          rows[0].phone,
          "Attendance Bonus",
        ]);
        await connection.query(
          "UPDATE point_list SET total1 = ? WHERE phone = ? ",
          [0, rows[0].phone]
        );
        return res.status(200).json({
          message: `You just received ₹ ${point_list.total1}.00`,
          status: true,
          timeStamp: timeNow,
        });
      } else if (check < get && point_list.total1 != 0) {
        return res.status(200).json({
          message: "Please Bet ₹ 500 to claim gift.",
          status: false,
          timeStamp: timeNow,
        });
      } else if (point_list.total1 == 0) {
        return res.status(200).json({
          message: "You have already received this gift",
          status: false,
          timeStamp: timeNow,
        });
      }
    }
    if (data == 2) {
      const [point_lists] = await connection.query(
        "SELECT * FROM point_list WHERE `phone` = ? ",
        [rows[0].phone]
      );
      let check = rows[0].money;
      let point_list = point_lists[0];
      let get = 5000;
      if (check >= get && point_list.total2 != 0) {
        let trans =
          "INSERT INTO transfer_money SET amount = ?, phone = ?, type = ?, status = 1";
        await connection.query(trans, [
          point_list.total2,
          rows[0].phone,
          "Attendance Bonus",
        ]);
        await connection.query(
          "UPDATE users SET winning = winning + ? WHERE phone = ? ",
          [point_list.total2, rows[0].phone]
        );
        await connection.query(
          "UPDATE point_list SET total2 = ? WHERE phone = ? ",
          [0, rows[0].phone]
        );
        return res.status(200).json({
          message: `You just received ₹ ${point_list.total2}.00`,
          status: true,
          timeStamp: timeNow,
        });
      } else if (check < get && point_list.total2 != 0) {
        return res.status(200).json({
          message: "Please Recharge ₹ 5000 to claim gift.",
          status: false,
          timeStamp: timeNow,
        });
      } else if (point_list.total2 == 0) {
        return res.status(200).json({
          message: "You have already received this gift",
          status: false,
          timeStamp: timeNow,
        });
      }
    }
    if (data == 3) {
      const [point_lists] = await connection.query(
        "SELECT * FROM point_list WHERE `phone` = ? ",
        [rows[0].phone]
      );
      let check = rows[0].money;
      let point_list = point_lists[0];
      let get = 7000;
      if (check >= get && point_list.total3 != 0) {
        let trans =
          "INSERT INTO transfer_money SET amount = ?, phone = ?, type = ?, status = 1";
        await connection.query(trans, [
          point_list.total3,
          rows[0].phone,
          "Attendance Bonus",
        ]);
        await connection.query(
          "UPDATE users SET winning = winning + ? WHERE phone = ? ",
          [point_list.total3, rows[0].phone]
        );
        await connection.query(
          "UPDATE point_list SET total3 = ? WHERE phone = ? ",
          [0, rows[0].phone]
        );
        return res.status(200).json({
          message: `You just received ₹ ${point_list.total3}.00`,
          status: true,
          timeStamp: timeNow,
        });
      } else if (check < get && point_list.total3 != 0) {
        return res.status(200).json({
          message: "Please Bet ₹ 7000 to claim gift.",
          status: false,
          timeStamp: timeNow,
        });
      } else if (point_list.total3 == 0) {
        return res.status(200).json({
          message: "You have already received this gift",
          status: false,
          timeStamp: timeNow,
        });
      }
    }
    if (data == 4) {
      const [point_lists] = await connection.query(
        "SELECT * FROM point_list WHERE `phone` = ? ",
        [rows[0].phone]
      );
      let check = rows[0].money;
      let point_list = point_lists[0];
      let get = 15000;
      if (check >= get && point_list.total4 != 0) {
        let trans =
          "INSERT INTO transfer_money SET amount = ?, phone = ?, type = ?, status = 1";
        await connection.query(trans, [
          point_list.total4,
          rows[0].phone,
          "Attendance Bonus",
        ]);
        await connection.query(
          "UPDATE users SET winning = winning + ? WHERE phone = ? ",
          [point_list.total4, rows[0].phone]
        );
        await connection.query(
          "UPDATE point_list SET total4 = ? WHERE phone = ? ",
          [0, rows[0].phone]
        );
        return res.status(200).json({
          message: `You just received ₹ ${point_list.total4}.00`,
          status: true,
          timeStamp: timeNow,
        });
      } else if (check < get && point_list.total4 != 0) {
        return res.status(200).json({
          message: "Please Bet ₹ 15000 to claim gift.",
          status: false,
          timeStamp: timeNow,
        });
      } else if (point_list.total4 == 0) {
        return res.status(200).json({
          message: "You have already received this gift",
          status: false,
          timeStamp: timeNow,
        });
      }
    }
    if (data == 5) {
      const [point_lists] = await connection.query(
        "SELECT * FROM point_list WHERE `phone` = ? ",
        [rows[0].phone]
      );
      let check = rows[0].money;
      let point_list = point_lists[0];
      let get = 35000;
      if (check >= get && point_list.total5 != 0) {
        let trans =
          "INSERT INTO transfer_money SET amount = ?, phone = ?, type = ?, status = 1";
        await connection.query(trans, [
          point_list.total5,
          rows[0].phone,
          "Attendance Bonus",
        ]);
        await connection.query(
          "UPDATE users SET winning = winning + ? WHERE phone = ? ",
          [point_list.total5, rows[0].phone]
        );
        await connection.query(
          "UPDATE point_list SET total5 = ? WHERE phone = ? ",
          [0, rows[0].phone]
        );
        return res.status(200).json({
          message: `You just received ₹ ${point_list.total5}.00`,
          status: true,
          timeStamp: timeNow,
        });
      } else if (check < get && point_list.total5 != 0) {
        return res.status(200).json({
          message: "Please Bet ₹ 35000 to claim gift.",
          status: false,
          timeStamp: timeNow,
        });
      } else if (point_list.total5 == 0) {
        return res.status(200).json({
          message: "You have already received this gift",
          status: false,
          timeStamp: timeNow,
        });
      }
    }
    if (data == 6) {
      const [point_lists] = await connection.query(
        "SELECT * FROM point_list WHERE `phone` = ? ",
        [rows[0].phone]
      );
      let check = rows[0].money;
      let point_list = point_lists[0];
      let get = 100000;
      if (check >= get && point_list.total6 != 0) {
        let trans =
          "INSERT INTO transfer_money SET amount = ?, phone = ?, type = ?, status = 1";
        await connection.query(trans, [
          point_list.total6,
          rows[0].phone,
          "Attendance Bonus",
        ]);
        await connection.query(
          "UPDATE users SET winning = winning + ? WHERE phone = ? ",
          [point_list.total6, rows[0].phone]
        );
        await connection.query(
          "UPDATE point_list SET total6 = ? WHERE phone = ? ",
          [0, rows[0].phone]
        );
        return res.status(200).json({
          message: `You just received ₹ ${point_list.total6}.00`,
          status: true,
          timeStamp: timeNow,
        });
      } else if (check < get && point_list.total6 != 0) {
        return res.status(200).json({
          message: "Please Bet ₹ 100000 to claim gift.",
          status: false,
          timeStamp: timeNow,
        });
      } else if (point_list.total6 == 0) {
        return res.status(200).json({
          message: "You have already received this gift",
          status: false,
          timeStamp: timeNow,
        });
      }
    }
    if (data == 7) {
      const [point_lists] = await connection.query(
        "SELECT * FROM point_list WHERE `phone` = ? ",
        [rows[0].phone]
      );
      let check = rows[0].money;
      let point_list = point_lists[0];
      let get = 500000;
      if (check >= get && point_list.total7 != 0) {
        let trans =
          "INSERT INTO transfer_money SET amount = ?, phone = ?, type = ?, status = 1";
        await connection.query(trans, [
          point_list.total7,
          rows[0].phone,
          "Attendance Bonus",
        ]);
        await connection.query(
          "UPDATE users SET winning = winning + ? WHERE phone = ? ",
          [point_list.total7, rows[0].phone]
        );
        await connection.query(
          "UPDATE point_list SET total7 = ? WHERE phone = ? ",
          [0, rows[0].phone]
        );
        return res.status(200).json({
          message: `You just received ₹ ${point_list.total7}.00`,
          status: true,
          timeStamp: timeNow,
        });
      } else if (check < get && point_list.total7 != 0) {
        return res.status(200).json({
          message: "Please Bet ₹500000 to claim gift.",
          status: false,
          timeStamp: timeNow,
        });
      } else if (point_list.total7 == 0) {
        return res.status(200).json({
          message: "You have already received this gift",
          status: false,
          timeStamp: timeNow,
        });
      }
    }
  }
};

function formateT(params) {
  let result = params < 10 ? "0" + params : params;
  return result;
}

function timerJoin(params = "", addHours = 0) {
  let date = "";
  if (params) {
    date = new Date(Number(params));
  } else {
    date = new Date();
  }

  date.setHours(date.getHours() + addHours);

  let years = formateT(date.getFullYear());
  let months = formateT(date.getMonth() + 1);
  let days = formateT(date.getDate());

  let hours = date.getHours() % 12;
  hours = hours === 0 ? 12 : hours;
  let ampm = date.getHours() < 12 ? "AM" : "PM";

  let minutes = formateT(date.getMinutes());
  let seconds = formateT(date.getSeconds());

  return (
    years +
    "-" +
    months +
    "-" +
    days +
    " " +
    hours +
    ":" +
    minutes +
    ":" +
    seconds +
    " " +
    ampm
  );
}

const promotion = async (req, res) => {
  let auth = req.cookies.auth;
  if (!auth) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }

  const [user] = await connection.query(
    "SELECT `phone`, `code`,`invite`, `roses_f`, `roses_f1`, `roses_today` FROM users WHERE `token` = ? ",
    [auth]
  );
  const [level] = await connection.query("SELECT * FROM level");

  if (!user) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }

  let userInfo = user[0];

  // Directly referred level-1 users
  const [f1s] = await connection.query(
    "SELECT `phone`, `code`,`invite`, `time` FROM users WHERE `invite` = ? ",
    [userInfo.code]
  );

  // Directly referred users today
  let f1_today = 0;
  for (let i = 0; i < f1s.length; i++) {
    const f1_time = f1s[i].time;
    let check = timerJoin(f1_time) == timerJoin() ? true : false;
    if (check) {
      f1_today += 1;
    }
  }

  // All direct referrals today
  let f_all_today = 0;
  for (let i = 0; i < f1s.length; i++) {
    const f1_code = f1s[i].code;
    const f1_time = f1s[i].time;
    let check_f1 = timerJoin(f1_time) == timerJoin() ? true : false;
    if (check_f1) f_all_today += 1;

    // Total level-2 referrals today
    const [f2s] = await connection.query(
      "SELECT `phone`, `code`,`invite`, `time` FROM users WHERE `invite` = ? ",
      [f1_code]
    );
    for (let i = 0; i < f2s.length; i++) {
      const f2_code = f2s[i].code;
      const f2_time = f2s[i].time;
      let check_f2 = timerJoin(f2_time) == timerJoin() ? true : false;
      if (check_f2) f_all_today += 1;

      // Total level-3 referrals today
      const [f3s] = await connection.query(
        "SELECT `phone`, `code`,`invite`, `time` FROM users WHERE `invite` = ? ",
        [f2_code]
      );
      for (let i = 0; i < f3s.length; i++) {
        const f3_code = f3s[i].code;
        const f3_time = f3s[i].time;
        let check_f3 = timerJoin(f3_time) == timerJoin() ? true : false;
        if (check_f3) f_all_today += 1;

        // Total level-4 referrals today
        const [f4s] = await connection.query(
          "SELECT `phone`, `code`,`invite`, `time` FROM users WHERE `invite` = ? ",
          [f3_code]
        );
        for (let i = 0; i < f4s.length; i++) {
          const f4_code = f4s[i].code;
          const f4_time = f4s[i].time;
          let check_f4 = timerJoin(f4_time) == timerJoin() ? true : false;
          if (check_f4) f_all_today += 1;
        }
      }
    }
  }

  // Total level-2 referrals
  let f2 = 0;
  for (let i = 0; i < f1s.length; i++) {
    const f1_code = f1s[i].code;
    const [f2s] = await connection.query(
      "SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ",
      [f1_code]
    );
    f2 += f2s.length;
  }

  // Total level-3 referrals
  let f3 = 0;
  for (let i = 0; i < f1s.length; i++) {
    const f1_code = f1s[i].code;
    const [f2s] = await connection.query(
      "SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ",
      [f1_code]
    );
    for (let i = 0; i < f2s.length; i++) {
      const f2_code = f2s[i].code;
      const [f3s] = await connection.query(
        "SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ",
        [f2_code]
      );
      if (f3s.length > 0) f3 += f3s.length;
    }
  }

  // Total level-4 referrals
  let f4 = 0;
  for (let i = 0; i < f1s.length; i++) {
    const f1_code = f1s[i].code;
    const [f2s] = await connection.query(
      "SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ",
      [f1_code]
    );
    for (let i = 0; i < f2s.length; i++) {
      const f2_code = f2s[i].code;
      const [f3s] = await connection.query(
        "SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ",
        [f2_code]
      );
      for (let i = 0; i < f3s.length; i++) {
        const f3_code = f3s[i].code;
        const [f4s] = await connection.query(
          "SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ",
          [f3_code]
        );
        if (f4s.length > 0) f4 += f4s.length;
      }
    }
  }

  let selectedData = [];

  async function fetchInvitesByCode(code, depth = 1) {
    if (depth > 6) {
      return;
    }

    const [inviteData] = await connection.query(
      "SELECT `id_user`,`name_user`,`phone`, `code`, `invite`, `rank`, `user_level`, `total_money` FROM users WHERE `invite` = ?",
      [code]
    );

    if (inviteData.length > 0) {
      for (const invite of inviteData) {
        selectedData.push(invite);
        await fetchInvitesByCode(invite.code, depth + 1);
      }
    }
  }

  if (f1s.length > 0) {
    for (const initialInfoF1 of f1s) {
      selectedData.push(initialInfoF1);
      await fetchInvitesByCode(initialInfoF1.code);
    }
  }

  const rosesF1 = parseFloat(userInfo.roses_f);
  const rosesAll = parseFloat(userInfo.roses_f1);
  let rosesAdd = rosesF1 + rosesAll;

  return res.status(200).json({
    message: "Receive success",
    level: level,
    info: user,
    status: true,
    invite: {
      f1: f1s.length,
      total_f: selectedData.length,
      f1_today: f1_today,
      f_all_today: f_all_today,
      roses_f1: userInfo.roses_f1,
      roses_f: userInfo.roses_f,
      roses_all: rosesAdd,
      roses_today: userInfo.roses_today,
    },
    timeStamp: timeNow,
  });
};

const myTeam = async (req, res) => {
  let auth = req.cookies.auth;
  if (!auth) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }
  const [user] = await connection.query(
    "SELECT `phone`, `code`,`invite` FROM users WHERE `token` = ? ",
    [auth]
  );
  const [level] = await connection.query("SELECT * FROM level");
  if (!user) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }
  return res.status(200).json({
    message: "Receive success",
    level: level,
    info: user,
    status: true,
    timeStamp: timeNow,
  });
};

const listTeamData = async (req, res) => {
  let auth = req.cookies?.auth;
  const { date, id_user } = req.body;

  if (!auth) {
    return res.status(401).json({ message: "Unauthorized", status: false });
  }

  try {
    const [rows] = await connection.query(
      "SELECT * FROM users WHERE `token` = ?",
      [auth]
    );

    if (!rows.length) {
      return res.status(200).json({
        message: "Failed",
        status: false,
        timeStamp: new Date().toISOString(),
      });
    }

    const userInfo = rows[0];
    console.log(userInfo, userInfo.phone);

    const referralTree = await fetchReferralsUser(
      userInfo.code,
      1,
      10,
      date,
      userInfo.phone
    );

    if (!referralTree || referralTree.length === 0) {
      return res
        .status(200)
        .json({ success: false, message: "No referral data found" });
    }

    async function unwindData(data) {
      let result = [];

      async function flatten(node) {
        if (!node || typeof node !== "object") return;
        const { children, ...ele } = node;
        result.push(ele);

        if (Array.isArray(node.children)) {
          for (const child of node.children) {
            await flatten(child);
          }
        }
      }

      if (Array.isArray(data)) {
        for (const node of data) {
          await flatten(node);
        }
      } else {
        await flatten(data);
      }

      return result;
    }

    // Flatten referralTree and await the result
    let flatResult = await unwindData(referralTree);

    // Apply filter based on id_user
    if (id_user) {
      flatResult = flatResult.filter((user) =>
        String(user.id_user).includes(String(id_user))
      );
    }

    let totalBettingAmount = flatResult.reduce(
      (sum, user) => sum + (user.totalBetting || 0),
      0
    );
    let totalRechargeAmount = flatResult.reduce(
      (sum, user) => sum + (user.rechargeTotal || 0),
      0
    );

    return res.status(200).json({
      success: true,
      data: referralTree,
      flatData: flatResult,
      totalBettingAmount: totalBettingAmount,
      totalRechargeAmount: totalRechargeAmount,
      numberOfBettors: flatResult.length || 0,
    });
  } catch (error) {
    console.error("Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

const fetchReferralsUser = async (
  inviteCode,
  level = 1,
  maxLevel = 10,
  date,
  phone
) => {
  if (level > maxLevel) return [];

  // const today = new Date();
  // const endTime = today.setHours(23, 59, 59, 999);
  // const startDate = new Date(date || today);
  // const startTime = startDate.setHours(0, 0, 0, 0);
  // console.log(new Date(startTime),new Date(endTime));

  const baseDate = date ? new Date(date) : new Date();
  const startDate = new Date(baseDate);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(baseDate);
  endDate.setHours(23, 59, 59, 999);
  const startTime = startDate.getTime();
  const endTime = endDate.getTime();
  const [referrals] = await connection.execute(
    "SELECT id, id_user, phone, `code`, invite, `time` FROM users WHERE invite = ?",
    [inviteCode]
  );

  //   const [referrals] = await connection.execute(
  //     `SELECT id, id_user, phone, \`code\`, invite, \`time\`
  //      FROM users
  //      WHERE invite = ?
  //      AND time BETWEEN FROM_UNIXTIME(? / 1000) AND FROM_UNIXTIME(? / 1000)`,
  //     [inviteCode, startTime, endTime]
  //   );

  if (!referrals.length) return [];

  const nestedReferrals = await Promise.all(
    referrals.map(async (user) => {
      const [rechargeData] = await connection.execute(
        `SELECT 
              COALESCE(SUM(money), 0) AS total_money,
              JSON_ARRAYAGG(JSON_OBJECT(
                'id', id,
                'phone', phone,
                'money', money,
                'status', status,
                'time', time
              )) AS details
           FROM recharge 
           WHERE status = 1 
           AND phone = ? 
           AND time BETWEEN ? AND ?`,
        [user.phone, startTime, endTime]
      );

      const rechargeTotal = rechargeData.length
        ? rechargeData[0].total_money
        : 0;

      const [bettingData] = await connection.execute(
        `SELECT 
              COALESCE(SUM(total_money), 0) AS total_sum, 
              JSON_ARRAYAGG(JSON_OBJECT(
                'table', source_table,
                'phone', phone,
                'amount', amount,
                'time', time
              )) AS bettingDetails
           FROM (
             SELECT 'minutes_1' AS source_table, phone, amount, time, CAST(amount AS DECIMAL(10,2)) AS total_money 
             FROM minutes_1 
             WHERE phone = ? AND time BETWEEN ? AND ?
             UNION ALL 
             SELECT 'trxresult' AS source_table, phone, amount, time, CAST(amount AS DECIMAL(10,2)) AS total_money 
             FROM trxresult 
             WHERE phone = ? AND time BETWEEN ? AND ?
             UNION ALL 
             SELECT 'result_k3' AS source_table, phone, amount, time, CAST(amount AS DECIMAL(10,2)) AS total_money 
             FROM result_k3 
             WHERE phone = ? AND time BETWEEN ? AND ?
             UNION ALL 
             SELECT 'result_5d' AS source_table, phone, amount, time, CAST(amount AS DECIMAL(10,2)) AS total_money 
             FROM result_5d 
             WHERE phone = ? AND time BETWEEN ? AND ?
           ) AS combined_data`,
        [
          user.phone,
          startTime,
          endTime,
          user.phone,
          startTime,
          endTime,
          user.phone,
          startTime,
          endTime,
          user.phone,
          startTime,
          endTime,
        ]
      );

      const totalBetting = bettingData.length ? bettingData[0].total_sum : 0;

      const [commissionData] = await connection.execute(
        `SELECT 
              COALESCE(SUM(amount), 0) AS total_commission,
              JSON_ARRAYAGG(JSON_OBJECT(
                'id', id,
                'sender_phone', sender_phone,
                'phone', phone,
                'amount', amount,
                'status', status,
                'time', time
              )) AS commissionDetails
           FROM betting_commission 
           WHERE status = 1 
           AND sender_phone = ? 
           AND phone = ?
           AND time BETWEEN FROM_UNIXTIME(? / 1000) AND FROM_UNIXTIME(? / 1000)`,
        [user.phone, phone, startTime, endTime]
      );

      const totalCommission = commissionData.length
        ? commissionData[0].total_commission
        : 0;

      const children = await fetchReferralsUser(
        user.code,
        level + 1,
        maxLevel,
        date,
        phone
      );

      return {
        ...user,
        levelData: level,
        rechargeTotal: parseInt(rechargeTotal),
        totalBetting: parseFloat(totalBetting),
        totalCommission: parseFloat(totalCommission),
        children,
        rechargeData,
        bettingData,
        commissionData,
      };
    })
  );

  return nestedReferrals;
};

const listMyTeam = async (req, res) => {
  const timeNow = new Date();
  let auth = req.cookies.auth; // Auth validation (Aap isse customize kar sakte hain)

  // `date` query parameter ko fetch kar rahe hain, agar nahi hai toh today ka date set kar rahe hain
  const dateParam = req.query.date || timeNow.toISOString().split("T")[0]; // Format YYYY-MM-DD
  console.log("Date Parameter: ", dateParam); // Check the date being passed

  if (!auth) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }

  try {
    // User info fetch kar rahe hain
    const [rows] = await connection.query(
      "SELECT * FROM users WHERE `token` = ?",
      [auth]
    );

    if (!rows.length) {
      return res.status(200).json({
        message: "Failed",
        status: false,
        timeStamp: new Date().toISOString(),
      });
    }

    const userInfo = rows[0];
    const referralTree = await fetchReferrals(userInfo.code);

    let totalBetAmountallUser = 0; // This will sum money for all users (direct and indirect)

    // Recursive function to process referral tree and accumulate total bet amount
    const processReferralData = async (referralTree, dateParam) => {
      const allData = [];

      for (const user of referralTree) {
        // Fetch the total money and total fee for each user
        const [rows] = await connection.query(
          "SELECT COUNT(*) as totalCount, SUM(money) as totalMoney, SUM(fee) as totalFee FROM minutes_1 WHERE phone = ? AND DATE(today) = ?",
          [user.phone, dateParam]
        );

        const totalCount = Number(rows[0]?.totalCount) || 0;
        const totalMoney = Number(rows[0]?.totalMoney) || 0;
        const totalFee = Number(rows[0]?.totalFee) || 0;

        // Accumulate the total bet amount for the current user and their children
        totalBetAmountallUser += totalMoney + totalFee;

        console.log(
          `User: ${user.phone}, Total Money: ${totalMoney}, Total Fee: ${totalFee}`
        );
        console.log("Total Bet Amount for this user: ", totalBetAmountallUser);

        // Process children recursively if they exist
        let childrenData = [];
        if (user.children && user.children.length > 0) {
          childrenData = await processReferralData(user.children, dateParam);
        }

        allData.push({
          ...user,
          totalCount,
          totalMoney,
          totalFee,
          children: childrenData, // Add children's data recursively
        });
      }

      return allData;
    };

    // Now, process the referral tree and accumulate data
    const AllData = await processReferralData(referralTree, dateParam);

    console.log("All Data: ", AllData);

    let phoneNumbers = [];

    // Phone numbers ko extract kar rahe hain
    const extractPhoneNumbers = (data) => {
      data.forEach((item) => {
        if (item.phone) {
          phoneNumbers.push(item.phone);
        }
        if (item.children && item.children.length > 0) {
          extractPhoneNumbers(item.children); // Recursively extract from children
        }
      });
    };

    extractPhoneNumbers(AllData);

    let totalBetAmount = 0;
    let totalBetCount = 0;

    // Phone numbers ke liye betting commission data fetch kar rahe hain
    const processPhoneNumbers = async () => {
      const [query] = await connection.query(
        "SELECT IFNULL(SUM(amount), 0) AS total_sum FROM betting_commission WHERE phone = ? AND DATE(today) = ?",
        [userInfo.phone, dateParam]
      );

      totalBetAmount += Number(query[0]?.total_sum ?? 0); // NULL ko 0 mein convert karna
    };

    (async () => {
      try {
        await processPhoneNumbers();

        console.log("Total Bet Amount (All Users): ", totalBetAmountallUser);
        console.log("Total Bet Amount (Commission): ", totalBetAmount);
        console.log("Total Bet Count: ", totalBetCount);

        res.status(200).json({
          message: "Success",
          status: true,
          timeStamp: new Date().toISOString(),
          data: AllData,
          phone: phoneNumbers,
          totaBetAmount: totalBetAmountallUser, // Total Bet Amount
          totalBetCommissionAmount: totalBetAmount, // Total Commission Amount
        });
      } catch (error) {
        console.error("Error processing phone numbers:", error);
        res.status(500).json({
          message: "Failed to process phone numbers",
          status: false,
          error: error.message,
        });
      }
    })();
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal Server Error",
      status: false,
    });
  }
};

const fetchReferrals = async (inviteCode, level = 1, maxLevel = 10) => {
  if (level > maxLevel) {
    return [];
  }

  const [referrals] = await connection.query(
    "SELECT * FROM users WHERE invite = ?",
    [inviteCode]
  );

  if (!referrals.length) {
    return [];
  }

  const nestedReferrals = await Promise.all(
    referrals.map(async (user) => {
      const children = await fetchReferrals(user.code, level + 1, maxLevel);
      return { ...user, children };
    })
  );

  return nestedReferrals;
};

const wowpay = async (req, res) => {
  let auth = req.cookies.auth;
  let money = req.body.money;

  // Fetching the user's mobile number from the database using auth token

  // Your existing controller code here
};
// const recharge = async (req, res) => {
//     let auth = req.cookies.auth;
//     let money = req.body.money;
//     let type = req.body.type;
//     let typeid = req.body.typeid;

//     if (type != 'cancel') {
//         if (!auth || !money || money < 99) {
//             return res.status(200).json({
//                 message: 'Failed',
//                 status: false,
//                 timeStamp: timeNow,
//             })
//         }
//     }
//     const [user] = await connection.query('SELECT `phone`, `code`,`name_user`,`invite` FROM users WHERE `token` = ? ', [auth]);
//     let userInfo = user[0];
//     if (!user) {
//         return res.status(200).json({
//             message: 'Failed',
//             status: false,
//             timeStamp: timeNow,
//         });
//     };
//     if (type == 'cancel') {
//         await connection.query('UPDATE recharge SET status = 2 WHERE phone = ? AND id_order = ? AND status = ? ', [userInfo.phone, typeid, 0]);
//         return res.status(200).json({
//             message: 'Cancelled order successfully',
//             status: true,
//             timeStamp: timeNow,
//         });
//     }
//     const [recharge] = await connection.query('SELECT * FROM recharge WHERE phone = ? AND status = ? ', [userInfo.phone, 0]);
//     if (recharge.length == 0) {
//         let time = new Date().getTime();
//         const date = new Date();
//         function formateT(params) {
//             let result = (params < 10) ? "0" + params : params;
//             return result;
//         }

//         function timerJoin(params = '', addHours = 0) {
//             let date = '';
//             if (params) {
//                 date = new Date(Number(params));
//             } else {
//                 date = new Date();
//             }

//             date.setHours(date.getHours() + addHours);

//             let years = formateT(date.getFullYear());
//             let months = formateT(date.getMonth() + 1);
//             let days = formateT(date.getDate());

//             let hours = date.getHours() % 12;
//             hours = hours === 0 ? 12 : hours;
//             let ampm = date.getHours() < 12 ? "AM" : "PM";

//             let minutes = formateT(date.getMinutes());
//             let seconds = formateT(date.getSeconds());

//             return years + '-' + months + '-' + days + ' ' + hours + ':' + minutes + ':' + seconds + ' ' + ampm;
//         }
//         let checkTime = timerJoin(time);
//         let id_time = date.getUTCFullYear() + '' + date.getUTCMonth() + 1 + '' + date.getUTCDate();
//         let id_order = Math.floor(Math.random() * (99999999999999 - 10000000000000 + 1)) + 10000000000000;
//         // let vat = Math.floor(Math.random() * (2000 - 0 + 1) ) + 0;

//         money = Number(money);
//         let client_transaction_id = id_time + id_order;
//         const formData = {
//             username: process.env.accountBank,
//             secret_key: process.env.secret_key,
//             client_transaction: client_transaction_id,
//             amount: money,
//         }

//         if (type == 'momo') {
//             const sql = `INSERT INTO recharge SET
//             id_order = ?,
//             transaction_id = ?,
//             phone = ?,
//             money = ?,
//             type = ?,
//             status = ?,
//             today = ?,
//             url = ?,
//             time = ?`;
//             await connection.execute(sql, [client_transaction_id, 'NULL', userInfo.phone, money, type, 0, checkTime, 'NULL', time]);
//             const [recharge] = await connection.query('SELECT * FROM recharge WHERE phone = ? AND status = ? ', [userInfo.phone, 0]);
//             return res.status(200).json({
//                 message: 'Received successfully',
//                 datas: recharge[0],
//                 status: true,
//                 timeStamp: timeNow,
//             });
//         }
//         const moneyString = money.toString();

//         const apiData = {
//             key: "0b295b3b-0383-4d94-abce-de44fddaeefb",
//             client_txn_id: client_transaction_id,
//             amount: moneyString,
//             p_info: '91 Lottery Recharge',
//             customer_name: userInfo.name_user,
//             customer_email: 'contact@91lottery.asia',
//             customer_mobile: userInfo.phone,
//             redirect_url: "https://91lottery.asia/wallet/rechargerecord",
//             udf1: '91 Lottery',
//         };
//         try {
//             const apiResponse = await axios.post('https://api.ekqr.in/api/create_order', apiData);
//             if (apiResponse.data.status == true) {
//                 const sql = `INSERT INTO recharge SET
//                 id_order = ?,
//                 transaction_id = ?,
//                 phone = ?,
//                 money = ?,
//                 type = ?,
//                 status = ?,
//                 today = ?,
//                 url = ?,
//                 time = ?`;
//                 await connection.execute(sql, [client_transaction_id, '0', userInfo.phone, money, type, 0, checkTime, '0', timeNow]);
//                 const [recharge] = await connection.query('SELECT * FROM recharge WHERE phone = ? AND status = ? ', [userInfo.phone, 0]);
//                 return res.status(200).json({
//                     message: 'Received successfully',
//                     datas: recharge[0],
//                     payment_url: apiResponse.data.data.payment_url,
//                     status: true,
//                     timeStamp: timeNow,
//                 });
//             } else {
//                 return res.status(500).json({ message: 'Failed to create order', status: false });
//             }
//         } catch (error) {
//             console.error('API request failed:', error);
//             return res.status(500).json({ message: 'API request failed', status: false });
//         }
//     } else {
//         return res.status(200).json({
//             message: 'Received successfully',
//             datas: recharge[0],
//             status: true,
//             timeStamp: timeNow,
//         });
//     }

// }

// const recharge = async (req, res) => {
//     let auth = req.cookies.auth;
//     let rechid = req.cookies.orderid;
//     let money = req.body.money;
//     let type = req.body.ptype;
//     // let typeid = req.body.typeid;
//     let status = 1;
//     // let txnId = req.body.trx;

//     console

//     if (type != 'cancel' && type != 'submit' && type != 'submitauto' && type != 'online') {
//         if (!auth || !money || money <= 99) {
//             return res.status(200).json({
//                 message: 'Minimum recharge 100',
//                 status: false,
//                 timeStamp: timeNow,
//             })
//         }
//     }
//     const [user] = await connection.query('SELECT `phone`, `code`,`id_user` ,`invite` FROM users WHERE `token` = ?', [auth]);
//     let userInfo = user[0];
//     console.log("this is user info :" + userInfo)
//     if (!user) {
//         return res.status(200).json({
//             message: 'Failed',
//             status: false,
//             timeStamp: timeNow,
//         });
//     };
//     if (type == 'submit') {
//     console.log("this is user info :" + userInfo)

//         const [utrcount] = await connection.query('SELECT * FROM recharge WHERE utr = ? ', [utr]);
//       if (utrcount.length == 0 ) {
//             await connection.query('UPDATE recharge SET utr = ? WHERE phone = ? AND status = ? ', [utr, userInfo.phone, 0]);
//             return res.status(200).json({
//                 message: 'Submit successful',
//                 status: true,
//                 timeStamp: timeNow,
//             });
//         } else {
//             return res.status(200).json({
//                 message: 'UTR already submitted',
//                 status: true,
//                 timeStamp: timeNow,
//             });
//         }
//     }

//     if (type == 'online'){

//         if(status == 1)
//         {
//             connection.query('Update recharge set status = ? where id_order =?' , [status , txnId] )
//             const info = await connection.query(`SELECT * FROM recharge WHERE id_order = ?`, [txnId]);

//         //     await connection.query('UPDATE users SET money = money + ?, total_money = total_money + ? WHERE phone = ?', [info[0].money, info[0].money, info[0].phone]);
//         //     return res.status(200).json({
//         //         message: 'Submit successful',
//         //         status: true,
//         //         timeStamp: timeNow,
//         // });
//      }
//      else{
//         await connection.query(`UPDATE recharge SET status = 2 WHERE utr = ?`, [utr]);

//                     return res.status(200).json({
//                         message: 'Transaction Cancelled',
//                         status: true,
//                         timeStamp: timeNow,
//                     });
//      }

//     }

//     if (type === 'submitauto') {
//         try {
//             const [utrcount] = await connection.query('SELECT * FROM recharge WHERE utr = ?', [utr]);

//             if (utrcount.length === 0) {
//                 await connection.query('UPDATE recharge SET utr = ? WHERE phone = ? AND id_order = ? AND status = ?', [utr, userInfo.phone, typeid, 0]);

//                 const url = 'https://payments-tesseract.bharatpe.in/api/v1/merchant/transactions';
//                 const twoDaysAgo = Date.now() - (2 * 24 * 60 * 60 * 1000);
//                 const params = {
//                     'module': 'PAYMENT_QR',
//                     'merchantId': process.env.merchant, // your merchant key
//                     'sDate': twoDaysAgo,
//                     'eDate': Date.now(),
//                 };

//                 const headers = {
//                     'accept': 'application/json, text/javascript, */*; q=0.01',
//                     'accept-encoding': 'gzip, deflate, br',
//                     'accept-language': 'en-US,en;q=0.9,it;q=0.8',
//                     'sec-fetch-mode': 'cors',
//                     'sec-fetch-site': 'same-site',
//                     'token': process.env.secret_key, // your login token
//                     'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36 Edg/110.0.1587.63',
//                 };

//                 const queryString = new URLSearchParams(params).toString();
//                 const url2 = url + '?' + queryString;

//                 const response = await fetch(url2, { headers });
//                 const data = await response.json();
//                 const [info] = await connection.query(`SELECT * FROM recharge WHERE id_order = ?`, [typeid]);
//                 const transaction = data.data.transactions.find((t) => t.bankReferenceNo === utr && t.amount === info[0].money);

//                 if (transaction) {
//                     console.log('Transaction found:', transaction);
//                     await connection.query(`UPDATE recharge SET status = 1 WHERE utr = ?`, [utr]);
//                     console.log("money" + info[0].money + ",phone" + info[0].phone);
//                     await connection.query('UPDATE users SET money = money + ? WHERE phone = ?', [info[0].money, info[0].phone]);

//                     return res.status(200).json({
//                         message: 'Submit successful',
//                         status: true,
//                         timeStamp: timeNow,
//                     });
//                 } else {
//                     await connection.query(`UPDATE recharge SET status = 2 WHERE utr = ?`, [utr]);

//                     return res.status(200).json({
//                         message: 'Invalid utr',
//                         status: true,
//                         timeStamp: timeNow,
//                     });
//                 }
//             } else {
//                 return res.status(200).json({
//                     message: 'UTR already submitted',
//                     status: true,
//                     timeStamp: timeNow,
//                 });
//             }
//         } catch (error) {
//             console.error(error);
//             return res.status(500).json({
//                 message: 'Internal server error',
//                 status: false,
//                 timeStamp: timeNow,
//             });
//         }
//     }

//     let time = new Date().getTime();
//     const date = new Date();
//     function formateT(params) {
//         let result = (params < 10) ? "0" + params : params;
//         return result;
//     }

//     function timerJoin(params = '') {
//         let date = '';
//         if (params) {
//             date = new Date(Number(params));
//         } else {
//             date = new Date();
//         }
//         let years = formateT(date.getFullYear());
//         let months = formateT(date.getMonth() + 1);
//         let days = formateT(date.getDate());
//         return years + '-' + months + '-' + days;
//     }
//     let checkTime = timerJoin(time);
//     let id_time = date.getUTCFullYear() + '' + date.getUTCMonth() + 1 + '' + date.getUTCDate();
//     let id_order = Math.floor(Math.random() * (99999999999999 - 10000000000000 + 1)) + 10000000000000;
//     // let vat = Math.floor(Math.random() * (2000 - 0 + 1) ) + 0;

//     money = Number(money);
//     let client_transaction_id = id_time + id_order;

//     const [trxcount] = await connection.query('SELECT * FROM recharge WHERE transaction_id = ? ', [txnId]);

//     if(trxcount.length > 0){
//          return res.status(200).json({
//             message: 'Transtion Id Already Exist',
//             status: true,
//             timeStamp: timeNow,
//         });
//     }

//     console.log(txnId, money)
//     console.log(client_transaction_id, txnId, userInfo.id_user, userInfo.phone, money, type, 0, 1 ,checkTime, '0', time)

//     const sql = `INSERT INTO recharge SET
//     id_order = ?,
//     transaction_id = ?,
//     uid = ?,
//     phone = ?,
//     money = ?,
//     type = ?,
//     status = ?,
//     first_recharge = ?,
//     today = ?,
//     url = ?,
//     time = ?`;
//     const [userCount] = await connection.execute('SELECT * FROM recharge WHERE phone = ?', [userInfo.phone]);
//     if(userCount.length == 0) {
//         await connection.execute(sql, [client_transaction_id, txnId, userInfo.id_user, userInfo.phone, money, type, 0, 1 ,checkTime, '0', time]);
//         console.log(sql)
//         return res.status(200).json({
//             message: 'Order creation successful',
//             pay: true,
//             orderid: client_transaction_id,
//             status: true,
//             timeStamp: timeNow,
//         });
//     }
//     else{
//         await connection.execute(sql, [client_transaction_id, txnId, userInfo.id_user, userInfo.phone, money, type, 0, 0 ,checkTime, '0', time]);
//         return res.status(200).json({
//             message: 'Order creation successful',
//             pay: true,
//             orderid: client_transaction_id,
//             status: true,
//             timeStamp: timeNow,
//         });
//     }

// }

const currentDirectory = process.cwd();
const uploadDir = path.join(
  currentDirectory,
  "src",
  "public",
  "uploads",
  "images"
);

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // Specify the destination folder for uploads
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    ); // Set the filename
  },
});

const upload = multer({ storage: storage }).single("image");

const recharge = async (req, res) => {
  try {
    upload(req, res, async function (err) {
      if (err instanceof multer.MulterError) {
        console.error("Multer error:", err);
        // return res.status(400).json({ message: 'File upload error' });
      } else if (err) {
        console.error("Error uploading files:", err);
        // return res.status(500).json({ message: 'Internal server error' });
      }
      console.log("Incoming Request:", {
        body: req.body,
        //   file: req.file,
        cookies: req.cookies,
      });

      let auth = req.cookies.auth;
      let rechid = req.cookies.orderid;
      const { money, ptype, typeid, txnid } = req.body;
      // const file = req.file;
      let utr = req.body.utr;
      let order_id = req.body.orderid;
      let status = req.body.status;
      let type = ptype;

        if (type= "TRC20"){
            type = 'PAYTM'
        }
      console.log(auth, money, ptype, type, txnid, order_id);

      let time = new Date().getTime();
      const date = new Date();
      function formateT(params) {
        let result = params < 10 ? "0" + params : params;
        return result;
      }

      function timerJoin(params = "") {
        let date = "";
        if (params) {
          date = new Date(Number(params));
        } else {
          date = new Date();
        }
        let years = formateT(date.getFullYear());
        let months = formateT(date.getMonth() + 1);
        let days = formateT(date.getDate());
        return years + "-" + months + "-" + days;
      }
      let checkTime = timerJoin(time);
      let id_time =
        date.getUTCFullYear() +
        "" +
        date.getUTCMonth() +
        1 +
        "" +
        date.getUTCDate();
      let id_order =
        Math.floor(Math.random() * (99999999999999 - 10000000000000 + 1)) +
        10000000000000;

      if (
        type != "cancel" &&
        type != "submit" &&
        type != "submitauto" &&
        type != "online"
      ) {
        if (!auth || !money || money <= 299 ) {
          return res.status(200).json({
            message: "Minimum recharge 300",
            status: false,
            timeStamp: timeNow,
          });
        }
      }
      const [user] = await connection.query(
        "SELECT * FROM users WHERE `token` = ?",
        [auth]
      );
      let userInfo = user[0];
      console.log("this is user info :" + userInfo);
      if (!user) {
        return res.status(200).json({
          message: "Failed",
          status: false,
          timeStamp: timeNow,
        });
      }
      if (type == "submit") {
        const [utrcount] = await connection.query(
          "SELECT * FROM recharge WHERE utr = ? ",
          [utr]
        );
        if (utrcount.length == 0) {
          await connection.query(
            "UPDATE recharge SET utr = ? WHERE phone = ? AND id_order = ? AND status = ? ",
            [utr, userInfo.phone, typeid, 0]
          );
          return res.status(200).json({
            message: "Submit successful",
            status: true,
            timeStamp: timeNow,
          });
        } else {
          return res.status(200).json({
            message: "UTR already submitted",
            status: true,
            timeStamp: timeNow,
          });
        }
      }

      if (type == "online") {
        if (status == 1) {
          connection.query("Update recharge set status = ? where id_order =?", [
            status,
            txnid,
          ]);
          const info = await connection.query(
            `SELECT * FROM recharge WHERE id_order = ?`,
            [txnid]
          );

          //     await connection.query('UPDATE users SET money = money + ?, total_money = total_money + ? WHERE phone = ?', [info[0].money, info[0].money, info[0].phone]);
          //     return res.status(200).json({
          //         message: 'Submit successful',
          //         status: true,
          //         timeStamp: timeNow,
          // });
        } else {
          await connection.query(
            `UPDATE recharge SET status = 2 WHERE utr = ?`,
            [utr]
          );

          return res.status(200).json({
            message: "Transaction Cancelled",
            status: true,
            timeStamp: timeNow,
          });
        }
      }

      if (type === "submitauto") {
        try {
          console.log("autosubmit");

          const params = {
            merchantid: process.env.MERCHANT_ID,
            orderid: order_id,
            amount: money,
            name: userInfo.name_user,
            email: "customer@gmail.com",
            mobile: userInfo.phone,
            remark: "payment",
            type: "2",
            redirect_url: `https://lucky11.xyz/api/webapi/verifyPayment/${order_id}`,
          };

          console.log("Request Parameters:", JSON.stringify(params));

          const headers = {
            Accept: "application/json, text/javascript, */*; q=0.01",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US,en;q=0.9,it;q=0.8",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-site",
            Token: process.env.SECRET_KEY, // your login token
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36 Edg/110.0.1587.63",
            "Content-Type": "application/json",
          };

          console.log("Request Headers:", JSON.stringify(headers));

          // Send the params as raw JSON data with the correct Content-Type
          const response = await axios.post(
            "https://indianpay.co.in/admin/paynow",
            JSON.stringify(params),
            { headers }
          );

          // Log the response data
          console.log("Response Data:", JSON.stringify(response.data));

          const sql = `INSERT INTO crash_recharge SET
            id_order = ?,
            transaction_id = ?,
            uid = ?,
            phone = ?,
            image = ?,
            money = ?,
            type = ?,
            status = ?,
            first_recharge = ?,
            today = ?,
            url = ?,
            time = ?`;
          const [userCount] = await connection.execute(
            "SELECT * FROM recharge WHERE phone = ?",
            [userInfo.phone]
          );
          if (userCount.length == 0) {
            await connection.execute(sql, [
              order_id,
              0,
              userInfo.id_user,
              userInfo.phone,
              0,
              money,
              type,
              0,
              1,
              checkTime,
              "0",
              time,
            ]);
            console.log(sql);
            return res.status(200).json({
              message: "Order creation successful",
              pay: true,
              data: response.data,
              status: true,
              timeStamp: timeNow,
            });
          } else {
            await connection.execute(sql, [
              order_id,
              0,
              userInfo.id_user,
              userInfo.phone,
              0,
              money,
              type,
              0,
              0,
              checkTime,
              "0",
              time,
            ]);
            return res.status(200).json({
              message: "Order creation successful",
              pay: true,
              data: response.data,
              status: true,
              timeStamp: timeNow,
            });
          }
        } catch (error) {
          console.error(error);
          return res.status(500).json({
            message: "Internal server error",
            status: false,
            timeStamp: timeNow,
          });
        }
      }

      if (type == "kuberpay") {
        try {
          console.log("kuberpay");

          const data = {
            merchantid: "PAYIN1001",
            mobile: userInfo.phone,
            port: "104",
            orderid: order_id,
            amount: money,
            name: userInfo.name_user,
            email: "secondpay@gmail.com",
            remark: "payment",
            type: "kuberpay",
            redirect_url: `https://www.crunchyroll.com/`,
          };

          console.log("Request Parameters:", JSON.stringify(data));

          let config = {
            method: "post",
            maxBodyLength: Infinity,
            url: "https://dashboard.kuberpay.co.in/api/v1/payin",
            headers: {
              "Content-Type": "application/json",
            },
            maxRedirects: 0,
            data: data,
          };

          axios
            .request(config)
            .then(async (response) => {
              const sql = `INSERT INTO crash_recharge SET
            id_order = ?,
            transaction_id = ?,
            uid = ?,
            phone = ?,
            image = ?,
            money = ?,
            type = ?,
            status = ?,
            first_recharge = ?,
            today = ?,
            url = ?,
            time = ?`;
              const [userCount] = await connection.execute(
                "SELECT * FROM recharge WHERE phone = ?",
                [userInfo.phone]
              );
              if (userCount.length == 0) {
                await connection.execute(sql, [
                  order_id,
                  0,
                  userInfo.id_user,
                  userInfo.phone,
                  0,
                  money,
                  type,
                  0,
                  1,
                  checkTime,
                  "0",
                  time,
                ]);
                console.log(sql);
                return res.status(200).json({
                  message: "Order creation successful",
                  pay: true,
                  data: response.data,
                  status: true,
                  timeStamp: timeNow,
                });
              } else {
                await connection.execute(sql, [
                  order_id,
                  0,
                  userInfo.id_user,
                  userInfo.phone,
                  0,
                  money,
                  type,
                  0,
                  0,
                  checkTime,
                  "0",
                  time,
                ]);
                return res.status(200).json({
                  message: "Order creation successful",
                  pay: true,
                  data: response.data,
                  status: true,
                  timeStamp: timeNow,
                });
              }
              // console.log(JSON.stringify(response.data));
            })
            .catch((error) => {
              console.log(error);
            });
        } catch (error) {
          console.error(error);
          return res.status(500).json({
            message: "Internal server error",
            status: false,
            timeStamp: timeNow,
          });
        }
      }

      // let vat = Math.floor(Math.random() * (2000 - 0 + 1) ) + 0;

      let client_transaction_id = id_time + id_order;

      const [trxcount] = await connection.query(
        "SELECT * FROM recharge WHERE transaction_id = ? ",
        [txnid]
      );

      if (trxcount.length > 0) {
        return res.status(200).json({
          message: "Transtion Id Already Exist",
          status: true,
          timeStamp: timeNow,
        });
      }

      console.log(txnid, money);
      console.log(
        client_transaction_id,
        txnid,
        userInfo.id_user,
        userInfo.phone,
        money,
        type,
        0,
        1,
        checkTime,
        "0",
        time
      );
      // const filepath = file.filename;
      // console.log(filepath);

      if (type != "submitauto") {
        const sql = `INSERT INTO recharge SET
    id_order = ?,
    transaction_id = ?,
    uid = ?,
    phone = ?,
    image = ?,
    money = ?,
    type = ?,
    status = ?,
    first_recharge = ?,
    today = ?,
    url = ?,
    time = ?`;
        const [userCount] = await connection.execute(
          "SELECT * FROM recharge WHERE phone = ?",
          [userInfo.phone]
        );
        if (userCount.length == 0) {
          await connection.execute(sql, [
            client_transaction_id,
            txnid,
            userInfo.id_user,
            userInfo.phone,
            null,
            money,
            type,
            0,
            1,
            checkTime,
            "0",
            time,
          ]);
          console.log(sql);
          return res.status(200).json({
            message: "Order creation successful",
            pay: true,
            orderid: client_transaction_id,
            status: true,
            timeStamp: timeNow,
          });
        } else {
          await connection.execute(sql, [
            client_transaction_id,
            txnid,
            userInfo.id_user,
            userInfo.phone,
            null,
            money,
            type,
            0,
            0,
            checkTime,
            "0",
            time,
          ]);
          return res.status(200).json({
            message: "Order creation successful",
            pay: true,
            orderid: client_transaction_id,
            status: true,
            timeStamp: timeNow,
          });
        }
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: "ERROR: " + error,
      status: false,
      timeStamp: timeNow,
    });
  }
};

const makePayment = async (req, res) => {
  try {
    const orderPayload = {
      merchant_id: process.env.MERCHANT_ID,
      amount: req.body.amount,
    };

    const response = await axios.post(
      `${process.env.GATEWAY_URL}/paynow`,
      orderPayload,
      {
        headers: {
          Authorization: `Bearer ${process.env.SECRET_KEY}`,
        },
      }
    );

    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error in creating order:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

const veriFyPayment = async (req, res) => {
  try {
    let userId = req.params.id;
    if (!res || typeof res.status !== "function") {
      throw new Error("`res` is not a valid response object.");
    }

    console.log("In the verify payment function");

    const response = await axios.get(
      `https://indianpay.co.in/admin/payinstatus?order_id=${userId}`
    );

    // Ensure `response.data.status` is a string before calling `.toLowerCase()`
    if (response.data && typeof response.data.status === "string") {
      const paymentStatus = response.data.status.toLowerCase();

      // Retrieve recharge information
      const [info] = await connection.query(
        `SELECT * FROM crash_recharge WHERE id_order = ? AND status = ?`,
        [userId, 0]
      );

      // Check if info[0] exists before proceeding
      if (!info || !info[0]) {
        return res.status(404).json({ message: "Recharge record not found" });
      }

      const information = info[0];

      // Redirect if payment status is 'cancelled'
      if (paymentStatus === "cancelled") {
        return res.redirect("/wallet/rechargerecord");
      } else {
        // Check all required fields are defined before executing the query
        const sql = `INSERT INTO recharge SET
                id_order = ?,
                transaction_id = ?,
                uid = ?,
                phone = ?,
                image = ?,
                money = ?,
                type = ?,
                status = ?,
                first_recharge = ?,
                today = ?,
                url = ?`;

        // Define default values for parameters that might be undefined
        const id_order = information.id_order || null;
        const transaction_id = 0; // assuming default transaction_id as 0 if undefined
        const uid = information.uid || null;
        const phone = information.phone || null;
        const image = 0; // assuming default image as 0 if undefined
        const money = information.money || 0;
        const type = information.type || null;
        const status = 0; // assuming default status as 0 if undefined
        const first_recharge = 1;
        const today = information.today || null;
        const url = "0";

        const [userCount] = await connection.execute(
          "SELECT * FROM recharge WHERE phone = ?",
          [phone]
        );
        if (userCount.length == 0) {
          await connection.execute(sql, [
            id_order,
            transaction_id,
            uid,
            phone,
            image,
            money,
            type,
            status,
            first_recharge,
            today,
            url,
          ]);
        } else {
          await connection.execute(sql, [
            id_order,
            transaction_id,
            uid,
            phone,
            image,
            money,
            type,
            status,
            0,
            today,
            url,
          ]);
        }

        const [rechargeInfo] = await connection.query(
          `SELECT * FROM recharge WHERE id_order = ? AND status = ?`,
          [userId, 0]
        );

        if (rechargeInfo[0].first_recharge === 1) {
          const [data] = await connection.query(`SELECT * FROM admin`);
          const [info2] = await connection.query(
            `SELECT * FROM users WHERE phone = ?`,
            [rechargeInfo[0].phone]
          );
          const [invite_user] = await connection.query(
            `SELECT * FROM users WHERE code = ?`,
            [info2[0].invite]
          );

          const first_recharge_bonus = money * (data[0].first_recharge / 100);

          let trans =
            "INSERT INTO transfer_money SET amount = ?, phone = ?,type=?, status = 2";
          await connection.query(trans, [
            first_recharge_bonus,
            rechargeInfo[0].phone,
            "first recharge bonus",
          ]);

          // Update recharge and user balance
          await connection.query(
            `UPDATE recharge SET status = 1, first_recharge = 0 WHERE id_order = ?`,
            [userId]
          );
          await connection.query(
            "UPDATE users SET money = money + ?, winning = winning + ? WHERE phone = ?",
            [
              rechargeInfo[0].money,
              rechargeInfo[0].money + first_recharge_bonus,
              rechargeInfo[0].phone,
            ]
          );

          const invite_bonus = data[0].invite_bonus;
          if (invite_user && invite_user[0] && invite_user[0].phone) {
            await connection.query(
              "UPDATE users SET winning = winning + ? WHERE phone = ?",
              [invite_bonus, invite_user[0].phone]
            );
          }

          return res.redirect("/wallet/rechargerecord");
        } else {
          await connection.query(
            `UPDATE recharge SET status = 1, first_recharge = 0 WHERE id_order = ?`,
            [userId]
          );
          await connection.query(
            "UPDATE users SET money = money + ?, winning = winning + ? WHERE phone = ?",
            [
              rechargeInfo[0].money,
              rechargeInfo[0].money,
              rechargeInfo[0].phone,
            ]
          );

          return res.redirect("/wallet/rechargerecord");
        }
      }
    }
  } catch (error) {
    console.error("Error in verifying payment:", error);

    // Send error response in case of exception
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const veriFyPayment2 = async (req, res) => {
  try {
    console.log("In the verify payment function");
  } catch (error) {
    console.error("Error in verifying payment:", error);

    // Send error response in case of exception
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const upd = async (req, res) => {
  const { auth, money, type, status, txnId } = req.body;

  if (!auth || !money || money <= 0) {
    return res
      .status(400)
      .json({ message: "Minimum recharge is 100", status: false });
  }

  // Your existing user validation logic...
  const [user] = await connection.query(
    "SELECT `phone` FROM users WHERE `token` = ?",
    [auth]
  );
  if (!user.length) {
    return res.status(400).json({ message: "User not found", status: false });
  }

  if (type === "online") {
    if (status === "1") {
      await connection.query(
        "UPDATE recharge SET status = ? WHERE id_order = ?",
        [status, txnId]
      );
      // Update user's wallet balance as per business rules
      res.status(200).json({ message: "Recharge successful", status: true });
    } else {
      await connection.query(
        "UPDATE recharge SET status = 2 WHERE id_order = ?",
        [txnId]
      );
      res.status(200).json({ message: "Transaction cancelled", status: true });
    }
  }
};

const addBank = async (req, res) => {
  let auth = req.cookies.auth;
  let type = req.body.type; // Add a type to differentiate between bank and upi
  let time = new Date().getTime();
  // Assuming 'stk' is needed for both types

  if (!auth) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: time,
    });
  }

  // Fetch user based on token
  const [user] = await connection.query(
    "SELECT `phone`, `code`, `invite` FROM users WHERE `token` = ?",
    [auth]
  );
  let userInfo = user[0];
  if (!userInfo) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: time,
    });
  }

  // Handle based on the type (bank or upi)
  if (type === "bank") {
    let name_bank = req.body.name_bank;
    let name_user = req.body.name_user;
    let email = req.body.email;
    let tinh = req.body.tinh;
    let stk = req.body.stk;

    if (!name_bank || !name_user || !email || !tinh || !stk) {
      return res.status(200).json({
        message: "Failed",
        status: false,
        timeStamp: time,
      });
    }

    // Check if bank details already exist
    const [user_bank] = await connection.query(
      "SELECT * FROM user_bank WHERE stk = ?",
      [stk]
    );
    const [user_bank2] = await connection.query(
      "SELECT * FROM user_bank WHERE phone = ?",
      [userInfo.phone]
    );

    if (user_bank.length == 0 && user_bank2.length == 0) {
      const sql = `INSERT INTO user_bank SET 
                phone = ?, 
                name_bank = ?, 
                name_user = ?, 
                stk = ?, 
                email = ?, 
                tinh = ?, 
                time = ?`;
      await connection.execute(sql, [
        userInfo.phone,
        name_bank,
        name_user,
        stk,
        email,
        tinh,
        time,
      ]);
      return res.status(200).json({
        message: "Successfully added bank",
        status: true,
        timeStamp: time,
      });
    } else if (user_bank.length > 0) {
      await connection.query("UPDATE user_bank SET stk = ? WHERE phone = ?", [
        stk,
        userInfo.phone,
      ]);
      return res.status(200).json({
        message: "Account number updated in the system",
        status: false,
        timeStamp: time,
      });
    } else if (user_bank2.length > 0) {
      await connection.query(
        "UPDATE user_bank SET name_bank = ?, name_user = ?, stk = ?, email = ?, tinh = ?, time = ? WHERE phone = ?",
        [name_bank, name_user, stk, email, tinh, time, userInfo.phone]
      );
      return res.status(200).json({
        message: "Your account is updated",
        status: false,
        timeStamp: time,
      });
    }
  } else if (type === "upi") {
    // Handle UPI-specific logic
    let upi = req.body.upi; // Assuming UPI ID is the required field

    if (!upi) {
      return res.status(200).json({
        message: "Failed",
        status: false,
        timeStamp: time,
      });
    }

    // Check if UPI details already exist
    const [user_upi] = await connection.query(
      "SELECT * FROM user_bank WHERE upi = ?",
      [upi]
    );
    const [user_upi2] = await connection.query(
      "SELECT * FROM user_bank WHERE phone = ?",
      [userInfo.phone]
    );

    if (user_upi.length == 0 && user_upi2.length == 0) {
      const sql = `INSERT INTO user_bank SET 
                phone = ?, 
                name_bank = 0, 
                name_user = 0, 
                stk = 0, 
                email = 0, 
                tinh = 0, 
                time = ?,
                upi = ? 
                `;
      await connection.execute(sql, [userInfo.phone, time, upi]);
      return res.status(200).json({
        message: "Successfully added UPI",
        status: true,
        timeStamp: time,
      });
    } else if (user_upi.length > 0) {
      await connection.query("UPDATE user_bank SET upi = ? WHERE phone = ?", [
        upi,
        userInfo.phone,
      ]);
      return res.status(200).json({
        message: "UPI ID updated in the system",
        status: false,
        timeStamp: time,
      });
    } else if (user_upi2.length > 0) {
      await connection.query(
        "UPDATE user_bank SET upi = ?, time = ? WHERE phone = ?",
        [upi, time, userInfo.phone]
      );
      return res.status(200).json({
        message: "Your UPI is updated",
        status: false,
        timeStamp: time,
      });
    }
  } else if (type === "TRC20") {
    // Handle UPI-specific logic
    let trc = req.body.trc; // Assuming UPI ID is the required field

    if (!trc) {
      return res.status(200).json({
        message: "Failed",
        status: false,
        timeStamp: time,
      });
    }

    // Check if UPI details already exist
    const [user_trc] = await connection.query(
      "SELECT * FROM user_bank WHERE trc = ?",
      [trc]
    );
    const [user_trc2] = await connection.query(
      "SELECT * FROM user_bank WHERE phone = ?",
      [userInfo.phone]
    );

    if (user_trc.length == 0 && user_trc2.length == 0) {
      const sql = `INSERT INTO user_bank SET 
                phone = ?, 
                name_bank = 0, 
                name_user = 0, 
                stk = 0, 
                email = 0, 
                tinh = 0, 
                time = ?,
                trc = ? 
                `;
      await connection.execute(sql, [userInfo.phone, time, trc]);
      return res.status(200).json({
        message: "Successfully added TRC20",
        status: true,
        timeStamp: time,
      });
    } else if (user_trc.length > 0) {
      await connection.query("UPDATE user_bank SET trc = ? WHERE phone = ?", [
        trc,
        userInfo.phone,
      ]);
      return res.status(200).json({
        message: "TRC20 updated in the system",
        status: false,
        timeStamp: time,
      });
    } else if (user_trc2.length > 0) {
      await connection.query(
        "UPDATE user_bank SET trc = ?, time = ? WHERE phone = ?",
        [trc, time, userInfo.phone]
      );
      return res.status(200).json({
        message: "Your TRC20 is updated",
        status: false,
        timeStamp: time,
      });
    }
  } else if (type === "BEP20") {
    // Handle UPI-specific logic
    let bep = req.body.bep; // Assuming UPI ID is the required field

    if (!bep) {
      return res.status(200).json({
        message: "Failed",
        status: false,
        timeStamp: time,
      });
    }

    // Check if UPI details already exist
    const [user_bep] = await connection.query(
      "SELECT * FROM user_bank WHERE bep = ?",
      [bep]
    );
    const [user_bep2] = await connection.query(
      "SELECT * FROM user_bank WHERE phone = ?",
      [userInfo.phone]
    );

    if (user_bep.length == 0 && user_bep2.length == 0) {
      const sql = `INSERT INTO user_bank SET 
                phone = ?, 
                name_bank = 0, 
                name_user = 0, 
                stk = 0, 
                email = 0, 
                tinh = 0, 
                time = ?,
                bep = ? 
                `;
      await connection.execute(sql, [userInfo.phone, time, bep]);
      return res.status(200).json({
        message: "Successfully added BEP20",
        status: true,
        timeStamp: time,
      });
    } else if (user_bep.length > 0) {
      await connection.query("UPDATE user_bank SET bep = ? WHERE phone = ?", [
        bep,
        userInfo.phone,
      ]);
      return res.status(200).json({
        message: "BEP20 updated in the system",
        status: false,
        timeStamp: time,
      });
    } else if (user_bep2.length > 0) {
      await connection.query(
        "UPDATE user_bank SET bep = ?, time = ? WHERE phone = ?",
        [bep, time, userInfo.phone]
      );
      return res.status(200).json({
        message: "Your BEP20 is updated",
        status: false,
        timeStamp: time,
      });
    }
  } else if (type === "NAGAD") {
    let nagad = req.body.nagad;
    if (!nagad) {
      return res.status(200).json({
        message: "Failed",
        status: false,
        timeStamp: time,
      });
    }

    // Check if UPI details already exist
    const [user_nagad] = await connection.query(
      "SELECT * FROM user_bank WHERE nagad = ?",
      [nagad]
    );
    const [user_nagad2] = await connection.query(
      "SELECT * FROM user_bank WHERE phone = ?",
      [userInfo.phone]
    );

    if (user_nagad.length == 0 && user_nagad2.length == 0) {
      const sql = `INSERT INTO user_bank SET 
                phone = ?, 
                name_bank = 0, 
                name_user = 0, 
                stk = 0, 
                email = 0, 
                tinh = 0, 
                time = ?,
                nagad = ? 
                `;
      await connection.execute(sql, [userInfo.phone, time, nagad]);
      return res.status(200).json({
        message: "Successfully added BEP20",
        status: true,
        timeStamp: time,
      });
    } else if (user_nagad.length > 0) {
      await connection.query("UPDATE user_bank SET nagad = ? WHERE phone = ?", [
        nagad,
        userInfo.phone,
      ]);
      return res.status(200).json({
        message: "NAGAD updated in the system",
        status: false,
        timeStamp: time,
      });
    } else if (user_nagad2.length > 0) {
      await connection.query(
        "UPDATE user_bank SET nagad = ?, time = ? WHERE phone = ?",
        [nagad, time, userInfo.phone]
      );
      return res.status(200).json({
        message: "Your nagad is updated",
        status: false,
        timeStamp: time,
      });
    }
  } else if (type === "BKASH") {
    let bkash = req.body.bkash;
    if (!bkash) {
      return res.status(200).json({
        message: "Failed",
        status: false,
        timeStamp: time,
      });
    }

    // Check if UPI details already exist
    const [user_bkash] = await connection.query(
      "SELECT * FROM user_bank WHERE bkash = ?",
      [bkash]
    );
    const [user_bkash2] = await connection.query(
      "SELECT * FROM user_bank WHERE phone = ?",
      [userInfo.phone]
    );

    if (user_bkash.length == 0 && user_bkash2.length == 0) {
      const sql = `INSERT INTO user_bank SET 
                phone = ?, 
                name_bank = 0, 
                name_user = 0, 
                stk = 0, 
                email = 0, 
                tinh = 0, 
                time = ?,
                bkash = ? 
                `;
      await connection.execute(sql, [userInfo.phone, time, bkash]);
      return res.status(200).json({
        message: "Successfully added BEP20",
        status: true,
        timeStamp: time,
      });
    } else if (user_bkash.length > 0) {
      await connection.query("UPDATE user_bank SET bkash = ? WHERE phone = ?", [
        bkash,
        userInfo.phone,
      ]);
      return res.status(200).json({
        message: "bkash updated in the system",
        status: false,
        timeStamp: time,
      });
    } else if (user_bkash2.length > 0) {
      await connection.query(
        "UPDATE user_bank SET bkash = ?, time = ? WHERE phone = ?",
        [bkash, time, userInfo.phone]
      );
      return res.status(200).json({
        message: "Your bkash is updated",
        status: false,
        timeStamp: time,
      });
    }
  } else {
    return res.status(200).json({
      message: "Invalid type",
      status: false,
      timeStamp: time,
    });
  }
};

const infoUserBank = async (req, res) => {
  let auth = req.cookies.auth;
  if (!auth) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }
  const [user] = await connection.query(
    "SELECT `phone`, `code`,`invite`, `money` FROM users WHERE `token` = ? ",
    [auth]
  );
  let userInfo = user[0];
  if (!user) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }
  function formateT(params) {
    let result = params < 10 ? "0" + params : params;
    return result;
  }

  function timerJoin(params = "", addHours = 0) {
    let date = "";
    if (params) {
      date = new Date(Number(params));
    } else {
      date = new Date();
    }

    date.setHours(date.getHours() + addHours);

    let years = formateT(date.getFullYear());
    let months = formateT(date.getMonth() + 1);
    let days = formateT(date.getDate());

    let hours = date.getHours() % 12;
    hours = hours === 0 ? 12 : hours;
    let ampm = date.getHours() < 12 ? "AM" : "PM";

    let minutes = formateT(date.getMinutes());
    let seconds = formateT(date.getSeconds());

    return (
      years +
      "-" +
      months +
      "-" +
      days +
      " " +
      hours +
      ":" +
      minutes +
      ":" +
      seconds +
      " " +
      ampm
    );
  }
  let date = new Date().getTime();
  let checkTime = timerJoin(date);
  const [recharge] = await connection.query(
    "SELECT * FROM recharge WHERE phone = ? AND status = 1",
    [userInfo.phone]
  );
  const [minutes_1] = await connection.query(
    "SELECT * FROM minutes_1 WHERE phone = ?",
    [userInfo.phone]
  );
  let total = 0;
  recharge.forEach((data) => {
    total += parseFloat(data.money);
  });
  let total2 = 0;
  minutes_1.forEach((data) => {
    total2 += parseFloat(data.money);
  });
  let fee = 0;
  minutes_1.forEach((data) => {
    fee += parseFloat(data.fee);
  });

  // result = Math.max(result, 0);
  let result = 0;
  if (total - total2 > 0) result = total - total2 - fee;

  const [userBank] = await connection.query(
    "SELECT * FROM user_bank WHERE phone = ? ",
    [userInfo.phone]
  );
  return res.status(200).json({
    message: "Received successfully",
    datas: userBank,
    userInfo: user,
    result: result,
    status: true,
    timeStamp: timeNow,
  });
};

// const withdrawal3 = async (req, res) => {
//     let auth = req.cookies.auth;
//     let money = req.body.money;
//     let type = req.body.type;
//     let password = req.body.password;

//     console.log(auth, money, type, password);
//     if (!auth || !money || !password || !type) {
//         return res.status(200).json({
//             message: 'Failed',
//             status: false,
//             timeStamp: timeNow,
//         });
//     }

//     const [user] = await connection.query('SELECT `phone`, `id_user`, `code`,`invite`, `money`, `winning` FROM users WHERE `token` = ? AND password = ?', [auth, md5(password)]);

//     if (user.length == 0) {
//         return res.status(200).json({
//             message: 'incorrect password',
//             status: false,
//             timeStamp: timeNow,
//         });
//     }

//     let userInfo = user[0];
//     const date = new Date();
//     let id_time = date.getUTCFullYear() + '' + (date.getUTCMonth() + 1) + '' + date.getUTCDate();
//     let id_order = Math.floor(Math.random() * (99999999999999 - 10000000000000 + 1)) + 10000000000000;

//     function formateT(params) {
//         return (params < 10) ? "0" + params : params;
//     }

//     function timerJoin(params = '', addHours = 0) {
//         let date = params ? new Date(Number(params)) : new Date();
//         date.setHours(date.getHours() + addHours);

//         let years = formateT(date.getFullYear());
//         let months = formateT(date.getMonth() + 1);
//         let days = formateT(date.getDate());
//         let hours = date.getHours() % 12 || 12;
//         let ampm = date.getHours() < 12 ? "AM" : "PM";
//         let minutes = formateT(date.getMinutes());
//         let seconds = formateT(date.getSeconds());

//         return `${years}-${months}-${days} ${hours}:${minutes}:${seconds} ${ampm}`;
//     }

//     let dates = new Date().getTime();
//     let checkTime = timerJoin(dates);
//     console.log(checkTime);

//     const [winning] = await connection.query('SELECT * FROM users WHERE phone = ? AND status = 1', [userInfo.phone]);
//     let total = winning.reduce((acc, data) => acc + parseFloat(data.winning), 0);
//     console.log(total);

//     let result = Math.max(total, 0);
//     console.log(result);

//     if (type === 'bank') {
//         const [user_bank] = await connection.query('SELECT * FROM user_bank WHERE `phone` = ?', [userInfo.phone]);
//         const [user_bank_check] = await connection.query(`
//             SELECT * FROM user_bank
//             WHERE phone = ?
//             AND stk != '0'
//             AND name_bank != '0'
//             AND email != '0'
//             AND name_user != '0'
//         `, [userInfo.phone]);

//         const [withdraw] = await connection.query('SELECT * FROM withdraw WHERE `phone` = ? AND today = ?', [userInfo.phone, checkTime]);

//         if (user_bank.length != 0) {
//           if(user_bank_check.length > 0){
//             console.log(user_bank_check[0])
//             if (withdraw.length < 3) {
//                 if (userInfo.winning - money >= 0) {
//                     if (result > 0) {
//                         if (result < money) {
//                             return res.status(200).json({
//                                 message: 'Insufficient funds to complete the transaction.',
//                                 status: false,
//                                 timeStamp: timeNow,
//                             });
//                         } else {
//                             let infoBank = user_bank[0];
//                             console.log("Bank Details :" + infoBank);

//                             const idOrder = id_time + '' + id_order || null;
//                             const sql = `INSERT INTO withdraw SET
//                                 id_order = ?,
//                                 uid = ?,
//                                 phone = ?,
//                                 money = ?,
//                                 type = ?,
//                                 wallet = ?,
//                                 stk = ?,
//                                 name_bank = ?,
//                                 ifsc = ?,
//                                 name_user = ?,
//                                 status = ?,
//                                 today = ?,
//                                 time = ?`;
//                             await connection.execute(sql, [idOrder, userInfo.id_user, userInfo.phone, money, type, 0, user_bank[0].stk, user_bank[0].name_bank, user_bank[0].email, user_bank[0].name_user, 0, checkTime, dates]);
//                             await connection.query('UPDATE users SET  winning = winning - ? WHERE phone = ? ', [ money, userInfo.phone]);

//                             return res.status(200).json({
//                                 message: 'Withdrawal successful',
//                                 status: true,
//                                 money: userInfo.winning - money,
//                                 timeStamp: timeNow,
//                             });
//                         }
//                     } else {
//                         return res.status(200).json({
//                             message: 'The total bet is not enough to fulfill the request',
//                             status: false,
//                             timeStamp: timeNow,
//                         });
//                     }
//                 } else {
//                     return res.status(200).json({
//                         message: 'The balance is not enough to fulfill the request ',
//                         status: false,
//                         timeStamp: timeNow,
//                     });
//                 }
//             } else {
//                 return res.status(200).json({
//                     message: 'You can only make 3 withdrawals per day',
//                     status: false,
//                     timeStamp: timeNow,
//                 });
//             }
//           }else{
//             return res.status(200).json({
//                 message: 'Please Fill Full bank Details',
//                 status: false,
//                 timeStamp: timeNow,
//             });
//           }
//         } else {
//             return res.status(200).json({
//                 message: 'Please link your bank first',
//                 status: false,
//                 timeStamp: timeNow,
//             });
//         }
//     }if (type === 'submitAuto') {
//         const [user_bank] = await connection.query('SELECT * FROM user_bank WHERE `phone` = ?', [userInfo.phone]);
//         const [user_bank_check] = await connection.query(`
//             SELECT * FROM user_bank
//             WHERE phone = ?
//             AND stk != '0'
//             AND name_bank != '0'
//             AND email != '0'
//             AND name_user != '0'
//         `, [userInfo.phone]);

//         const [withdraw] = await connection.query('SELECT * FROM withdraw WHERE `phone` = ? AND today = ?', [userInfo.phone, checkTime]);

//         if (user_bank.length != 0) {
//           if(user_bank_check.length > 0){
//             console.log(user_bank_check[0])
//             if (withdraw.length < 3) {
//                 if (userInfo.winning - money >= 0) {
//                     if (result > 0) {
//                         if (result < money) {
//                             return res.status(200).json({
//                                 message: 'Insufficient funds to complete the transaction.',
//                                 status: false,
//                                 timeStamp: timeNow,
//                             });
//                         } else {
//                             try {
//                                 let infoBank = user_bank[0];
//                                 console.log("Bank Details :" + infoBank);
//                                 const idOrder = id_order  || null;

//                                 const newData =  {
//                                     "merchant_id": "INDIANPAY00INDIANPAY0089",
//                                     "merchant_token":"mYCHvMl8vkDlGE9aXp08BPUOYuVnddpM",
//                                     "account_no": user_bank[0].stk,
//                                     "ifsccode": user_bank[0].email,
//                                     "amount":money,
//                                     "bankname": user_bank[0].name_bank,
//                                     "remark":"withdraw",
//                                     "orderid": idOrder,
//                                     "name": user_bank[0].name_user,
//                                     "contact": userInfo.phone,
//                                     "email":"customer@gmail.com"
//                                     }

//                                 // const newData = {
//                                 //     "merchant_id": "INDIANPAY00INDIANPAY0089",
//                                 //     "merchant_token": "mYCHvMl8vkDlGE9aXp08BPUOYuVnddpM",
//                                 //     "account_no": "51110834067",
//                                 //     "ifsccode": "SBIN0032304",
//                                 //     "amount": "10",
//                                 //     "bankname": "STATE BANK OF INDIA",
//                                 //     "remark": "withdraw",
//                                 //     "orderid": "73522031736",
//                                 //     "name": "MANISH SHARMA",
//                                 //     "contact": "9887371371",
//                                 //     "email": "customer@gmail.com"
//                                 // };

//                                 console.log(newData)

//                                 const base64Encoded = base64url.encode(JSON.stringify(newData));

//                                 // const base64Encoded = Buffer.from(JSON.stringify(newData)).toString('base64');

//                                 console.log("Base64 Encoded JSON:", base64Encoded);

//                                 // Make the API request
//                                 // try {
//                                 //     const response = await axios.post('https://indianpay.co.in/admin/single_transaction', `${base64Encoded}`);
//                                 //     if (response.status === 200) {
//                                 //         console.log("Payment success:", response.data);
//                                 //     } else {
//                                 //         console.log("Errors:", response.status, response.statusText);
//                                 //     }
//                                 // } catch (error) {
//                                 //     console.error("Request failed:", error.message);
//                                 // }

//                                 let data = JSON.stringify({
//                                   "salt": `${base64Encoded}`
//                                 });

//                                 let config = {
//                                   method: 'post',
//                                   maxBodyLength: Infinity,
//                                   url: 'https://indianpay.co.in/admin/single_transaction',
//                                   headers: {
//                                     'Content-Type': 'application/json',
//                                     'Cookie': 'ci_session=m6s71j7euvdliifn5q2skpjchedq1lr8'
//                                   },
//                                   data : data
//                                 };

//                                 axios.request(config)
//                                 .then((response) => {
//                                   console.log(JSON.stringify(response.data));

//                                 })
//                                 .catch((error) => {
//                                   console.log(error);
//                                 });

//                                 const sql = `INSERT INTO withdraw SET
//                                     id_order = ?,
//                                     uid = ?,
//                                     phone = ?,
//                                     money = ?,
//                                     type = ?,
//                                     wallet = ?,
//                                     stk = ?,
//                                     name_bank = ?,
//                                     ifsc = ?,
//                                     name_user = ?,
//                                     status = ?,
//                                     today = ?,
//                                     time = ?`;
//                                 await connection.execute(sql, [idOrder, userInfo.id_user, userInfo.phone, money, type, 0, user_bank[0].stk, user_bank[0].name_bank, user_bank[0].email, user_bank[0].name_user, 1, checkTime, dates]);
//                                 await connection.query('UPDATE users SET  winning = winning - ? WHERE phone = ? ', [ money, userInfo.phone]);

//                                 return res.status(200).json({
//                                     message: 'Withdrawal successful',
//                                     status: true,
//                                     money: userInfo.winning - money,
//                                     timeStamp: timeNow,
//                                 });
//                             } catch (error) {
//                                 return res.status(200).json({
//                                     message: error ,
//                                     status: false,
//                                     money: userInfo.winning - money,
//                                     timeStamp: timeNow,
//                                 });
//                             }

//                         }
//                     } else {
//                         return res.status(200).json({
//                             message: 'The total bet is not enough to fulfill the request',
//                             status: false,
//                             timeStamp: timeNow,
//                         });
//                     }
//                 } else {
//                     return res.status(200).json({
//                         message: 'The balance is not enough to fulfill the request ',
//                         status: false,
//                         timeStamp: timeNow,
//                     });
//                 }
//             } else {
//                 return res.status(200).json({
//                     message: 'You can only make 3 withdrawals per day',
//                     status: false,
//                     timeStamp: timeNow,
//                 });
//             }
//           }else{
//             return res.status(200).json({
//                 message: 'Please Fill Full bank Details',
//                 status: false,
//                 timeStamp: timeNow,
//             });
//           }
//         } else {
//             return res.status(200).json({
//                 message: 'Please link your bank first',
//                 status: false,
//                 timeStamp: timeNow,
//             });
//         }
//     } else if (type === 'upi') {
//         const [user_bank] = await connection.query('SELECT * FROM user_bank WHERE `phone` = ?', [userInfo.phone]);
//         const [withdraw] = await connection.query('SELECT * FROM withdraw WHERE `phone` = ? AND today = ?', [userInfo.phone, checkTime]);
//         const [user_bank_check] = await connection.query(`
//             SELECT * FROM user_bank
//             WHERE phone = ?
//             AND upi != '0'
//         `, [userInfo.phone]);
//         if (user_bank.length != 0) {
//           if(user_bank_check.length > 0){
//             console.log(user_bank_check[0])
//             if (withdraw.length < 3) {
//                 if (userInfo.winning - money >= 0) {
//                     if (result > 0) {
//                         if (result < money) {
//                             return res.status(200).json({
//                                 message: 'Insufficient funds to complete the transaction.',
//                                 status: false,
//                                 timeStamp: timeNow,
//                             });
//                         } else {
//                             let infoBank = user_bank[0];
//                             console.log("Bank Details :" + infoBank);

//                             const idOrder = id_time + '' + id_order || null;
//                             const sql = `INSERT INTO withdraw SET
//                                 id_order = ?,
//                                 uid = ?,
//                                 phone = ?,
//                                 money = ?,
//                                 type = ?,
//                                 wallet = ?,
//                                 stk = ?,
//                                 name_bank = ?,
//                                 ifsc = ?,
//                                 name_user = ?,
//                                 status = ?,
//                                 today = ?,
//                                 time = ?`;
//                             await connection.execute(sql, [idOrder, userInfo.id_user, userInfo.phone, money, type, user_bank[0].upi, 0, 0, 0, 0, 0, checkTime, dates]);
//                             await connection.query('UPDATE users SET winning = winning - ? WHERE phone = ? ', [money, userInfo.phone]);

//                             return res.status(200).json({
//                                 message: 'Withdrawal successful',
//                                 status: true,
//                                 money: userInfo.winning - money,
//                                 timeStamp: timeNow,
//                             });
//                         }
//                     } else {
//                         return res.status(200).json({
//                             message: 'The total bet is not enough to fulfill the request',
//                             status: false,
//                             timeStamp: timeNow,
//                         });
//                     }
//                 } else {
//                     return res.status(200).json({
//                         message: 'The balance is not enough to fulfill the request ',
//                         status: false,
//                         timeStamp: timeNow,
//                     });
//                 }
//             } else {
//                 return res.status(200).json({
//                     message: 'You can only make 3 withdrawals per day',
//                     status: false,
//                     timeStamp: timeNow,
//                 });
//             }
//         }else{
//             return res.status(200).json({
//                 message: 'Please link your UPI first',
//                 status: false,
//                 timeStamp: timeNow,
//             });
//         }
//         } else {
//             return res.status(200).json({
//                 message: 'Please link your UPI first',
//                 status: false,
//                 timeStamp: timeNow,
//             });
//         }
//     } else if (type === 'BEP20') {
//         const [user_bank] = await connection.query('SELECT * FROM user_bank WHERE `phone` = ?', [userInfo.phone]);
//         const [withdraw] = await connection.query('SELECT * FROM withdraw WHERE `phone` = ? AND today = ?', [userInfo.phone, checkTime]);
//         const [user_bank_check] = await connection.query(`
//             SELECT * FROM user_bank
//             WHERE phone = ?
//             AND bep != '0'
//         `, [userInfo.phone]);
//         if (user_bank.length != 0) {
//           if(user_bank_check.length != 0){
//             if (withdraw.length < 3) {
//                 if (userInfo.winning - money >= 0) {
//                     if (result > 0) {
//                         if (result < money) {
//                             return res.status(200).json({
//                                 message: 'Insufficient funds to complete the transaction.',
//                                 status: false,
//                                 timeStamp: timeNow,
//                             });
//                         } else {
//                             let infoBank = user_bank[0];
//                             console.log("Bank Details :" + infoBank);

//                             const idOrder = id_time + '' + id_order || null;
//                             userInfo
//                             const sql = `INSERT INTO withdraw SET
//                                 id_order = ?,
//                                 uid = ?,
//                                 phone = ?,
//                                 money = ?,
//                                 type = ?,
//                                 wallet = ?,
//                                 stk = ?,
//                                 name_bank = ?,
//                                 ifsc = ?,
//                                 name_user = ?,
//                                 status = ?,
//                                 today = ?,
//                                 time = ?`;
//                             await connection.execute(sql, [idOrder, userInfo.id_user, userInfo.phone, money, type, user_bank[0].bep, 0, 0, 0, 0, 0, checkTime, dates]);
//                             await connection.query('UPDATE users SET winning = winning - ? WHERE phone = ? ', [money, userInfo.phone]);

//                             return res.status(200).json({
//                                 message: 'Withdrawal successful',
//                                 status: true,
//                                 money: userInfo.winning - money,
//                                 timeStamp: timeNow,
//                             });
//                         }
//                     } else {
//                         return res.status(200).json({
//                             message: 'The total bet is not enough to fulfill the request',
//                             status: false,
//                             timeStamp: timeNow,
//                         });
//                     }
//                 } else {
//                     return res.status(200).json({
//                         message: 'The balance is not enough to fulfill the request ',
//                         status: false,
//                         timeStamp: timeNow,
//                     });
//                 }
//             } else {
//                 return res.status(200).json({
//                     message: 'You can only make 3 withdrawals per day',
//                     status: false,
//                     timeStamp: timeNow,
//                 });
//             }
//         }else{
//             return res.status(200).json({
//                 message: 'Please link your BEP20 Address first 111',
//                 status: false,
//                 timeStamp: timeNow,
//             });
//         }
//         } else {
//             return res.status(200).json({
//                 message: 'Please link your BEP20 Address first',
//                 status: false,
//                 timeStamp: timeNow,
//             });
//         }
//     }else if (type === 'TRC20') {
//         const [user_bank] = await connection.query('SELECT * FROM user_bank WHERE `phone` = ?', [userInfo.phone]);
//         const [withdraw] = await connection.query('SELECT * FROM withdraw WHERE `phone` = ? AND today = ?', [userInfo.phone, checkTime]);
//         const [user_bank_check] = await connection.query(`
//             SELECT * FROM user_bank
//             WHERE phone = ?
//             AND trc != '0'
//         `, [userInfo.phone]);
//         if (user_bank.length != 0) {
//           if(user_bank_check.length > 0){
//             if (withdraw.length < 3) {
//                 if (userInfo.winning - money >= 0) {
//                     if (result > 0) {
//                         if (result < money) {
//                             return res.status(200).json({
//                                 message: 'Insufficient funds to complete the transaction.',
//                                 status: false,
//                                 timeStamp: timeNow,
//                             });
//                         } else {
//                             let infoBank = user_bank[0];
//                             console.log("Bank Details :" + infoBank);

//                             const idOrder = id_time + '' + id_order || null;
//                             const sql = `INSERT INTO withdraw SET
//                                 id_order = ?,
//                                 uid = ?,
//                                 phone = ?,
//                                 money = ?,
//                                 type = ?,
//                                 wallet = ?,
//                                 stk = ?,
//                                 name_bank = ?,
//                                 ifsc = ?,
//                                 name_user = ?,
//                                 status = ?,
//                                 today = ?,
//                                 time = ?`;
//                             await connection.execute(sql, [idOrder, userInfo.id_user, userInfo.phone, money, type, user_bank[0].trc, 0, 0, 0, 0, 0, checkTime, dates]);
//                             await connection.query('UPDATE users SET winning = winning - ? WHERE phone = ? ', [money, userInfo.phone]);

//                             return res.status(200).json({
//                                 message: 'Withdrawal successful',
//                                 status: true,
//                                 money: userInfo.winning - money,
//                                 timeStamp: timeNow,
//                             });
//                         }
//                     } else {
//                         return res.status(200).json({
//                             message: 'The total bet is not enough to fulfill the request',
//                             status: false,
//                             timeStamp: timeNow,
//                         });
//                     }
//                 } else {
//                     return res.status(200).json({
//                         message: 'The balance is not enough to fulfill the request ',
//                         status: false,
//                         timeStamp: timeNow,
//                     });
//                 }
//             } else {
//                 return res.status(200).json({
//                     message: 'You can only make 3 withdrawals per day',
//                     status: false,
//                     timeStamp: timeNow,
//                 });
//             }
//         }else{
//             return res.status(200).json({
//                 message: 'Please link your TRC20 Address first',
//                 status: false,
//                 timeStamp: timeNow,
//             });
//         }
//         } else {
//             return res.status(200).json({
//                 message: 'Please link your TRC20 Address first',
//                 status: false,
//                 timeStamp: timeNow,
//             });
//         }
//     }else{
//         return res.status(200).json({
//             message: 'Invalid withdrawal type',
//             status: false,
//             timeStamp: timeNow,
//         });
//     }
// }

// const withdrawal3 = async (req, res) => {
//     let auth = req.cookies.auth;
//     let money = req.body.money;
//     let type = req.body.type;
//     // let password = req.body.password;

//     console.log(auth, money, type);
//     if (!auth || !money  || !type) {
//         return res.status(200).json({
//             message: 'Failed',
//             status: false,
//             timeStamp: timeNow,
//         });
//     }

//     const [user] = await connection.query('SELECT `phone`, `id_user`, `code`,`invite`, `money`, `winning` FROM users WHERE `token` = ? ', [auth]);

//     if (user.length == 0) {
//         return res.status(200).json({
//             message: 'incorrect password',
//             status: false,
//             timeStamp: timeNow,
//         });
//     }

//     let userInfo = user[0];
//     const date = new Date();
//     let id_time = date.getUTCFullYear() + '' + (date.getUTCMonth() + 1) + '' + date.getUTCDate();
//     let id_order = Math.floor(Math.random() * (99999999999999 - 10000000000000 + 1)) + 10000000000000;

//     function formateT(params) {
//         return (params < 10) ? "0" + params : params;
//     }

//     function timerJoin(params = '', addHours = 0) {
//         let date = params ? new Date(Number(params)) : new Date();
//         date.setHours(date.getHours() + addHours);

//         let years = formateT(date.getFullYear());
//         let months = formateT(date.getMonth() + 1);
//         let days = formateT(date.getDate());
//         let hours = date.getHours() % 12 || 12;
//         let ampm = date.getHours() < 12 ? "AM" : "PM";
//         let minutes = formateT(date.getMinutes());
//         let seconds = formateT(date.getSeconds());

//         return `${years}-${months}-${days} ${hours}:${minutes}:${seconds} ${ampm}`;
//     }

//     let dates = new Date().getTime();
//     let checkTime = timerJoin(dates);
//     console.log(checkTime);

//     const [winning] = await connection.query('SELECT * FROM users WHERE phone = ? AND status = 1', [userInfo.phone]);
//     let total = winning.reduce((acc, data) => acc + parseFloat(data.winning), 0);
//     let needToBetTotal = Number(winning[0].money);
//     console.log(total, needToBetTotal);

//     let result = Math.max(total, 0);
//     console.log(result);

// if (needToBetTotal <= 0) {
//     if (type === 'bank') {
//         const [user_bank] = await connection.query('SELECT * FROM user_bank WHERE `phone` = ?', [userInfo.phone]);
//         const [user_bank_check] = await connection.query(`
//             SELECT * FROM user_bank
//             WHERE phone = ?
//             AND stk != '0'
//             AND name_bank != '0'
//             AND email != '0'
//             AND name_user != '0'
//         `, [userInfo.phone]);

//         const [withdraw] = await connection.query('SELECT * FROM withdraw WHERE `phone` = ? AND DATE(`today`) = CURDATE()', [userInfo.phone]);

//         if (user_bank.length != 0) {
//           if(user_bank_check.length > 0){
//             console.log(user_bank_check[0])
//             if (withdraw.length < 3) {
//                 if (userInfo.winning - money >= 0) {
//                     if (result > 0) {
//                         if (result < money) {
//                             return res.status(200).json({
//                                 message: 'Insufficient funds to complete the transaction.',
//                                 status: false,
//                                 timeStamp: timeNow,
//                             });
//                         } else {
//                             let infoBank = user_bank[0];
//                             console.log("Bank Details :" + infoBank);

//                             const idOrder = id_time + '' + id_order || null;
//                             const sql = `INSERT INTO withdraw SET
//                                 id_order = ?,
//                                 uid = ?,
//                                 phone = ?,
//                                 money = ?,
//                                 type = ?,
//                                 wallet = ?,
//                                 stk = ?,
//                                 name_bank = ?,
//                                 ifsc = ?,
//                                 name_user = ?,
//                                 status = ?,
//                                 today = ?,
//                                 time = ?`;
//                             await connection.execute(sql, [idOrder, userInfo.id_user, userInfo.phone, money, type, 0, user_bank[0].stk, user_bank[0].name_bank, user_bank[0].email, user_bank[0].name_user, 0, checkTime, dates]);
//                             await connection.query('UPDATE users SET  winning = winning - ? WHERE phone = ? ', [ money, userInfo.phone]);

//                             return res.status(200).json({
//                                 message: 'Withdrawal successful',
//                                 status: true,
//                                 money: userInfo.winning - money,
//                                 timeStamp: timeNow,
//                             });
//                         }
//                     } else {
//                         return res.status(200).json({
//                             message: 'The total bet is not enough to fulfill the request',
//                             status: false,
//                             timeStamp: timeNow,
//                         });
//                     }
//                 } else {
//                     return res.status(200).json({
//                         message: 'The balance is not enough to fulfill the request ',
//                         status: false,
//                         timeStamp: timeNow,
//                     });
//                 }

//             } else {
//                 return res.status(200).json({
//                     message: 'You can only make 3 withdrawals per day',
//                     status: false,
//                     timeStamp: timeNow,
//                 });
//             }
//           }else{
//             return res.status(200).json({
//                 message: 'Please Fill Full bank Details',
//                 status: false,
//                 timeStamp: timeNow,
//             });
//           }
//         } else {
//             return res.status(200).json({
//                 message: 'Please link your bank first',
//                 status: false,
//                 timeStamp: timeNow,
//             });
//         }
//     }if (type === 'submitAuto') {
//         const [user_bank] = await connection.query('SELECT * FROM user_bank WHERE `phone` = ?', [userInfo.phone]);
//         const [user_bank_check] = await connection.query(`
//             SELECT * FROM user_bank
//             WHERE phone = ?
//             AND stk != '0'
//             AND name_bank != '0'
//             AND email != '0'
//             AND name_user != '0'
//         `, [userInfo.phone]);

//       const [withdraw] = await connection.query('SELECT * FROM withdraw WHERE `phone` = ? AND DATE(`today`) = CURDATE()', [userInfo.phone]);

//         if (user_bank.length != 0) {
//           if(user_bank_check.length > 0){
//             console.log(user_bank_check[0])
//             if (withdraw.length < 3) {
//                 if (userInfo.winning - money >= 0) {
//                     if (result > 0) {
//                         if (result < money) {
//                             return res.status(200).json({
//                                 message: 'Insufficient funds to complete the transaction.',
//                                 status: false,
//                                 timeStamp: timeNow,
//                             });
//                         } else {
//                             try {
//                                 let infoBank = user_bank[0];
//                                 console.log("Bank Details :" + infoBank);
//                                 const idOrder = id_time + '' + id_order || null;

//                                 const sql = `INSERT INTO withdraw SET
//                                     id_order = ?,
//                                     uid = ?,
//                                     phone = ?,
//                                     money = ?,
//                                     type = ?,
//                                     wallet = ?,
//                                     stk = ?,
//                                     name_bank = ?,
//                                     ifsc = ?,
//                                     name_user = ?,
//                                     status = ?,
//                                     today = ?,
//                                     time = ?`;
//                                 await connection.execute(sql, [idOrder, userInfo.id_user, userInfo.phone, money, type, 0, user_bank[0].stk, user_bank[0].name_bank, user_bank[0].email, user_bank[0].name_user, 0, checkTime, dates]);
//                                 await connection.query('UPDATE users SET  winning = winning - ? WHERE phone = ? ', [ money, userInfo.phone]);

//                                 return res.status(200).json({
//                                     message: 'Withdrawal successful',
//                                     status: true,
//                                     money: userInfo.winning - money,
//                                     timeStamp: timeNow,
//                                 });
//                             } catch (error) {
//                                 return res.status(200).json({
//                                     message: error ,
//                                     status: false,
//                                     money: userInfo.winning - money,
//                                     timeStamp: timeNow,
//                                 });
//                             }

//                         }
//                     } else {
//                         return res.status(200).json({
//                             message: 'The total bet is not enough to fulfill the request',
//                             status: false,
//                             timeStamp: timeNow,
//                         });
//                     }
//                 } else {
//                     return res.status(200).json({
//                         message: 'The balance is not enough to fulfill the request ',
//                         status: false,
//                         timeStamp: timeNow,
//                     });
//                 }

//             } else {
//                 return res.status(200).json({
//                     message: 'You can only make 3 withdrawals per day',
//                     status: false,
//                     timeStamp: timeNow,
//                 });
//             }
//           }else{
//             return res.status(200).json({
//                 message: 'Please Fill Full bank Details',
//                 status: false,
//                 timeStamp: timeNow,
//             });
//           }
//         } else {
//             return res.status(200).json({
//                 message: 'Please link your bank first',
//                 status: false,
//                 timeStamp: timeNow,
//             });
//         }
//     } else if (type === 'upi') {
//         const [user_bank] = await connection.query('SELECT * FROM user_bank WHERE `phone` = ?', [userInfo.phone]);
//         const [withdraw] = await connection.query('SELECT * FROM withdraw WHERE `phone` = ? AND DATE(`today`) = CURDATE()', [userInfo.phone]);
//         const [user_bank_check] = await connection.query(`
//             SELECT * FROM user_bank
//             WHERE phone = ?
//             AND upi != '0'
//         `, [userInfo.phone]);
//         if (user_bank.length != 0) {
//           if(user_bank_check.length > 0){
//             console.log(user_bank_check[0])
//             if (withdraw.length < 3) {
//                 if (userInfo.winning - money >= 0) {
//                     if (result > 0) {
//                         if (result < money) {
//                             return res.status(200).json({
//                                 message: 'Insufficient funds to complete the transaction.',
//                                 status: false,
//                                 timeStamp: timeNow,
//                             });
//                         } else {
//                             let infoBank = user_bank[0];
//                             console.log("Bank Details :" + infoBank);

//                             const idOrder = id_time + '' + id_order || null;
//                             const sql = `INSERT INTO withdraw SET
//                                 id_order = ?,
//                                 uid = ?,
//                                 phone = ?,
//                                 money = ?,
//                                 type = ?,
//                                 wallet = ?,
//                                 stk = ?,
//                                 name_bank = ?,
//                                 ifsc = ?,
//                                 name_user = ?,
//                                 status = ?,
//                                 today = ?,
//                                 time = ?`;
//                             await connection.execute(sql, [idOrder, userInfo.id_user, userInfo.phone, money, type, user_bank[0].upi, 0, 0, 0, 0, 0, checkTime, dates]);
//                             await connection.query('UPDATE users SET winning = winning - ? WHERE phone = ? ', [money, userInfo.phone]);

//                             return res.status(200).json({
//                                 message: 'Withdrawal successful',
//                                 status: true,
//                                 money: userInfo.winning - money,
//                                 timeStamp: timeNow,
//                             });
//                         }
//                     } else {
//                         return res.status(200).json({
//                             message: 'The total bet is not enough to fulfill the request',
//                             status: false,
//                             timeStamp: timeNow,
//                         });
//                     }
//                 } else {
//                     return res.status(200).json({
//                         message: 'The balance is not enough to fulfill the request ',
//                         status: false,
//                         timeStamp: timeNow,
//                     });
//                 }

//             } else {
//                 return res.status(200).json({
//                     message: 'You can only make 3 withdrawals per day',
//                     status: false,
//                     timeStamp: timeNow,
//                 });
//             }
//         }else{
//             return res.status(200).json({
//                 message: 'Please link your UPI first',
//                 status: false,
//                 timeStamp: timeNow,
//             });
//         }
//         } else {
//             return res.status(200).json({
//                 message: 'Please link your UPI first',
//                 status: false,
//                 timeStamp: timeNow,
//             });
//         }
//     } else if (type === 'BEP20') {
//         const [user_bank] = await connection.query('SELECT * FROM user_bank WHERE `phone` = ?', [userInfo.phone]);
//       const [withdraw] = await connection.query('SELECT * FROM withdraw WHERE `phone` = ? AND DATE(`today`) = CURDATE()', [userInfo.phone]);
//         const [user_bank_check] = await connection.query(`
//             SELECT * FROM user_bank
//             WHERE phone = ?
//             AND bep != '0'
//         `, [userInfo.phone]);
//         if (user_bank.length != 0) {
//           if(user_bank_check.length != 0){
//             if (withdraw.length < 3) {
//                 if (userInfo.winning - money >= 0) {
//                     if (result > 0) {
//                         if (result < money) {
//                             return res.status(200).json({
//                                 message: 'Insufficient funds to complete the transaction.',
//                                 status: false,
//                                 timeStamp: timeNow,
//                             });
//                         } else {
//                             let infoBank = user_bank[0];
//                             console.log("Bank Details :" + infoBank);

//                             const idOrder = id_time + '' + id_order || null;
//                             userInfo
//                             const sql = `INSERT INTO withdraw SET
//                                 id_order = ?,
//                                 uid = ?,
//                                 phone = ?,
//                                 money = ?,
//                                 type = ?,
//                                 wallet = ?,
//                                 stk = ?,
//                                 name_bank = ?,
//                                 ifsc = ?,
//                                 name_user = ?,
//                                 status = ?,
//                                 today = ?,
//                                 time = ?`;
//                             await connection.execute(sql, [idOrder, userInfo.id_user, userInfo.phone, money, type, user_bank[0].bep, 0, 0, 0, 0, 0, checkTime, dates]);
//                             await connection.query('UPDATE users SET winning = winning - ? WHERE phone = ? ', [money, userInfo.phone]);

//                             return res.status(200).json({
//                                 message: 'Withdrawal successful',
//                                 status: true,
//                                 money: userInfo.winning - money,
//                                 timeStamp: timeNow,
//                             });
//                         }
//                     } else {
//                         return res.status(200).json({
//                             message: 'The total bet is not enough to fulfill the request',
//                             status: false,
//                             timeStamp: timeNow,
//                         });
//                     }
//                 } else {
//                     return res.status(200).json({
//                         message: 'The balance is not enough to fulfill the request ',
//                         status: false,
//                         timeStamp: timeNow,
//                     });
//                 }

//             } else {
//                 return res.status(200).json({
//                     message: 'You can only make 3 withdrawals per day',
//                     status: false,
//                     timeStamp: timeNow,
//                 });
//             }
//         }else{
//             return res.status(200).json({
//                 message: 'Please link your BEP20 Address first 111',
//                 status: false,
//                 timeStamp: timeNow,
//             });
//         }
//         } else {
//             return res.status(200).json({
//                 message: 'Please link your BEP20 Address first',
//                 status: false,
//                 timeStamp: timeNow,
//             });
//         }
//     }else if (type === 'TRC20') {
//         const [user_bank] = await connection.query('SELECT * FROM user_bank WHERE `phone` = ?', [userInfo.phone]);
//       const [withdraw] = await connection.query('SELECT * FROM withdraw WHERE `phone` = ? AND DATE(`today`) = CURDATE()', [userInfo.phone]);
//         const [user_bank_check] = await connection.query(`
//             SELECT * FROM user_bank
//             WHERE phone = ?
//             AND trc != '0'
//         `, [userInfo.phone]);
//         if (user_bank.length != 0) {
//           if(user_bank_check.length > 0){
//             if (withdraw.length < 3) {
//                 if (userInfo.winning - money >= 0) {
//                     if (result > 0) {
//                         if (result < money) {
//                             return res.status(200).json({
//                                 message: 'Insufficient funds to complete the transaction.',
//                                 status: false,
//                                 timeStamp: timeNow,
//                             });
//                         } else {
//                             let infoBank = user_bank[0];
//                             console.log("Bank Details :" + infoBank);

//                             const idOrder = id_time + '' + id_order || null;
//                             const sql = `INSERT INTO withdraw SET
//                                 id_order = ?,
//                                 uid = ?,
//                                 phone = ?,
//                                 money = ?,
//                                 type = ?,
//                                 wallet = ?,
//                                 stk = ?,
//                                 name_bank = ?,
//                                 ifsc = ?,
//                                 name_user = ?,
//                                 status = ?,
//                                 today = ?,
//                                 time = ?`;
//                             await connection.execute(sql, [idOrder, userInfo.id_user, userInfo.phone, money, type, user_bank[0].trc, 0, 0, 0, 0, 0, checkTime, dates]);
//                             await connection.query('UPDATE users SET winning = winning - ? WHERE phone = ? ', [money, userInfo.phone]);

//                             return res.status(200).json({
//                                 message: 'Withdrawal successful',
//                                 status: true,
//                                 money: userInfo.winning - money,
//                                 timeStamp: timeNow,
//                             });
//                         }
//                     } else {
//                         return res.status(200).json({
//                             message: 'The total bet is not enough to fulfill the request',
//                             status: false,
//                             timeStamp: timeNow,
//                         });
//                     }
//                 } else {
//                     return res.status(200).json({
//                         message: 'The balance is not enough to fulfill the request ',
//                         status: false,
//                         timeStamp: timeNow,
//                     });
//                 }

//             } else {
//                 return res.status(200).json({
//                     message: 'You can only make 3 withdrawals per day',
//                     status: false,
//                     timeStamp: timeNow,
//                 });
//             }
//         }else{
//             return res.status(200).json({
//                 message: 'Please link your TRC20 Address first',
//                 status: false,
//                 timeStamp: timeNow,
//             });
//         }
//         } else {
//             return res.status(200).json({
//                 message: 'Please link your TRC20 Address first',
//                 status: false,
//                 timeStamp: timeNow,
//             });
//         }
//     }else{
//         return res.status(200).json({
//             message: 'Invalid withdrawal type',
//             status: false,
//             timeStamp: timeNow,
//         });
//     }
// }else{
//       return res.status(200).json({
//             message: 'You need to place a bet first with the available bet amount.',
//             status: false,
//             timeStamp: timeNow,
//         });
// }
// }

// const withdrawal3 = async (req, res) => {
//   try {
//     const { auth } = req.cookies;
//     const { money, type } = req.body;

//     // ✅ **Validate request parameters**
//     if (!auth || !money || !type) {
//       return res.status(400).json({
//         message: "Missing required fields: auth, money, or type.",
//         status: false,
//         timeStamp: Date.now(),
//       });
//     }

//     // ✅ **Ensure money is a valid positive number & min 200**
//     if (isNaN(money) || money < 300) {
//       return res.status(400).json({
//         message: "Invalid amount: Minimum withdrawal is ₹300.",
//         status: false,
//         timeStamp: Date.now(),
//       });
//     }

//     // ✅ **Fetch User Data**
//     const [users] = await connection.query(
//       "SELECT * FROM users WHERE token = ?",
//       [auth]
//     );

//     if (!users.length) {
//       return res.status(401).json({
//         message: "Unauthorized access. Invalid authentication token.",
//         status: false,
//         timeStamp: Date.now(),
//       });
//     }

//     const userInfo = users[0];

//     // ✅ **Check if user has enough balance**
//     if (userInfo.winning < money) {
//       return res.status(400).json({
//         message: `Insufficient balance: Your winning amount is ₹${userInfo.winning}, but you requested ₹${money}.`,
//         status: false,
//         timeStamp: Date.now(),
//       });
//     }

//     // ✅ **Get total bet amount today**
//     const totalWinningQuery = `
//       SELECT COALESCE(SUM(money), 0) AS total_money, COALESCE(SUM(fee), 0) AS total_fee
//       FROM (
//           SELECT money, fee FROM minutes_1 WHERE phone = ? AND DATE(FROM_UNIXTIME(time / 1000)) = CURDATE()
//           UNION ALL
//           SELECT money, fee FROM result_k3 WHERE phone = ? AND DATE(FROM_UNIXTIME(time / 1000)) = CURDATE()
//           UNION ALL
//           SELECT money, fee FROM result_5d WHERE phone = ? AND DATE(FROM_UNIXTIME(time / 1000)) = CURDATE()
//       ) AS combined_data;
//     `;

//     const [totalbet] = await connection.query(totalWinningQuery, [
//       userInfo.phone,
//       userInfo.phone,
//       userInfo.phone,
//     ]);

//     const totalBetAmountToday =
//       parseInt(totalbet[0].total_money) + parseInt(totalbet[0].total_fee);

//     if (totalBetAmountToday < money) {
//       return res.status(400).json({
//         message: `Withdrawal denied: You need to place more bets worth ₹${money - totalBetAmountToday} today.`,
//         status: false,
//         timeStamp: Date.now(),
//       });
//     }

//     // ✅ **Process withdrawal based on type**
//     if (["bank", "submitAuto", "upi", "BEP20", "TRC20"].includes(type)) {
//       // **Check if user has linked a bank account**
//       const [userBank] = await connection.query(
//         "SELECT * FROM user_bank WHERE phone = ?",
//         [userInfo.phone]
//       );

//       if (!userBank.length) {
//         return res.status(400).json({
//           message: "No bank account linked. Please add bank details before withdrawal.",
//           status: false,
//           timeStamp: Date.now(),
//         });
//       }

//       // ✅ **Validate complete bank details**
//       let validBankQuery = `
//         SELECT * FROM user_bank
//         WHERE phone = ?
//         AND stk != '0'
//         AND name_bank != '0'
//         AND email != '0'
//         AND name_user != '0'
//       `;

//       const queryParams = [userInfo.phone];

//       if (type === "BEP20") {
//         validBankQuery += " AND bep != '0'";
//       } else if (type === "TRC20") {
//         validBankQuery += " AND trc != '0'";
//       }

//       const [validBank] = await connection.query(validBankQuery, queryParams);

//       if (!validBank.length) {
//         return res.status(400).json({
//           message: "Incomplete bank details. Please update your bank information.",
//           status: false,
//           timeStamp: Date.now(),
//         });
//       }

//       // ✅ **Check withdrawal limit per day**
//       const [withdrawals] = await connection.query(
//         "SELECT * FROM withdraw WHERE phone = ? AND DATE(today) = CURDATE()",
//         [userInfo.phone]
//       );

//       if (withdrawals.length >= 3) {
//         return res.status(400).json({
//           message: "Daily withdrawal limit reached (3 withdrawals per day). Try again tomorrow.",
//           status: false,
//           timeStamp: Date.now(),
//         });
//       }

//       // ✅ **Process withdrawal**
//       const bankDetails = userBank[0];
//       const idOrder = `WD-${Date.now()}`;
//       const checkTime = new Date().toISOString().slice(0, 19).replace("T", " ");

//       await connection.execute(
//         `INSERT INTO withdraw (id_order, uid, phone, money, type, wallet, stk, name_bank, ifsc, name_user, status, today, time)
//          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//         [
//           idOrder,
//           userInfo.id_user,
//           userInfo.phone,
//           money,
//           type,
//           0,
//           bankDetails.stk,
//           bankDetails.name_bank,
//           bankDetails.email,
//           bankDetails.name_user,
//           0,
//           checkTime,
//           Date.now(),
//         ]
//       );

//       // ✅ **Deduct money from user balance**
//       await connection.query(
//         "UPDATE users SET winning = winning - ? WHERE phone = ?",
//         [money, userInfo.phone]
//       );

//       return res.status(200).json({
//         message: "Withdrawal request successful. Processing your request.",
//         status: true,
//         remainingBalance: userInfo.winning - money,
//         transactionId: idOrder,
//         timeStamp: Date.now(),
//       });
//     }

//     return res.status(400).json({
//       message: "Invalid withdrawal type. Please select 'bank', 'submitAuto', 'upi', 'BEP20', or 'TRC20'.",
//       status: false,
//       timeStamp: Date.now(),
//     });
//   } catch (error) {
//     console.error("Withdrawal Error:", error);
//     return res.status(500).json({
//       message: "An unexpected error occurred while processing your request.",
//       status: false,
//       error: error.message,
//       timeStamp: Date.now(),
//     });
//   }
// };

const withdrawal3 = async (req, res) => {
  try {
    const { auth } = req.cookies;
    const { money, type } = req.body;

    if (!auth || !money || !type) {
      return res.status(400).json({
        message: "Missing required fields: auth, money, or type.",
        status: false,
        timeStamp: Date.now(),
      });
    }

    if (isNaN(money) || money < 200) {
      return res.status(400).json({
        message: "Invalid amount: Minimum withdrawal is ₹200.",
        status: false,
        timeStamp: Date.now(),
      });
    }

    const [users] = await connection.query(
      "SELECT * FROM users WHERE token = ?",
      [auth]
    );

    if (!users.length) {
      return res.status(401).json({
        message: "Unauthorized access. Invalid authentication token.",
        status: false,
        timeStamp: Date.now(),
      });
    }

    const userInfo = users[0];
    
     const [recharge] = await connection.query(
    "SELECT sum(money) as totalRecharge,phone,status FROM recharge WHERE `phone` = ? AND status = 1",
    [userInfo.phone]
  );
  
  
  const [minutes_1] = await connection.query(
    "SELECT sum(amount) as totalBet,phone FROM minutes_1 WHERE phone = ? ",
    [userInfo.phone]
  ); 
//   console.log("rahul");
//   console.log(minutes_1[0].totalBet);
//   console.log(recharge[0].totalRecharge);
  

    if (userInfo.winning < money) {
      return res.status(400).json({
        message: `Insufficient balance: Your winning amount is ₹${userInfo.winning}, but you requested ₹${money}.`,
        status: false,
        timeStamp: Date.now(),
      });
    }
    
    if(recharge[0].totalRecharge > minutes_1[0].totalBet){
      return res.status(400).json({
        message: `You need to bet all deposited amount`,
        status: false,
        timeStamp: Date.now(),
      });
  }

    const totalWinningQuery = `
        SELECT COALESCE(SUM(money), 0) AS total_money, COALESCE(SUM(fee), 0) AS total_fee
        FROM (
            SELECT money, fee FROM minutes_1 WHERE phone = ? AND status = 1 AND DATE(FROM_UNIXTIME(time / 1000)) = CURDATE()
            UNION ALL
            SELECT money, fee FROM result_k3 WHERE phone = ? AND status = 1 AND DATE(FROM_UNIXTIME(time / 1000)) = CURDATE()
            UNION ALL
            SELECT money, fee FROM result_5d WHERE phone = ? AND status = 1 AND DATE(FROM_UNIXTIME(time / 1000)) = CURDATE()
        ) AS combined_data;
    `;

    const [totalbet] = await connection.query(totalWinningQuery, [
      userInfo.phone,
      userInfo.phone,
      userInfo.phone,
    ]);

    const totalBetAmountToday =
      parseInt(totalbet[0].total_money) + parseInt(totalbet[0].total_fee);

 /*   if (!userInfo.avatar_withdrawal && totalBetAmountToday < money) {
      return res.status(400).json({
        message: `Withdrawal denied: You need to place more bets worth ₹${
          money - totalBetAmountToday
        } today.`,
        status: false,
        timeStamp: Date.now(),
      });
    }*/

    if (
      [
        "bank",
        "submitAuto",
        "upi",
        "BEP20",
        "TRC20",
        "NAGAD",
        "BKASH",
      ].includes(type)
    ) {
      const [userBank] = await connection.query(
        "SELECT * FROM user_bank WHERE phone = ?",
        [userInfo.phone]
      );

      if (!userBank.length) {
        return res.status(400).json({
          message:
            "No bank account linked. Please add bank details before withdrawal.",
          status: false,
          timeStamp: Date.now(),
        });
      }

      // Validate bank details based on withdrawal type
      let validBankQuery = "SELECT * FROM user_bank WHERE phone = ?";
      const queryParams = [userInfo.phone];

      if (type === "BEP20") {
        validBankQuery += " AND bep != '0'";
      } else if (type === "TRC20") {
        validBankQuery += " AND trc != '0'";
      } else if (type === "NAGAD") {
        validBankQuery += " AND nagad != '0'";
      } else if (type === "BKASH") {
        validBankQuery += " AND bkash != '0'";
      } else {
        validBankQuery +=
          " AND stk != '0' AND name_bank != '0' AND email != '0' AND name_user != '0'";
      }

      const [validBank] = await connection.query(validBankQuery, queryParams);

      if (!validBank.length) {
        return res.status(400).json({
          message:
            "Incomplete bank details. Please update your bank information.",
          status: false,
          timeStamp: Date.now(),
        });
      }

      const [withdrawals] = await connection.query(
        "SELECT * FROM withdraw WHERE phone = ? AND DATE(today) = CURDATE()",
        [userInfo.phone]
      );

      if (withdrawals.length >= 2) {
        return res.status(400).json({
          message:
            "Daily withdrawal limit reached (2 withdrawals per day). Try again tomorrow.",
          status: false,
          timeStamp: Date.now(),
        });
      }

      const bankDetails = userBank[0];
      const idOrder = `WD-${Date.now()}`;
      const checkTime = new Date().toISOString().slice(0, 19).replace("T", " ");

      await connection.execute(
        `INSERT INTO withdraw (id_order, uid, phone, money, type, wallet, stk, name_bank, ifsc, name_user, nagad, bkash, trc, bep, status, today, time)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          idOrder,
          userInfo.id_user,
          userInfo.phone,
          money,
          type,
          0,
          bankDetails.stk || null,
          bankDetails.name_bank || null,
          bankDetails.email || null,
          bankDetails.name_user || null,
          bankDetails.nagad || null,
          bankDetails.bkash || null,
          bankDetails.trc || null,
          bankDetails.bep || null,
          0,
          checkTime,
          Date.now(),
        ]
      );

      await connection.query(
        "UPDATE users SET winning = winning - ? WHERE phone = ?",
        [money, userInfo.phone]
      );

      return res.status(200).json({
        message: "Withdrawal request successful. Processing your request.",
        status: true,
        remainingBalance: userInfo.winning - money,
        transactionId: idOrder,
        timeStamp: Date.now(),
      });
    }

    return res.status(400).json({
      message:
        "Invalid withdrawal type. Please select 'bank', 'submitAuto', 'upi', 'BEP20', 'TRC20', 'NAGAD', or 'BKASH'.",
      status: false,
      timeStamp: Date.now(),
    });
  } catch (error) {
    console.error("Withdrawal Error:", error);
    return res.status(500).json({
      message: "An unexpected error occurred while processing your request.",
      status: false,
      error: error.message,
      timeStamp: Date.now(),
    });
  }
};

const transfer = async (req, res) => {
  let auth = req.cookies.auth;
  let amount = req.body.amount;
  let receiver_phone = req.body.phone;
  const date = new Date();
  // let id_time = date.getUTCFullYear() + '' + (date.getUTCMonth() + 1) + '' + date.getUTCDate();
  let id_order =
    Math.floor(Math.random() * (99999999999999 - 10000000000000 + 1)) +
    10000000000000;
  let time = new Date().getTime();
  let client_transaction_id = id_order;

  const [user] = await connection.query(
    "SELECT `phone`,`money`, `code`,`invite` FROM users WHERE `token` = ? ",
    [auth]
  );
  let userInfo = user[0];
  let sender_phone = userInfo.phone;
  let sender_money = parseInt(userInfo.money);
  if (!user) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }

  function formateT(params) {
    let result = params < 10 ? "0" + params : params;
    return result;
  }

  function timerJoin(params = "", addHours = 0) {
    let date = "";
    if (params) {
      date = new Date(Number(params));
    } else {
      date = new Date();
    }

    date.setHours(date.getHours() + addHours);

    let years = formateT(date.getFullYear());
    let months = formateT(date.getMonth() + 1);
    let days = formateT(date.getDate());

    let hours = date.getHours() % 12;
    hours = hours === 0 ? 12 : hours;
    let ampm = date.getHours() < 12 ? "AM" : "PM";

    let minutes = formateT(date.getMinutes());
    let seconds = formateT(date.getSeconds());

    return (
      years +
      "-" +
      months +
      "-" +
      days +
      " " +
      hours +
      ":" +
      minutes +
      ":" +
      seconds +
      " " +
      ampm
    );
  }

  let dates = new Date().getTime();
  let checkTime = timerJoin(dates);
  const [recharge] = await connection.query(
    "SELECT * FROM recharge WHERE phone = ? AND status = 1 ",
    [userInfo.phone]
  );
  const [minutes_1] = await connection.query(
    "SELECT * FROM minutes_1 WHERE phone = ? ",
    [userInfo.phone]
  );
  let total = 0;
  recharge.forEach((data) => {
    total += data.money;
  });
  let total2 = 0;
  minutes_1.forEach((data) => {
    total2 += data.money;
  });

  let result = 0;
  if (total - total2 > 0) result = total - total2;

  // console.log('date:', result);
  if (result == 0) {
    if (sender_money >= amount) {
      let [receiver] = await connection.query(
        "SELECT * FROM users WHERE `phone` = ?",
        [receiver_phone]
      );
      if (receiver.length === 1 && sender_phone !== receiver_phone) {
        let money = sender_money - amount;
        let total_money = amount + receiver[0].total_money;
        // await connection.query('UPDATE users SET money = ? WHERE phone = ?', [money, sender_phone]);
        // await connection.query(`UPDATE users SET money = money + ? WHERE phone = ?`, [amount, receiver_phone]);
        const sql =
          "INSERT INTO balance_transfer (sender_phone, receiver_phone, amount) VALUES (?, ?, ?)";
        await connection.execute(sql, [sender_phone, receiver_phone, amount]);
        const sql_recharge =
          "INSERT INTO recharge (id_order, transaction_id, phone, money, type, status, today, url, time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        await connection.execute(sql_recharge, [
          client_transaction_id,
          0,
          receiver_phone,
          amount,
          "wallet",
          0,
          checkTime,
          0,
          time,
        ]);

        return res.status(200).json({
          message: `Requested ${amount} sent successfully`,
          status: true,
          timeStamp: timeNow,
        });
      } else {
        return res.status(200).json({
          message: `${receiver_phone} is not a valid user mobile number`,
          status: false,
          timeStamp: timeNow,
        });
      }
    } else {
      return res.status(200).json({
        message: "Your balance is not enough",
        status: false,
        timeStamp: timeNow,
      });
    }
  } else {
    return res.status(200).json({
      message: "The total bet is not enough to fulfill the request",
      status: false,
      timeStamp: timeNow,
    });
  }
};

// get transfer balance data
const transferHistory = async (req, res) => {
  let auth = req.cookies.auth;

  const [user] = await connection.query(
    "SELECT `phone`,`money`, `code`,`invite` FROM users WHERE `token` = ? ",
    [auth]
  );
  let userInfo = user[0];
  if (!user) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }
  const [history] = await connection.query(
    "SELECT * FROM balance_transfer WHERE sender_phone = ?",
    [userInfo.phone]
  );
  const [receive] = await connection.query(
    "SELECT * FROM balance_transfer WHERE receiver_phone = ?",
    [userInfo.phone]
  );
  if (receive.length > 0 || history.length > 0) {
    return res.status(200).json({
      message: "Success",
      receive: receive,
      datas: history,
      status: true,
      timeStamp: timeNow,
    });
  }
};
// const recharge2 = async (req, res) => {
//     let auth = req.cookies.auth;
//     let money = req.body.money;
//     if (!auth) {
//         return res.status(200).json({
//             message: 'Failed',
//             status: false,
//             timeStamp: timeNow,
//         })
//     }
//     const [user] = await connection.query('SELECT `phone`, `code`,`invite` FROM users WHERE `token` = ? ', [auth]);
//     let userInfo = user[0];
//     if (!user) {
//         return res.status(200).json({
//             message: 'Failed',
//             status: false,
//             timeStamp: timeNow,
//         });
//     };
//     const [recharge] = await connection.query('SELECT * FROM recharge WHERE phone = ? AND status = ? ', [userInfo.phone, 0]);
//     const [bank_recharge] = await connection.query('SELECT * FROM bank_recharge');
//     if (recharge.length != 0) {
//         return res.status(200).json({
//             message: 'Received successfully',
//             datas: recharge[0],
//             infoBank: bank_recharge,
//             status: true,
//             timeStamp: timeNow,
//         });
//     } else {
//         return res.status(200).json({
//             message: 'Failed',
//             status: false,
//             timeStamp: timeNow,
//         });
//     }

// }
const recharge2 = async (req, res) => {
  let auth = req.cookies.auth;
  let orderid = req.cookies.orderid;
  if (!auth) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }
  const [user] = await connection.query(
    "SELECT phone, code,invite FROM users WHERE token = ?",
    [auth]
  );
  let userInfo = user[0];
  if (!user) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }
  const [recharge] = await connection.query(
    "SELECT * FROM recharge WHERE id_order = ? AND status = ? ",
    [orderid, 0]
  );
  const [bank_recharge] = await connection.query(
    "SELECT * FROM bank_recharge where type =  ?",
    ["upi"]
  );
  if (recharge.length != 0) {
    return res.status(200).json({
      message: "Received success",
      datas: recharge[0],
      infoBank: bank_recharge,
      status: true,
      timeStamp: timeNow,
    });
  } else {
    return res.status(200).json({
      message: "order id does not exists",
      status: false,
      timeStamp: timeNow,
    });
  }
};

const listRecharge = async (req, res) => {
  let auth = req.cookies.auth;
  if (!auth) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }
  const [user] = await connection.query(
    "SELECT `phone`, `code`,`invite` FROM users WHERE `token` = ? ",
    [auth]
  );
  let userInfo = user[0];
  if (!user) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }
  const [recharge] = await connection.query(
    "SELECT * FROM recharge WHERE phone = ? ORDER BY id DESC ",
    [userInfo.phone]
  );
  return res.status(200).json({
    message: "Receive success",
    datas: recharge,
    status: true,
    timeStamp: timeNow,
  });
};

const search = async (req, res) => {
  let auth = req.cookies.auth;
  let phone = req.body.phone;
  if (!auth) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }
  const [user] = await connection.query(
    "SELECT `phone`, `code`,`invite`, `level` FROM users WHERE `token` = ? ",
    [auth]
  );
  if (user.length == 0) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }
  let userInfo = user[0];
  if (userInfo.level == 1) {
    const [users] = await connection.query(
      `SELECT * FROM users WHERE phone = ? ORDER BY id DESC `,
      [phone]
    );
    return res.status(200).json({
      message: "Receive success",
      datas: users,
      status: true,
      timeStamp: timeNow,
    });
  } else if (userInfo.level == 2) {
    const [users] = await connection.query(
      `SELECT * FROM users WHERE phone = ? ORDER BY id DESC `,
      [phone]
    );
    if (users.length == 0) {
      return res.status(200).json({
        message: "Receive success",
        datas: [],
        status: true,
        timeStamp: timeNow,
      });
    } else {
      if (users[0].ctv == userInfo.phone) {
        return res.status(200).json({
          message: "Receive success",
          datas: users,
          status: true,
          timeStamp: timeNow,
        });
      } else {
        return res.status(200).json({
          message: "Failed",
          status: false,
          timeStamp: timeNow,
        });
      }
    }
  } else {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }
};

const listWithdraw = async (req, res) => {
  let auth = req.cookies.auth;
  if (!auth) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }
  const [user] = await connection.query(
    "SELECT `phone`, `code`,`invite` FROM users WHERE `token` = ? ",
    [auth]
  );
  let userInfo = user[0];
  if (!user) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }
  const [recharge] = await connection.query(
    "SELECT * FROM withdraw WHERE phone = ? ORDER BY id DESC ",
    [userInfo.phone]
  );
  return res.status(200).json({
    message: "Receive success",
    datas: recharge,
    status: true,
    timeStamp: timeNow,
  });
};

// const useRedenvelope = async (req, res) => {
//     let auth = req.cookies.auth;
//     let code = req.body.code;
//     if (!auth || !code) {
//         return res.status(200).json({
//             message: 'Failed',
//             status: false,
//             timeStamp: timeNow,
//         })
//     }
//     const [user] = await connection.query('SELECT `phone`, `code`,`invite` FROM users WHERE `token` = ? ', [auth]);
//     let userInfo = user[0];
//     if (!user) {
//         return res.status(200).json({
//             message: 'Failed',
//             status: false,
//             timeStamp: timeNow,
//         });
//     };
//     const [redenvelopes] = await connection.query(
//         'SELECT * FROM redenvelopes WHERE id_redenvelope = ?', [code]);

//     if (redenvelopes.length == 0) {
//         return res.status(200).json({
//             message: 'Redemption code error',
//             status: false,
//             timeStamp: timeNow,
//         });
//     } else {
//         let infoRe = redenvelopes[0];
//         const d = new Date();
//         const time = d.getTime();
//         if (infoRe.status == 0) {
//             await connection.query('UPDATE redenvelopes SET used = ?, status = ? WHERE `id_redenvelope` = ? ', [0, 1, infoRe.id_redenvelope]);
//             await connection.query('UPDATE users SET winning = winning + ? WHERE `phone` = ? ', [infoRe.money, userInfo.phone]);
//             let sql = 'INSERT INTO redenvelopes_used SET phone = ?, phone_used = ?, id_redenvelops = ?, money = ?, `time` = ? ';
//             await connection.query(sql, [infoRe.phone, userInfo.phone, infoRe.id_redenvelope, infoRe.money, time]);
//             let trans = 'INSERT INTO transfer_money SET amount = ?, phone = ?, type = ?, status = 1';
//             await connection.query(trans, [infoRe.money, userInfo.phone, "Gift Code Bonus"]);
//             return res.status(200).json({
//                 message: `Received successfully +${infoRe.money}`,
//                 status: true,
//                 timeStamp: timeNow,
//             });
//         } else {
//             return res.status(200).json({
//                 message: 'Gift code already used',
//                 status: false,
//                 timeStamp: timeNow,
//             });
//         }
//     }
// }

const useRedenvelope = async (req, res) => {
  const timeNow = new Date().toISOString();
  const auth = req.cookies?.auth;
  const { code } = req.body;

  if (!auth || !code) {
    return res.status(400).json({
      message: "Auth token or gift code is missing",
      status: false,
      timeStamp: timeNow,
    });
  }

  let conn;
  try {
    conn = await connection.getConnection(); // Get connection from pool

    // Start transaction
    await conn.beginTransaction();

    // Get user
    const [userResult] = await conn.query(
      "SELECT phone FROM users WHERE token = ?",
      [auth]
    );

    const userInfo = userResult?.[0];
    if (!userInfo) {
      await conn.rollback();
      return res.status(404).json({
        message: "User not found",
        status: false,
        timeStamp: timeNow,
      });
    }

    // Get gift code
    const [redenvelopes] = await conn.query(
      "SELECT * FROM redenvelopes WHERE id_redenvelope = ? AND status = 0",
      [code]
    );

    const envelope = redenvelopes?.[0];
    if (!envelope) {
      await conn.rollback();
      return res.status(404).json({
        message: "Invalid or already fully used gift code",
        status: false,
        timeStamp: timeNow,
      });
    }

    // Check if already used
    const [alreadyUsed] = await conn.query(
      "SELECT id FROM redenvelopes_used WHERE phone_used = ? AND id_redenvelops = ?",
      [userInfo.phone, envelope.id_redenvelope]
    );

    if (alreadyUsed.length > 0) {
      await conn.rollback();
      return res.status(409).json({
        message: "You have already used this gift code",
        status: false,
        timeStamp: timeNow,
      });
    }

    if (envelope.used >= envelope.max_claims) {
      await conn.query(
        "UPDATE redenvelopes SET status = 1 WHERE id_redenvelope = ?",
        [envelope.id_redenvelope]
      );
      await conn.commit();
      return res.status(200).json({
        message: "Gift code has reached maximum usage",
        status: false,
        timeStamp: timeNow,
      });
    }

    const updatedUsedCount = envelope.used + 1;
    const newStatus = updatedUsedCount >= envelope.max_claims ? 1 : 0;
    const timestamp = Date.now();

    await conn.query(
      "UPDATE redenvelopes SET used = ?, status = ? WHERE id_redenvelope = ?",
      [updatedUsedCount, newStatus, envelope.id_redenvelope]
    );

    await conn.query("UPDATE users SET winning = winning + ? WHERE phone = ?", [
      envelope.money,
      userInfo.phone,
    ]);

    await conn.query(
      `INSERT INTO redenvelopes_used 
          (phone, phone_used, id_redenvelops, money, time) 
          VALUES (?, ?, ?, ?, ?)`,
      [
        envelope.phone,
        userInfo.phone,
        envelope.id_redenvelope,
        envelope.money,
        timestamp,
      ]
    );

    await conn.query(
      `INSERT INTO transfer_money 
          (amount, phone, type, status) 
          VALUES (?, ?, ?, ?)`,
      [envelope.money, userInfo.phone, "Gift Code Bonus", 1]
    );

    await conn.commit(); // ✅ Commit everything
    return res.status(200).json({
      message: `Gift received successfully +${envelope.money}`,
      status: true,
      timeStamp: timeNow,
    });
  } catch (error) {
    if (conn) await conn.rollback(); // rollback if any error
    console.error("Gift code error:", error);
    return res.status(500).json({
      message: "Server error while processing gift code",
      status: false,
      timeStamp: timeNow,
    });
  } finally {
    if (conn) conn.release(); // Always release the connection
  }
};

const callback_bank = async (req, res) => {
  let transaction_id = req.body.transaction_id;
  let client_transaction_id = req.body.client_transaction_id;
  let amount = req.body.amount;
  let requested_datetime = req.body.requested_datetime;
  let expired_datetime = req.body.expired_datetime;
  let payment_datetime = req.body.payment_datetime;
  let status = req.body.status;
  if (!transaction_id) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }
  if (status == 2) {
    await connection.query(
      `UPDATE recharge SET status = 1 WHERE id_order = ?`,
      [client_transaction_id]
    );
    const [info] = await connection.query(
      `SELECT * FROM recharge WHERE id_order = ?`,
      [client_transaction_id]
    );
    await connection.query(
      "UPDATE users SET winning = winning + ?, money = money + ? WHERE phone = ? ",
      [info[0].money, info[0].money, info[0].phone]
    );
    return res.status(200).json({
      message: 0,
      status: true,
    });
  } else {
    await connection.query(`UPDATE recharge SET status = 2 WHERE id = ?`, [id]);

    return res.status(200).json({
      message: "Cancellation successful",
      status: true,
      datas: recharge,
    });
  }
};

const confirmRecharge = async (req, res) => {
  let auth = req.cookies.auth;
  // let money = req.body.money;
  // let paymentUrl = req.body.payment_url;
  if (!auth) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }
  const [user] = await connection.query(
    "SELECT `phone`, `code`,`invite` FROM users WHERE `token` = ? ",
    [auth]
  );
  let userInfo = user[0];
  if (!user) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }
  const [recharge] = await connection.query(
    "SELECT * FROM recharge WHERE phone = ? AND status = ? ",
    [userInfo.phone, 0]
  );

  if (recharge.length != 0) {
    const rechargeData = recharge[0];
    const date = new Date(rechargeData.today);
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    const formattedDate = `${dd}-${mm}-${yyyy}`;
    const apiData = {
      key: "0b295b3b-0383-4d94-abce-de44fddaeefb",
      client_txn_id: rechargeData.id_order,
      txn_date: formattedDate,
    };
    try {
      const apiResponse = await axios.post(
        "https://api.ekqr.in/api/check_order_status",
        apiData
      );
      const apiRecord = apiResponse.data.data;
      if (apiRecord.status === "scanning") {
        return res.status(200).json({
          message: "Waiting for confirmation",
          status: false,
          timeStamp: timeNow,
        });
      }
      if (
        apiRecord.client_txn_id === rechargeData.id_order &&
        apiRecord.customer_mobile === rechargeData.phone &&
        apiRecord.amount === rechargeData.money
      ) {
        if (apiRecord.status === "success") {
          await connection.query(
            `UPDATE recharge SET status = 1 WHERE id = ? AND id_order = ? AND phone = ? AND money = ?`,
            [
              rechargeData.id,
              apiRecord.client_txn_id,
              apiRecord.customer_mobile,
              apiRecord.amount,
            ]
          );
          // const [code] = await connection.query(`SELECT invite, total_money from users WHERE phone = ?`, [apiRecord.customer_mobile]);
          // const [data] = await connection.query('SELECT recharge_bonus_2, recharge_bonus FROM admin WHERE id = 1');
          // let selfBonus = info[0].money * (data[0].recharge_bonus_2 / 100);
          // let money = info[0].money + selfBonus;
          let money = apiRecord.amount;
          await connection.query(
            "UPDATE users SET money = money + ?, winning = winning + ? WHERE phone = ? ",
            [money, money, apiRecord.customer_mobile]
          );
          // let rechargeBonus;
          // if (code[0].total_money <= 0) {
          //     rechargeBonus = apiRecord.customer_mobile * (data[0].recharge_bonus / 100);
          // }
          // else {
          //     rechargeBonus = apiRecord.customer_mobile * (data[0].recharge_bonus_2 / 100);
          // }
          // const percent = rechargeBonus;
          // await connection.query('UPDATE users SET money = money + ?, total_money = total_money + ? WHERE code = ?', [money, money, code[0].invite]);

          return res.status(200).json({
            message: "Successful application confirmation",
            status: true,
            datas: recharge,
          });
        } else if (
          apiRecord.status === "failure" ||
          apiRecord.status === "close"
        ) {
          console.log(apiRecord.status);
          await connection.query(
            `UPDATE recharge SET status = 2 WHERE id = ? AND id_order = ? AND phone = ? AND money = ?`,
            [
              rechargeData.id,
              apiRecord.client_txn_id,
              apiRecord.customer_mobile,
              apiRecord.amount,
            ]
          );
          return res.status(200).json({
            message: "Payment failure",
            status: true,
            timeStamp: timeNow,
          });
        }
      } else {
        return res.status(200).json({
          message: "Mismtach data",
          status: true,
          timeStamp: timeNow,
        });
      }
    } catch (error) {
      console.error(error);
    }
  } else {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }
};

const updateRecharge = async (req, res) => {
  let auth = req.cookies.auth;
  let money = req.body.money;
  let order_id = req.body.id_order;
  let data = req.body.inputData;

  // if (type != 'upi') {
  //     if (!auth || !money || money < 300) {
  //         return res.status(200).json({
  //             message: 'upi failed',
  //             status: false,
  //             timeStamp: timeNow,
  //         })
  //     }
  // }
  const [user] = await connection.query(
    "SELECT `phone`, `code`,`invite` FROM users WHERE `token` = ? ",
    [auth]
  );
  let userInfo = user[0];
  if (!user) {
    return res.status(200).json({
      message: "user not found",
      status: false,
      timeStamp: timeNow,
    });
  }
  const [utr] = await connection.query(
    "SELECT * FROM recharge WHERE `utr` = ? ",
    [data]
  );
  let utrInfo = utr[0];

  if (!utrInfo) {
    await connection.query(
      "UPDATE recharge SET utr = ? WHERE phone = ? AND id_order = ?",
      [data, userInfo.phone, order_id]
    );
    return res.status(200).json({
      message: "UTR updated",
      status: true,
      timeStamp: timeNow,
    });
  } else {
    return res.status(200).json({
      message: "UTR is already in use",
      status: false,
      timeStamp: timeNow,
    });
  }
};

const fetchPaymentDetails = async (req, res) => {
  const [rows] = await connection.query(
    `SELECT * FROM payment_details LIMIT 1`
  );
  if (rows[0].length === 0) {
    return res.status(400).json({
      message: "Failed: Fetch Error",
      status: false,
      timeStamp: new Date().toISOString(),
    });
  }

  return res.status(200).json({
    message: "Success",
    status: true,
    data: rows,
    timeStamp: new Date().toISOString(),
  });
};

const listBet = async (req, res) => {
  let auth = req.cookies.auth;
  if (!auth) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }

  const [user] = await connection.query(
    "SELECT * FROM users WHERE token = ? ",
    [auth]
  );

  if (user.length == 0) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }
  const userInfo = user[0];
  console.log(userInfo.phone);

  const [total_bets] = await connection.query(
    `SELECT * FROM minutes_1 WHERE phone = ? AND status != 0 ORDER BY id DESC`,
    [userInfo.phone]
  );
  // console.log(total_bets);
  //       if (total_bets.length === 0) {
  //     return res.status(200).json({
  //         message: 'No More',
  //         status: false,
  //         timeStamp: timeNow,
  //     });
  // }
  const [total_K3_bets] = await connection.query(
    `SELECT * FROM result_k3 WHERE phone = ? AND status != 0 ORDER BY id DESC`,
    [userInfo.phone]
  );
  //   if (total_K3_bets.length === 0) {
  //     return res.status(200).json({
  //         message: 'No More',
  //         status: false,
  //         timeStamp: timeNow,
  //     });
  // }
  const [total_5D_bets] = await connection.query(
    `SELECT * FROM result_5d WHERE phone = ? AND status != 0 ORDER BY id DESC`,
    [userInfo.phone]
  );
  //   if (total_5D_bets.length === 0) {
  //     return res.status(200).json({
  //         message: 'No More',
  //         status: false,
  //         timeStamp: timeNow,
  //     });
  // }
  const [total_trx_bets] = await connection.query(
    `SELECT * FROM trxresult WHERE phone = ? AND status != 0 ORDER BY id DESC`,
    [userInfo.phone]
  );
  //   if (total_trx_bets.length === 0) {
  //     return res.status(200).json({
  //         message: 'No More',
  //         status: false,
  //         timeStamp: timeNow,
  //     });
  // }
  console.log(total_bets, total_K3_bets, total_5D_bets);
  return res.status(200).json({
    message: "Success",
    status: true,
    datas: total_bets,
    datas2: total_K3_bets,
    datas3: total_5D_bets,
    datas4: total_trx_bets,
  });
};

const TransferMoney = async (req, res) => {
  let auth = req.cookies.auth;
  let money = req.body.money;
  let pwd = req.body.password;

  console.log(money, pwd, auth);

  const time = Date.now();

  if (!auth || !pwd || !money) {
    return res.status(200).json({
      message: "Failed: Please fill the required fields",
      status: false,
      timeStamp: timeNow,
    });
  }

  const [rows] = await connection.query(
    "SELECT `password`, `phone`, `winning` FROM users WHERE `token` = ? ",
    [auth]
  );
  if (!rows) {
    return res.status(200).json({
      message: "Failed : user not found",
      status: false,
      timeStamp: timeNow,
    });
  }

  const hashPass = md5(pwd);
  const result = rows[0].password;

  if (hashPass !== result) {
    return res.status(200).json({
      message: "Failed : Password does not match",
      status: false,
      timeStamp: timeNow,
    });
  }

  if (money > rows[0].winning) {
    return res.status(200).json({
      message: "Failed: Insufficient balance",
      status: false,
      timeStamp: timeNow,
    });
  }

  const row_data = await connection.query(
    "UPDATE users SET winning = winning - ?, money = money + ?  WHERE token = ?",
    [money, money, auth]
  );
  console.log(row_data);
  console.log(rows[0].phone);
  let sql =
    "INSERT INTO transfer_money SET phone = ?, amount = ?,type=?, status = 7 ";
  await connection.query(sql, [rows[0].phone, money, "transfer money"]);

  const totalMoney = rows[0].winning - money;

  return res.status(200).json({
    message: "success: transfer successfully",
    status: true,
    data: row_data,
    winning: totalMoney,
    timeStamp: timeNow,
  });
};

// const TranstionDetails = async (req, res) => {
//     try {
//         let auth = req.cookies.auth;
//         let timeNow = new Date().toISOString();

//         if (!auth) {
//             return res.status(200).json({
//                 message: 'Failed',
//                 status: false,
//                 timeStamp: timeNow,
//             });
//         }

//         // Fetch user details
//         const [rows] = await connection.query('SELECT `phone` FROM users WHERE `token` = ?', [auth]);

//         if (rows.length === 0) {
//             return res.status(200).json({
//                 message: 'Failed : user not found',
//                 status: false,
//                 timeStamp: timeNow,
//             });
//         }

//         const userPhone = rows[0].phone;

//         // Query for transactions where the user is the sender
//         const [sentTransactions] = await connection.query(
//             'SELECT * FROM transfer_money WHERE sender_phone = ? AND `status` IN (1, 2, 3, 4, 5, 6, 7, 8, 9)',
//             [userPhone]
//         );

//         // Query for transactions where the user is the receiver with status 8
//         const [receiveTransactions] = await connection.query(
//             'SELECT * FROM transfer_money WHERE phone = ? AND `status` = 8',
//             [userPhone]
//         );

//         // Extract phone numbers from sent transactions
//         const sentTransactionPhones = sentTransactions.map(transaction => transaction.phone);
//         const receiveTransactionPhones = receiveTransactions.map(transaction => transaction.sender_phone);

//         // Collect status 8 transactions for sent transactions
//         let status8Transactions = [];
//         let status8SendTransactions = [];

//         // Loop through each phone number from sent transactions
//         for (let sentPhone of sentTransactionPhones) {
//             const [transactionsWithStatus8] = await connection.query(
//                 'SELECT * FROM transfer_money WHERE phone = ? AND `status` = 8',
//                 [sentPhone]
//             );
//             status8Transactions.push(...transactionsWithStatus8);  // Append the result to the array
//         }

//         for (let receivePhone of receiveTransactionPhones) {
//             console.log("this is in the loop :" +  receivePhone)

//              if (receivePhone === userPhone) {
//                     console.log( receivePhone);
//                     continue;
//                 }
//           const [transactionsWithStatus8] = await connection.query(
//                 'SELECT * FROM transfer_money WHERE sender_phone = ? AND `status` = 8',
//                 [receivePhone]
//             );

//             // Append the result to the status8SendTransactions array
//             status8SendTransactions.push(...transactionsWithStatus8);
//         }

//         // Check if no transactions are found
//         if (sentTransactions.length === 0 && status8SendTransactions.length === 0 && receiveTransactions.length === 0 && status8Transactions.length === 0) {
//           console.log("ERRR")
//         }

//         console.log("Sent Transactions: ", JSON.stringify(sentTransactions));
//         console.log("Status 8 Transactions: ", JSON.stringify(status8Transactions));
//         console.log("Receiving Transactions: ", JSON.stringify(receiveTransactions));
//         console.log("Status 8 Transactions: ", JSON.stringify(status8SendTransactions));

//         // Send response
//         return res.status(200).json({
//             message: 'Success: Transactions retrieved successfully',
//             status: true,
//             data: {
//                 received: status8Transactions,
//                 receiving: receiveTransactions,
//                 sent: sentTransactions,
//                 senting: status8SendTransactions,
//             },
//             timeStamp: timeNow,
//         });

//     } catch (error) {
//         console.error("Error in TranstionDetails:", error);
//         return res.status(500).json({
//             message: 'Failed: An error occurred while fetching transactions',
//             status: false,
//             error: error.message,
//             timeStamp: new Date().toISOString(),
//         });
//     }
// };
const TranstionDetails = async (req, res) => {
  try {
    let auth = req.cookies.auth;
    let timeNow = new Date().toISOString();

    if (!auth) {
      return res.status(200).json({
        message: "Failed",
        status: false,
        timeStamp: timeNow,
      });
    }

    // Fetch user details using token
    const [rows] = await connection.query(
      "SELECT `phone` FROM users WHERE `token` = ?",
      [auth]
    );

    if (rows.length === 0) {
      return res.status(200).json({
        message: "Failed: user not found",
        status: false,
        timeStamp: timeNow,
      });
    }

    const userPhone = rows[0].phone;

    // Fetch transactions where the user is either the sender or receiver
    const [transactions] = await connection.query(
      `
            SELECT amount, sender_phone, phone, status, type, time 
            FROM transfer_money 
            WHERE (sender_phone = ? OR phone = ?) AND status = 8 
            ORDER BY time DESC
        `,
      [userPhone, userPhone]
    );

    // Map the transactions to include a 'role' field (either 'sender' or 'receiver')
    const mappedTransactions = transactions.map((transaction) => {
      if (transaction.sender_phone === userPhone) {
        // Current user is the sender
        return {
          ...transaction,
          role: "sender", // Custom field to indicate role
        };
      } else {
        // Current user is the receiver
        return {
          ...transaction,
          role: "receiver", // Custom field to indicate role
        };
      }
    });

    // Send response with mapped transactions
    return res.status(200).json({
      message: "Success: Transactions retrieved successfully",
      status: true,
      data: mappedTransactions,
      timeStamp: timeNow,
    });
  } catch (error) {
    console.error("Error in TranstionDetails:", error);
    return res.status(500).json({
      message: "Failed: An error occurred while fetching transactions",
      status: false,
      error: error.message,
      timeStamp: new Date().toISOString(),
    });
  }
};

const TranstionInfoHistory = async (req, res) => {
  try {
    let auth = req.cookies.auth;
    let timeNow = new Date().toISOString();
    let type = req.query.type;
    if (!auth) {
      return res.status(200).json({
        message: "Failed: Authentication token not provided",
        status: false,
        timeStamp: timeNow,
      });
    }

    const [rows] = await connection.query(
      "SELECT `phone` FROM users WHERE `token` = ?",
      [auth]
    );

    if (rows.length === 0) {
      return res.status(200).json({
        message: "Failed: User not found",
        status: false,
        timeStamp: timeNow,
      });
    }

    const userPhone = rows[0].phone;

    let result = null;

    if (type == "reffralBonus") {
      // Fetch the transactions including the status field
      result = await connection.query(
        "SELECT * FROM transfer_money WHERE phone = ? and type='Invite Recharge bonus' ORDER BY `id` DESC",
        [userPhone]
      );
    } else 
    if (type == "rechargeBonus") {
      // Fetch the transactions including the status field
      result = await connection.query(
        "SELECT * FROM transfer_money WHERE phone = ? and type='Recharge bonus' ORDER BY `id` DESC",
        [userPhone]
      );
    } else {
      result = await connection.query(
        "SELECT * FROM transfer_money WHERE phone = ? ORDER BY `id` DESC",
        [userPhone]
      );
    }
    const [details] = result;

    if (details.length === 0) {
      return res.status(200).json({
        message: "Failed: No transactions found",
        status: false,
        timeStamp: timeNow,
      });
    }

    return res.status(200).json({
      message: "Success: Transactions retrieved successfully",
      status: true,
      data: details, // Ensure that status is part of the data
      timeStamp: timeNow,
    });
  } catch (error) {
    console.error("Error fetching transaction details:", error);
    return res.status(500).json({
      message: "Server error",
      status: false,
    });
  }
};

//     } catch (error) {
//         console.error("Error in TranstionInfoHistory:", error);
//         return res.status(500).json({
//             message: 'Failed: An error occurred while fetching transactions',
//             status: false,
//             error: error.message,
//         });
//     }
// };

const TransferP2PMoney = async (req, res) => {
  let auth = req.cookies.auth;
  let money = req.body.money;
  let pwd = req.body.password;
  let phone = req.body.phone;

  console.log(money, pwd, auth);

  const timeNow = Date.now();

  // Required field validation
  if (!auth || !pwd || !money || !phone) {
    return res.status(200).json({
      message: "Failed: Please fill the required fields",
      status: false,
      timeStamp: timeNow,
    });
  }

  // Minimum transaction check
  if (money < 500 || money > 10000) {
    return res.status(200).json({
      message: "Failed: Transaction amount should be between 500 and 10000",
      status: false,
      timeStamp: timeNow,
    });
  }

  // Check if recipient user exists
  const [users] = await connection.query(
    "SELECT `winning` FROM users WHERE `phone` = ?",
    [phone]
  );
  if (users.length === 0) {
    return res.status(200).json({
      message: "Failed: User number not found",
      status: false,
      timeStamp: timeNow,
    });
  }

  // Check if sender user exists
  const [rows] = await connection.query(
    "SELECT `password`, `phone`, `winning`, `phone` FROM users WHERE `token` = ?",
    [auth]
  );
  if (rows.length === 0) {
    return res.status(200).json({
      message: "Failed: User not found",
      status: false,
      timeStamp: timeNow,
    });
  }

  // Validate password
  const hashPass = md5(pwd);
  const result = rows[0].password;
  if (hashPass !== result) {
    return res.status(200).json({
      message: "Failed: Password does not match",
      status: false,
      timeStamp: timeNow,
    });
  }

  // Check if sender has sufficient balance
  if (money > rows[0].winning) {
    return res.status(200).json({
      message: "Failed: Insufficient balance",
      status: false,
      timeStamp: timeNow,
    });
  }

  // Perform transfer and update balances
  await connection.query(
    "UPDATE users SET winning = winning - ? WHERE token = ?",
    [money, auth]
  );
  await connection.query("UPDATE users SET money = money + ? WHERE phone = ?", [
    money,
    phone,
  ]);
  let receiverPhone = phone; // Ensure this is the receiver's phone number
  let senderPhone = rows[0].phone; // Ensure this is the sender's phone number

  let sql =
    "INSERT INTO transfer_money (amount, sender_phone, phone, status, type) VALUES (?, ?, ?, ?, ?)";
  await connection.query(sql, [
    money,
    senderPhone,
    receiverPhone,
    8,
    "transfer P2 money",
  ]);

  // Calculate the remaining balance

  // Calculate the remaining balance
  const totalMoney = rows[0].winning - money;

  // Return success response
  return res.status(200).json({
    message: "Success: Transfer successful",
    status: true,
    winning: totalMoney,
    timeStamp: timeNow,
  });
};

const rebateBonus = async (req, res) => {
  // let auth = req.cookies.auth;
  // if (!auth ) {
  //     return res.status(200).json({
  //         message: 'Failed',
  //         status: false,
  //         timeStamp: timeNow,
  //     });
  // }

  try {
    const [users] = await connection.query(
      "SELECT phone, rank FROM users WHERE `status` = ?",
      [1]
    );

    console.log(users);

    if (users.length === 0) {
      console.log("No active users found.");
      return res.status(200).json({
        message: "User not found",
        status: false,
        timeStamp: timeNow,
      });
    }

    users.forEach(async (user) => {
      const userPhone = user.phone;
      const userRank = user.rank || 1;

      console.log(userRank);

      const [ranking] = await connection.query(
        "SELECT * FROM ranking WHERE level = ? AND `status` = 1",
        [userRank]
      );
      const [[details]] = await connection.query(
        "SELECT SUM(money + fee) AS totalMoney FROM minutes_1 WHERE phone = ? AND  DATE(today) = CURDATE()",
        [userPhone]
      );

      if (details.totalMoney === null) {
        console.log(`No recharge data found for user ${userPhone}.`);
      }
      if (ranking[0].f5 === null) {
        console.log(`No Rank found for user ${userPhone}.`);
      }
      const percentage = ranking[0].f5;

      const money = Math.floor(
        eval((details.totalMoney || 0) / (100 / percentage))
      );

      if (money > 0) {
        const sql =
          "INSERT INTO rebate_bonus (amount, phone, status) VALUES (?, ?, ?)";
        await connection.query(sql, [money, userPhone, 0]);
      }

      console.log(`Rebate of ${money} inserted for user ${userPhone}.`);
    });
  } catch (error) {
    console.error("Error processing rebate:", error);
  }
};

const fetchRebateBonus = async (req, res) => {
  try {
    let auth = req.cookies.auth;
    let timeNow = new Date().toISOString(); // Define timeNow for logging timestamps

    // Fetch user based on phone number
    const [users] = await connection.query(
      "SELECT `phone`, `money` FROM users WHERE `token` = ?",
      [auth]
    );

    // Check if the user exists
    if (users.length === 0) {
      return res.status(200).json({
        message: "Failed: User Number not found",
        status: false,
        timeStamp: timeNow,
      });
    }

    // Fetch bet amount from rebate_bonus table
    const [bet_amount] = await connection.query(
      "SELECT `amount` FROM rebate_bonus WHERE `phone` = ? AND `status` = 0",
      [users[0].phone]
    );

    // Check if bet amount exists
    if (bet_amount.length === 0) {
      return res.status(200).json({
        message: "Failed: No bet amount found for the user",
        status: false,
        timeStamp: timeNow,
      });
    }

    // Return the bet amount if found
    return res.status(200).json({
      message: "Success: Bet amount retrieved successfully",
      status: true,
      data: bet_amount[0], // Assuming you want the first entry
      timeStamp: timeNow,
    });
  } catch (error) {
    console.error("Error processing rebate:", error);
    return res.status(500).json({
      message: "Server error",
      status: false,
      error: error.message,
      timeStamp: new Date().toISOString(),
    });
  }
};

const collectRebateBonus = async (req, res) => {
  try {
    let auth = req.cookies.auth;
    let bonus = req.body.bonus;
    let netAmount = req.body.netAmount;
    let timeNow = new Date().toISOString();

    const [users] = await connection.query(
      "SELECT `phone`, `money` FROM users WHERE `token` = ?",
      [auth]
    );

    if (users.length === 0) {
      return res.status(200).json({
        message: "Failed: User Number not found",
        status: false,
        timeStamp: timeNow,
      });
    }

    console.log(bonus, netAmount);

    await connection.query(
      "UPDATE users SET winning = winning + ? WHERE phone = ?",
      [bonus, users[0].phone]
    );
    await connection.query(
      "UPDATE rebate_bonus SET status = ? WHERE phone = ?",
      [1, users[0].phone]
    );
    // Fetch bet amount from rebate_bonus table
    const sql =
      "INSERT INTO transfer_money (amount, phone, type, status) VALUES (?, ?, ?, ?)";
    await connection.query(sql, [bonus, users[0].phone, "Rebat Bonus", 1]);
    console.log(bonus, netAmount);

    // Return the bet amount if found
    return res.status(200).json({
      message: "Success: Bet amount retrieved successfully",
      status: true, // Assuming you want the first entry
      timeStamp: timeNow,
    });
  } catch (error) {
    console.error("Error processing rebate:", error);
    return res.status(500).json({
      message: "Server error",
      status: false,
      error: error.message,
      timeStamp: new Date().toISOString(),
    });
  }
};

const TotalReferrals = async (req, res) => {
  const timeNow = new Date();
  // let auth = req.user.user.phone;
  let auth = req.cookies.auth;

  if (!auth) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }

  try {
    const [rows] = await connection.query(
      "SELECT * FROM users WHERE `token` = ?",
      [auth]
    );

    if (!rows.length) {
      return res.status(200).json({
        message: "Failed",
        status: false,
        timeStamp: timeNow,
      });
    }

    const userInfo = rows[0];
    const todayTotalCommission = userInfo.roses_today;
    const [total_ref1] = await connection.query(
      "SELECT * FROM users WHERE `invite` = ? AND DATE(today) = CURDATE()",
      [userInfo.code]
    );
    const [total_ref] = await connection.query(
      "SELECT * FROM users WHERE `invite` = ?",
      [userInfo.code]
    );

    // if (!total_ref.length) {
    //     return res.status(200).json({
    //         message: 'No User more',
    //         status: false,
    //         timeStamp: timeNow,
    //     });
    // }
    // if (!total_ref1.length) {
    //     return res.status(200).json({
    //         message: 'No User more',
    //         status: false,
    //         timeStamp: timeNow,
    //     });
    // }

    const total = total_ref.length;
    const totalDirect = total_ref1.length;
    let RechargeTotalAmount = 0;
    let RechargetotalNumber = 0;
    let firstRechargeUsersCount = 0;

    for (let user of total_ref) {
      const [firstRecharge] = await connection.query(
        "SELECT * FROM recharge WHERE `phone` = ? AND first_recharge = 1 AND status = 1 AND DATE(today) = CURDATE()",
        [user.phone]
      );
      if (firstRecharge.length > 0) {
        firstRechargeUsersCount++;
      }
      console.log("first Recharge count :" + firstRechargeUsersCount);
      const [rechargeData] = await connection.query(
        "SELECT money FROM recharge WHERE `phone` = ? AND status = 1 AND DATE(today) = CURDATE()",
        [user.phone]
      );

      // console.log(rechargeData[0])

      if (rechargeData.length) {
        for (let record of rechargeData) {
          RechargeTotalAmount += record.money; // assuming column name is `money`
          RechargetotalNumber++;
        }
      }
    }

    const referralData = await fetchReferralsData(userInfo.code, 1, 20);

    return res.status(200).json({
      message: "Success",
      status: true,
      data: {
        total: total,
        totalDirect: totalDirect,
        todayCommission: todayTotalCommission,
        totalAmount: RechargeTotalAmount,
        totalRecharges: RechargetotalNumber,
        firstRechargeUsers: firstRechargeUsersCount,
        totalTeamMember: referralData.total,
        teamMember: referralData.totalmem,
        totalTeamAmount: referralData.totalAmount,
        totalTeamRecharge: referralData.totalRecharges,
        totalTeamFirstRecharge: referralData.firstRechargeUsers,
        totalUserDetail: referralData.referral,
      },
      timeStamp: timeNow,
    });
  } catch (error) {
    console.error("Error fetching referrals:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      status: false,
      timeStamp: timeNow,
    });
  }
};

const getUserInfo = async (phone) => {
  const [userInfo] = await connection.query(
    "SELECT * FROM users WHERE phone = ?",
    [phone]
  );
  return userInfo[0];
};

// const fetchReferralsData = async (inviteCode, level, maxLevels) => {
//     if (level > maxLevels) return { total: 0, totalAmount: 0, totalRecharges: 0, firstRechargeUsers: 0, referral: [] };

//     const [referrals] = await connection.query('SELECT * FROM users WHERE invite = ?', [inviteCode]);
//     const [referrals1] = await connection.query('SELECT * FROM users WHERE invite = ? AND DATE(today) = CURDATE()', [inviteCode]);

//     if (!referrals.length) return { total: 0, totalmem: 0, totalAmount: 0, totalRecharges: 0, firstRechargeUsers: 0, referral: [] };

//     let totalmem = referrals1.length;
//     let total = referrals.length;
//     let allReferrals = [];
//     let totalAmount = 0;
//     let totalRecharges = 0;
//     let firstRechargeUsers = 0;

//     for (let referral of referrals) {
//         const [firstRecharge] = await connection.query('SELECT * FROM recharge WHERE phone = ? AND first_recharge = 1 AND DATE(today) = CURDATE()', [referral.phone]);
//         if (firstRecharge.length > 0) {
//             firstRechargeUsers++;
//         }

//         const [rechargeData] = await connection.query('SELECT money FROM recharge WHERE phone = ? AND DATE(today) = CURDATE()', [referral.phone]);
//         let userRecharges = [];
//         if (rechargeData.length) {
//             for (let record of rechargeData) {
//                 totalAmount += record.money;
//                 totalRecharges++;
//                 userRecharges.push({
//                     phone: referral.phone,
//                     rechargeMoney: record.money,
//                     time: record.time,
//                     inviteCode: referral.invite // Use referral.invite to capture the invite code
//                 });
//             }
//             allReferrals.push({
//                 phone: referral.phone,
//                 recharges: userRecharges
//             });
//         }

//         const childReferralsData = await fetchReferralsData(referral.code, level + 1, maxLevels);
//         total += childReferralsData.total;
//         totalmem += childReferralsData.totalmem;
//         totalAmount += childReferralsData.totalAmount;
//         totalRecharges += childReferralsData.totalRecharges;
//         firstRechargeUsers += childReferralsData.firstRechargeUsers;
//         allReferrals = allReferrals.concat(childReferralsData.referral);

//     }

//     return { total, totalmem, referral: allReferrals, totalAmount, totalRecharges, firstRechargeUsers };
// };
const fetchReferralsData = async (inviteCode, level, maxLevels) => {
  if (level > maxLevels) {
    return {
      total: 0,
      totalmem: 0,
      totalAmount: 0,
      totalRecharges: 0,
      firstRechargeUsers: 0,
      referral: [],
    };
  }

  // Fetch all referrals in a single query
  const [referrals] = await connection.query(
    `
        SELECT u.phone, u.code, u.invite, 
               r.money, r.first_recharge, r.time,r.status 
        FROM users u 
        LEFT JOIN recharge r ON u.phone = r.phone AND DATE(r.today) = CURDATE() 
        WHERE u.invite = ?`,
    [inviteCode]
  );

  if (!referrals.length)
    return {
      total: 0,
      totalmem: 0,
      totalAmount: 0,
      totalRecharges: 0,
      firstRechargeUsers: 0,
      referral: [],
    };

  let totalmem = referrals.filter((r) => r.money !== null).length;
  let total = referrals.length;
  let totalAmount = 0;
  let totalRecharges = 0;
  let firstRechargeUsers = 0;
  let allReferrals = [];

  let childPromises = [];

  for (let referral of referrals) {
    if (referral.first_recharge === 1) {
      firstRechargeUsers++;
    }
    if (referral.money !== null) {
      if (referral.status === 1) {
        totalAmount += referral.money;
        totalRecharges++;
      }

      allReferrals.push({
        phone: referral.phone,
        recharges: [
          {
            phone: referral.phone,
            rechargeMoney: referral.money,
            time: referral.time,
            inviteCode: referral.invite,
          },
        ],
      });
    }
    if (referral.code) {
      childPromises.push(
        fetchReferralsData(referral.code, level + 1, maxLevels)
      );
    }
  }

  // Fetch child referrals concurrently
  const childReferralsData = await Promise.all(childPromises);

  for (const childData of childReferralsData) {
    total += childData.total;
    totalmem += childData.totalmem;
    totalAmount += childData.totalAmount;
    totalRecharges += childData.totalRecharges;
    firstRechargeUsers += childData.firstRechargeUsers;
    allReferrals = allReferrals.concat(childData.referral);
  }

  return {
    total,
    totalmem,
    totalAmount,
    totalRecharges,
    firstRechargeUsers,
    referral: allReferrals,
  };
};

const BonusGet = async (req, res) => {
  try {
    let auth = req.cookies.auth;
    let timeNow = new Date().toISOString(); // Define timeNow for logging timestamps

    // Fetch user based on phone number
    const [users] = await connection.query(
      "SELECT `phone`, `money` FROM users WHERE `token` = ?",
      [auth]
    );

    // Check if the user exists
    if (users.length === 0) {
      return res.status(200).json({
        message: "Failed: User Number not found",
        status: false,
        timeStamp: timeNow,
      });
    }

    // Fetch bet amount from rebate_bonus table
    const [betting_commission] = await connection.query(
      "SELECT SUM(`amount`) as total_amount FROM betting_commission WHERE `phone` = ? AND `status` = 1 AND DATE(`today`) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)",
      [users[0].phone]
    );

    const [total_commission] = await connection.query(
      "SELECT SUM(`amount`) as total_amount FROM betting_commission WHERE `phone` = ? AND `status` = 1",
      [users[0].phone]
    );

    const [week_commission] = await connection.query(
      // 'SELECT SUM(`amount`) as total_amount FROM betting_commission WHERE `phone` = ? AND `status` = 1 AND `today` BETWEEN DATE_SUB(CURDATE(), INTERVAL 7 DAY) AND DATE_SUB(CURDATE(), INTERVAL 1 DAY)',
      "SELECT SUM(`amount`) as total_amount FROM betting_commission WHERE `phone` = ? AND `status` = 1 AND `today` BETWEEN DATE_SUB(CURDATE(), INTERVAL 7 DAY) AND CURDATE()",
      [users[0].phone]
    );

    const [betting_get] = await connection.query(
      "SELECT * FROM betting_commission WHERE `phone` = ? AND `status` = 1 ORDER BY id DESC",
      [users[0].phone]
    );

    return res.status(200).json({
      message: "Success: Bet amount successfully",
      status: true,
      data: { betting_commission, week_commission, total_commission },
      betting_commission: betting_get,
      timeStamp: timeNow,
    });
  } catch (error) {
    console.error("Error processing rebate:", error);
    return res.status(500).json({
      message: "Server error",
      status: false,
      error: error.message,
      timeStamp: new Date().toISOString(),
    });
  }
};

const RechargeCalculate = async (req, res) => {
  try {
    let auth = req.cookies.auth;
    // let auth = 1234567890;
    let timeNow = new Date().toISOString(); // Define timeNow for logging timestamps

    // Fetch user based on phone number
    const [users] = await connection.query(
      "SELECT `phone`, `money` FROM users WHERE `token` = ?",
      [auth]
    );

    // Check if the user exists
    if (users.length === 0) {
      return res.status(200).json({
        message: "Failed: User Number not found",
        status: false,
        timeStamp: timeNow,
      });
    }

    // Fetch bet amount from rebate_bonus table
    const [total_recharge] = await connection.query(
      "SELECT SUM(`money`) as total_recharge FROM recharge WHERE `phone` = ? AND `status` = 1",
      [users[0].phone]
    );

    const [recharge_amount] = await connection.query(
      "SELECT SUM(`money`) as total_recharge FROM recharge WHERE `phone` = ? AND `status` = 1 AND `today` >= DATE_SUB(NOW(), INTERVAL 30 DAY)",
      [users[0].phone]
    );
    // Check if bet amount exists
    if (total_recharge.length === 0) {
      return res.status(200).json({
        message: "Failed: No bet amount found for the user",
        status: false,
        timeStamp: timeNow,
      });
    }

    // Return the bet amount if found
    return res.status(200).json({
      message: "Success: Bet amount retrieved successfully",
      status: true,
      data: {
        total: total_recharge[0].total_recharge,
        total_30_days: recharge_amount[0].total_recharge,
      }, // Assuming you want the first entry
      timeStamp: timeNow,
    });
  } catch (error) {
    console.error("Error processing rebate:", error);
    return res.status(500).json({
      message: "Server error",
      status: false,
      error: error.message,
      timeStamp: new Date().toISOString(),
    });
  }
};

const loginNotice = async (req, res) => {
  try {
    let auth = req.cookies.auth;
    // let auth = 1234567890;
    let timeNow = new Date().toISOString(); // Define timeNow for logging timestamps

    // Fetch user based on phone number
    const [users] = await connection.query(
      "SELECT `phone`, `money`, `today` FROM users WHERE `token` = ?",
      [auth]
    );

    // Check if the user exists
    if (users.length === 0) {
      return res.status(200).json({
        message: "Failed: User Number not found",
        status: false,
        timeStamp: timeNow,
      });
    }

    // Fetch bet amount from rebate_bonus table
    const [login_notice] = await connection.query(
      "SELECT * FROM login_notification WHERE `phone` = ?",
      [users[0].phone]
    );

    // Check if bet amount exists
    if (login_notice.length === 0) {
      return res.status(200).json({
        message: "Failed: No data",
        status: false,
        timeStamp: timeNow,
      });
    }

    // Return the bet amount if found
    return res.status(200).json({
      message: "Success: login notifications",
      status: true,
      data: login_notice,
      register: users[0].today,
      timeStamp: timeNow,
    });
  } catch (error) {
    console.error("Error processing :", error);
    return res.status(500).json({
      message: "Server error",
      status: false,
      error: error.message,
      timeStamp: new Date().toISOString(),
    });
  }
};

const loginNoticeDelete = async (req, res) => {
  try {
    let auth = req.cookies.auth;
    let id = req.params.id;

    if (!auth || !id) {
      return res.status(200).json({
        message: " Fill Required Feild",
        status: false,
        timeStamp: timeNow,
      });
    }

    // Fetch user based on phone number
    await connection.query("DELETE * FROM login_notification WHERE `id` = ?", [
      id,
    ]);

    // Return the bet amount if found
    return res.status(200).json({
      message: "Deleted Successfully",
      status: true,
      timeStamp: timeNow,
    });
  } catch (error) {
    console.error("Error processing :", error);
    return res.status(500).json({
      message: "Server error",
      status: false,
      error: error.message,
      timeStamp: new Date().toISOString(),
    });
  }
};

const GameStatistics = async (req, res) => {
  try {
    let auth = req.cookies.auth;
    // let auth = 1234567890;
    let timeNow = new Date().toISOString(); // Define timeNow for logging timestamps

    // Fetch user based on phone number
    const [users] = await connection.query(
      "SELECT `phone`, `money`, `today` FROM users WHERE `token` = ?",
      [auth]
    );

    // Check if the user exists
    if (users.length === 0) {
      return res.status(200).json({
        message: "Failed: User Number not found",
        status: false,
        timeStamp: timeNow,
      });
    }

    // Query for `minutes_1` table
    const [LotteryStats] = await connection.query(
      `
    SELECT 
        IFNULL(SUM(money), 0) AS total_money, 
        IFNULL(SUM(\`get\`), 0) AS total_profit,
        IFNULL(COUNT(*), 0) AS total_length,
        'today' AS period
    FROM minutes_1
    WHERE phone = ? AND DATE(today) = CURDATE()

    UNION ALL

    SELECT 
        IFNULL(SUM(money), 0) AS total_money, 
        IFNULL(SUM(\`get\`), 0) AS total_profit,
        IFNULL(COUNT(*), 0) AS total_length,
        'yesterday' AS period
    FROM minutes_1
    WHERE phone = ? AND DATE(today) = CURDATE() - INTERVAL 1 DAY

    UNION ALL

    SELECT 
        IFNULL(SUM(money), 0) AS total_money, 
        IFNULL(SUM(\`get\`), 0) AS total_profit,
        IFNULL(COUNT(*), 0) AS total_length,
        'last_week' AS period
    FROM minutes_1
    WHERE phone = ? AND YEARWEEK(today, 1) = YEARWEEK(CURDATE(), 1)

    UNION ALL

    SELECT 
        IFNULL(SUM(money), 0) AS total_money, 
        IFNULL(SUM(\`get\`), 0) AS total_profit,
        IFNULL(COUNT(*), 0) AS total_length,
        'last_month' AS period
    FROM minutes_1
    WHERE phone = ? AND MONTH(today) = MONTH(CURDATE())
    AND YEAR(today) = YEAR(CURDATE())
`,
      [users[0].phone, users[0].phone, users[0].phone, users[0].phone]
    );

    // Query for `result_5d` table
    const [LotteryStats1] = await connection.query(
      `
    SELECT 
        IFNULL(SUM(money), 0) AS total_money, 
        IFNULL(SUM(\`get\`), 0) AS total_profit,
        IFNULL(COUNT(*), 0) AS total_length,
        'today' AS period
    FROM result_5d
    WHERE phone = ? AND DATE(today) = CURDATE()

    UNION ALL

    SELECT 
        IFNULL(SUM(money), 0) AS total_money, 
        IFNULL(SUM(\`get\`), 0) AS total_profit,
        IFNULL(COUNT(*), 0) AS total_length,
        'yesterday' AS period
    FROM result_5d
    WHERE phone = ? AND DATE(today) = CURDATE() - INTERVAL 1 DAY

    UNION ALL

    SELECT 
        IFNULL(SUM(money), 0) AS total_money, 
        IFNULL(SUM(\`get\`), 0) AS total_profit,
        IFNULL(COUNT(*), 0) AS total_length,
        'last_week' AS period
    FROM result_5d
    WHERE phone = ? AND YEARWEEK(today, 1) = YEARWEEK(CURDATE(), 1)

    UNION ALL

    SELECT 
        IFNULL(SUM(money), 0) AS total_money, 
        IFNULL(SUM(\`get\`), 0) AS total_profit,
        IFNULL(COUNT(*), 0) AS total_length,
        'last_month' AS period
    FROM result_5d
    WHERE phone = ? AND MONTH(today) = MONTH(CURDATE())
    AND YEAR(today) = YEAR(CURDATE())
`,
      [users[0].phone, users[0].phone, users[0].phone, users[0].phone]
    );

    // Query for `result_k3` table
    const [LotteryStats2] = await connection.query(
      `
    SELECT 
        IFNULL(SUM(money), 0) AS total_money, 
        IFNULL(SUM(\`get\`), 0) AS total_profit,
        IFNULL(COUNT(*), 0) AS total_length,
        'today' AS period
    FROM result_k3
    WHERE phone = ? AND DATE(today) = CURDATE()

    UNION ALL

    SELECT 
        IFNULL(SUM(money), 0) AS total_money, 
        IFNULL(SUM(\`get\`), 0) AS total_profit,
        IFNULL(COUNT(*), 0) AS total_length,
        'yesterday' AS period
    FROM result_k3
    WHERE phone = ? AND DATE(today) = CURDATE() - INTERVAL 1 DAY

    UNION ALL

    SELECT 
        IFNULL(SUM(money), 0) AS total_money, 
        IFNULL(SUM(\`get\`), 0) AS total_profit,
        IFNULL(COUNT(*), 0) AS total_length,
        'last_week' AS period
    FROM result_k3
    WHERE phone = ? AND YEARWEEK(today, 1) = YEARWEEK(CURDATE(), 1)

    UNION ALL

    SELECT 
        IFNULL(SUM(money), 0) AS total_money, 
        IFNULL(SUM(\`get\`), 0) AS total_profit,
        IFNULL(COUNT(*), 0) AS total_length,
        'last_month' AS period
    FROM result_k3
    WHERE phone = ? AND MONTH(today) = MONTH(CURDATE())
    AND YEAR(today) = YEAR(CURDATE())
`,
      [users[0].phone, users[0].phone, users[0].phone, users[0].phone]
    );

    // Query for `trxresult` table
    const [LotteryStats3] = await connection.query(
      `
    SELECT 
        IFNULL(SUM(money), 0) AS total_money, 
        IFNULL(SUM(\`get\`), 0) AS total_profit,
        IFNULL(COUNT(*), 0) AS total_length,
        'today' AS period
    FROM trxresult
    WHERE phone = ? AND DATE(today) = CURDATE()

    UNION ALL

    SELECT 
        IFNULL(SUM(money), 0) AS total_money, 
        IFNULL(SUM(\`get\`), 0) AS total_profit,
        IFNULL(COUNT(*), 0) AS total_length,
        'yesterday' AS period
    FROM trxresult
    WHERE phone = ? AND DATE(today) = CURDATE() - INTERVAL 1 DAY

    UNION ALL

    SELECT 
        IFNULL(SUM(money), 0) AS total_money, 
        IFNULL(SUM(\`get\`), 0) AS total_profit,
        IFNULL(COUNT(*), 0) AS total_length,
        'last_week' AS period
    FROM trxresult
    WHERE phone = ? AND YEARWEEK(today, 1) = YEARWEEK(CURDATE(), 1)

    UNION ALL

    SELECT 
        IFNULL(SUM(money), 0) AS total_money, 
        IFNULL(SUM(\`get\`), 0) AS total_profit,
        IFNULL(COUNT(*), 0) AS total_length,
        'last_month' AS period
    FROM trxresult
    WHERE phone = ? AND MONTH(today) = MONTH(CURDATE())
    AND YEAR(today) = YEAR(CURDATE())
`,
      [users[0].phone, users[0].phone, users[0].phone, users[0].phone]
    );

    const oneDayTotalSum =
      Number(LotteryStats[0].total_money) +
      Number(LotteryStats1[0].total_money) +
      Number(LotteryStats2[0].total_money) +
      Number(LotteryStats3[0].total_money);

    const oneDayTotalProfit =
      Number(LotteryStats[0].total_profit) +
      Number(LotteryStats1[0].total_profit) +
      Number(LotteryStats2[0].total_profit) +
      Number(LotteryStats3[0].total_profit);

    const oneDayTotalLength =
      Number(LotteryStats[0].total_length) +
      Number(LotteryStats1[0].total_length) +
      Number(LotteryStats2[0].total_length) +
      Number(LotteryStats3[0].total_length);

    const yesterdayTotalSum =
      Number(LotteryStats[1].total_money) +
      Number(LotteryStats1[1].total_money) +
      Number(LotteryStats2[1].total_money) +
      Number(LotteryStats3[1].total_money);

    const yesterdayTotalProfit =
      Number(LotteryStats[1].total_profit) +
      Number(LotteryStats1[1].total_profit) +
      Number(LotteryStats2[1].total_profit) +
      Number(LotteryStats3[1].total_profit);

    const yesterdayTotalLength =
      Number(LotteryStats[1].total_length) +
      Number(LotteryStats1[1].total_length) +
      Number(LotteryStats2[1].total_length) +
      Number(LotteryStats3[1].total_length);

    const weekTotalSum =
      Number(LotteryStats[2].total_money) +
      Number(LotteryStats1[2].total_money) +
      Number(LotteryStats2[2].total_money) +
      Number(LotteryStats3[2].total_money);

    const weekTotalProfit =
      Number(LotteryStats[2].total_profit) +
      Number(LotteryStats1[2].total_profit) +
      Number(LotteryStats2[2].total_profit) +
      Number(LotteryStats3[2].total_profit);

    const weekTotalLength =
      Number(LotteryStats[2].total_length) +
      Number(LotteryStats1[2].total_length) +
      Number(LotteryStats2[2].total_length) +
      Number(LotteryStats3[2].total_length);

    const monthTotalSum =
      Number(LotteryStats[3].total_money) +
      Number(LotteryStats1[3].total_money) +
      Number(LotteryStats2[3].total_money) +
      Number(LotteryStats3[3].total_money);

    const monthTotalProfit =
      Number(LotteryStats[3].total_profit) +
      Number(LotteryStats1[3].total_profit) +
      Number(LotteryStats2[3].total_profit) +
      Number(LotteryStats3[3].total_profit);

    const monthTotalLength =
      Number(LotteryStats[3].total_length) +
      Number(LotteryStats1[3].total_length) +
      Number(LotteryStats2[3].total_length) +
      Number(LotteryStats3[3].total_length);

    // console.log("this is all data: " + oneDayTotalSum, oneDayTotalProfit, oneDayTotalLength);
    // console.log("this is yesterday data: " + yesterdayTotalSum, yesterdayTotalProfit, yesterdayTotalLength);
    // console.log("this is week data: " + weekTotalSum, weekTotalProfit, weekTotalLength);
    // console.log("this is month data: " + monthTotalSum, monthTotalProfit, monthTotalLength);

    // Return the bet amount if found
    return res.status(200).json({
      message: "Success: login notifications",
      status: true,
      data: {
        today: { oneDayTotalSum, oneDayTotalProfit, oneDayTotalLength },
        yesterday: {
          yesterdayTotalSum,
          yesterdayTotalProfit,
          yesterdayTotalLength,
        },
        week: { weekTotalSum, weekTotalProfit, weekTotalLength },
        month: { monthTotalSum, monthTotalProfit, monthTotalLength },
        allData: { LotteryStats, LotteryStats1, LotteryStats2, LotteryStats3 },
      },
      timeStamp: timeNow,
    });
  } catch (error) {
    console.error("Error processing :", error);
    return res.status(500).json({
      message: "Server error",
      status: false,
      error: error.message,
      timeStamp: new Date().toISOString(),
    });
  }
};

const Feedback = async (req, res) => {
  let auth = req.cookies.auth;
  let content = req.body.content;

  console.log(content, auth);

  const timeNow = Date.now();

  // Required field validation
  if (!auth || !content) {
    return res.status(200).json({
      message: "Failed: Please fill the required fields",
      status: false,
      timeStamp: timeNow,
    });
  }
  // Check if recipient user exists
  const [users] = await connection.query(
    "SELECT * FROM users WHERE `token` = ?",
    [auth]
  );
  if (users.length === 0) {
    return res.status(200).json({
      message: "Failed: User not found",
      status: false,
      timeStamp: timeNow,
    });
  }

  const userPhone = users[0].phone;

  await connection.execute("INSERT INTO feedback SET phone = ?, content = ?", [
    userPhone,
    content,
  ]);

  return res.status(200).json({
    message: "Success: Feedback submited",
    status: true,
    timeStamp: timeNow,
  });
};

const fetchNotice = async (req, res) => {
  try {
    let auth = req.cookies.auth;
    let timeNow = new Date().toISOString(); // Define timeNow for logging timestamps

    // Fetch user based on phone number
    const [users] = await connection.query(
      "SELECT `phone`, `money` FROM users WHERE `token` = ?",
      [auth]
    );

    // Check if the user exists
    if (users.length === 0) {
      return res.status(200).json({
        message: "Failed: User Number not found",
        status: false,
        timeStamp: timeNow,
      });
    }

    // Fetch bet amount from rebate_bonus table
    const [notices] = await connection.query(
      "SELECT * FROM notification WHERE `status` = ?",
      [1]
    );

    // Check if bet amount exists
    if (notices.length === 0) {
      return res.status(200).json({
        message: "Failed: No data",
        status: false,
        timeStamp: timeNow,
      });
    }

    // Return the bet amount if found
    return res.status(200).json({
      message: "Success: Notice Fetch successfully",
      status: true,
      data: notices, // Assuming you want the first entry
      timeStamp: timeNow,
    });
  } catch (error) {
    console.error("Error processing rebate:", error);
    return res.status(500).json({
      message: "Server error",
      status: false,
      error: error.message,
      timeStamp: new Date().toISOString(),
    });
  }
};

const VIPLevelAsseing = async (req, res) => {
  try {
    let auth = req.cookies.auth;
    // let auth = 1234567890;
    let timeNow = new Date().toISOString();

    // Fetch user based on phone number
    const [users] = await connection.query(
      "SELECT `phone`, `money` FROM users WHERE `token` = ?",
      [auth]
    );

    // Check if the user exists
    if (users.length === 0) {
      return res.status(200).json({
        message: "Failed: User Number not found",
        status: false,
        timeStamp: timeNow,
      });
    }

    const userInfo = users[0];

    // Fetch bet amount from rebate_bonus table
    // const [vip] = await connection.query('SELECT IFNULL(SUM(money + fee), 0) AS total_money FROM minutes_1 WHERE  `phone` = ?', [userInfo.phone]);
    const [rows] = await connection.query(
      "SELECT IFNULL(SUM(money + fee), 0) AS total_money FROM minutes_1 WHERE phone = ?",
      [userInfo.phone]
    );
    const [rows2] = await connection.query(
      "SELECT IFNULL(SUM(money + fee), 0) AS total_money FROM result_5d WHERE phone = ?",
      [userInfo.phone]
    );
    const [rows3] = await connection.query(
      "SELECT IFNULL(SUM(money + fee), 0) AS total_money FROM result_k3 WHERE phone = ?",
      [userInfo.phone]
    );
    const [rows4] = await connection.query(
      "SELECT IFNULL(SUM(money + fee), 0) AS total_money FROM trxresult WHERE phone = ?",
      [userInfo.phone]
    );

    if (
      rows.length === 0 &&
      rows2.length === 0 &&
      rows3.length === 0 &&
      rows4.length === 0
    ) {
      return res.status(200).json({
        message: "Failed: No data",
        status: false,
        timeStamp: timeNow,
      });
    }

    const wingo = rows[0].total_money;
    const trx = rows2[0].total_money;
    const k3 = rows3[0].total_money;
    const d5 = rows4[0].total_money;

    const vipLevel = Number(wingo) + Number(trx) + Number(k3) + Number(d5);
    console.log(
      "wingo : " + wingo,
      "trx : " + trx,
      "k3 :" + k3,
      "5d : " + d5,
      "Total : " + vipLevel
    );

    const [AmountRange] = await connection.query(
      "SELECT * FROM ranking ORDER BY desn DESC"
    );

    if (AmountRange.length === 0) {
      return res.status(200).json({
        message: "Failed: Ranking Amount Range not found",
        status: false,
        timeStamp: timeNow,
      });
    }

    let rank = "";
    let bonus = "";
    let monthBonus = "";

    AmountRange.forEach((range) => {
      if (vipLevel >= range.f1 && vipLevel <= range.f2) {
        rank = range.level;
        bonus = range.f3;
        monthBonus = range.f4;
      }
    });

    const [check_bonus] = await connection.query(
      "SELECT * FROM rank_bonus WHERE phone = ? AND rank = ?",
      [userInfo.phone, rank]
    );

    if (check_bonus.length > 0) {
      return res.status(200).json({
        message: "Failed: Bonus already given",
        status: false,
        timeStamp: timeNow,
      });
    }

    // console.log(bonus, rank, monthBonus)

    const sql =
      "INSERT INTO rank_bonus (phone, rank, amount, month_amt, status) VALUES (?, ?, ?, ?, ?)";
    await connection.query(sql, [userInfo.phone, rank, bonus, monthBonus, 1]);

    const updateMoney = Number(bonus) + Number(monthBonus);

    await connection.query(
      "UPDATE users SET winning = winning + ?, rank = ? WHERE phone = ?",
      [updateMoney, rank, userInfo.phone]
    );

    return res.status(200).json({
      message: "VIP Level Fetch Successfully",
      status: true,
      rank: rank,
      timeStamp: timeNow,
    });
  } catch (error) {
    console.error("Error processing :", error);
    return res.status(500).json({
      message: "Server error",
      status: false,
      error: error.message,
      timeStamp: new Date().toISOString(),
    });
  }
};

const fetchVIPLevelDetails = async (req, res) => {
  try {
    let auth = req.cookies.auth;
    let timeNow = new Date().toISOString(); // Define timeNow for logging timestamps

    // Fetch user based on phone number
    const [users] = await connection.query(
      "SELECT `phone`, `money` FROM users WHERE `token` = ?",
      [auth]
    );

    // Check if the user exists
    if (users.length === 0) {
      return res.status(200).json({
        message: "Failed: User Number not found",
        status: false,
        timeStamp: timeNow,
      });
    }

    const userInfo = users[0];

    // Fetch bet amount from rebate_bonus table
    // const [vip] = await connection.query('SELECT IFNULL(SUM(money + fee), 0) AS total_money FROM minutes_1 WHERE  `phone` = ?', [userInfo.phone]);
    const [rows] = await connection.query(
      "SELECT IFNULL(SUM(money + fee), 0) AS total_money FROM minutes_1 WHERE phone = ?",
      [userInfo.phone]
    );
    const [rows2] = await connection.query(
      "SELECT IFNULL(SUM(money + fee), 0) AS total_money FROM result_5d WHERE phone = ?",
      [userInfo.phone]
    );
    const [rows3] = await connection.query(
      "SELECT IFNULL(SUM(money + fee), 0) AS total_money FROM result_k3 WHERE phone = ?",
      [userInfo.phone]
    );
    const [rows4] = await connection.query(
      "SELECT IFNULL(SUM(money + fee), 0) AS total_money FROM trxresult WHERE phone = ?",
      [userInfo.phone]
    );

    if (
      rows.length === 0 &&
      rows2.length === 0 &&
      rows3.length === 0 &&
      rows4.length === 0
    ) {
      return res.status(200).json({
        message: "Failed: No data",
        status: false,
        timeStamp: timeNow,
      });
    }

    const [wingo_details] = await connection.query(
      "SELECT * FROM minutes_1 WHERE phone = ?",
      [userInfo.phone]
    );
    const [trx_details] = await connection.query(
      "SELECT * FROM result_5d WHERE phone = ?",
      [userInfo.phone]
    );
    const [k3_details] = await connection.query(
      "SELECT * FROM result_k3 WHERE phone = ?",
      [userInfo.phone]
    );
    const [d5_details] = await connection.query(
      "SELECT * FROM trxresult WHERE phone = ?",
      [userInfo.phone]
    );

    const wingo = rows[0].total_money;
    const trx = rows2[0].total_money;
    const k3 = rows3[0].total_money;
    const d5 = rows4[0].total_money;

    const vipLevelAmt = Number(wingo) + Number(trx) + Number(k3) + Number(d5);

    // Fetch bet amount from rebate_bonus table
    const [details] = await connection.query(
      "SELECT * FROM ranking WHERE `status` = ?",
      [1]
    );

    // Check if bet amount exists
    if (details.length === 0) {
      return res.status(200).json({
        message: "Failed: No data",
        status: false,
        timeStamp: timeNow,
      });
    }

    const updatedDetails = details.map((item) => ({
      ...item,
      vipLevelAmt: vipLevelAmt,
      wingo: wingo_details,
      d5: d5_details,
      k3: k3_details,
      trx: trx_details,
    }));

    // Return the bet amount if found
    return res.status(200).json({
      message: "Success: Notice Fetch successfully",
      status: true,
      data: updatedDetails, // Assuming you want the first entry
      timeStamp: timeNow,
    });
  } catch (error) {
    console.error("Error processing rebate:", error);
    return res.status(500).json({
      message: "Server error",
      status: false,
      error: error.message,
      timeStamp: new Date().toISOString(),
    });
  }
};

const fetchVIPConditionData = async (req, res) => {
  try {
    let auth = req.cookies.auth;
    let timeNow = new Date().toISOString(); // Define timeNow for logging timestamps

    // Fetch user based on phone number
    const [users] = await connection.query(
      "SELECT `phone`, `money` FROM users WHERE `token` = ?",
      [auth]
    );

    // Check if the user exists
    if (users.length === 0) {
      return res.status(200).json({
        message: "Failed: User Number not found",
        status: false,
        timeStamp: timeNow,
      });
    }

    const userInfo = users[0];

    // Fetch bet amount from rebate_bonus table
    // const [vip] = await connection.query('SELECT IFNULL(SUM(money + fee), 0) AS total_money FROM minutes_1 WHERE  `phone` = ?', [userInfo.phone]);
    const [rows] = await connection.query(
      "SELECT IFNULL(SUM(money + fee), 0) AS total_money FROM minutes_1 WHERE phone = ?",
      [userInfo.phone]
    );
    const [rows2] = await connection.query(
      "SELECT IFNULL(SUM(money + fee), 0) AS total_money FROM result_5d WHERE phone = ?",
      [userInfo.phone]
    );
    const [rows3] = await connection.query(
      "SELECT IFNULL(SUM(money + fee), 0) AS total_money FROM result_k3 WHERE phone = ?",
      [userInfo.phone]
    );
    const [rows4] = await connection.query(
      "SELECT IFNULL(SUM(money + fee), 0) AS total_money FROM trxresult WHERE phone = ?",
      [userInfo.phone]
    );

    if (
      rows.length === 0 &&
      rows2.length === 0 &&
      rows3.length === 0 &&
      rows4.length === 0
    ) {
      return res.status(200).json({
        message: "Failed: No data",
        status: false,
        timeStamp: timeNow,
      });
    }

    const wingo = rows[0].total_money;
    const trx = rows2[0].total_money;
    const k3 = rows3[0].total_money;
    const d5 = rows4[0].total_money;

    const vipLevelAmt = Number(wingo) + Number(trx) + Number(k3) + Number(d5);

    // Fetch bet amount from rebate_bonus table
    // const [details] = await connection.query('SELECT * FROM ranking WHERE `status` = ? ', [1]);
    const [details] = await connection.query(
      "SELECT * FROM ranking WHERE `status` = ? ORDER BY `id` DESC",
      [1]
    );

    // Check if bet amount exists
    if (details.length === 0) {
      return res.status(200).json({
        message: "Failed: No data",
        status: false,
        timeStamp: timeNow,
      });
    }

    const updatedDetails = details.map((item) => ({
      ...item,
      vipLevelAmt: vipLevelAmt,
    }));

    // Return the bet amount if found
    return res.status(200).json({
      message: "Success: Notice Fetch successfully",
      status: true,
      data: updatedDetails, // Assuming you want the first entry
      timeStamp: timeNow,
    });
  } catch (error) {
    console.error("Error processing rebate:", error);
    return res.status(500).json({
      message: "Server error",
      status: false,
      error: error.message,
      timeStamp: new Date().toISOString(),
    });
  }
};

const fetchInvitationDetails = async (req, res) => {
  try {
    let auth = req.cookies.auth;
    let timeNow = new Date().toISOString();
    const [details] = await connection.query(
      "SELECT * FROM invitation_bonus WHERE `status` = ?",
      [1]
    );

    // Check if bet amount exists
    if (details.length === 0) {
      return res.status(200).json({
        message: "Failed: No data",
        status: false,
        timeStamp: timeNow,
      });
    }

    // console.log(JSON.stringify(details))
    const [users] = await connection.query(
      "SELECT * FROM users WHERE `token` = ? AND `status` = ?",
      [auth, 1]
    );

    if (users.length === 0) {
      return res.status(200).json({
        message: "Failed",
        status: false,
        timeStamp: timeNow,
      });
    }
    const userInfo = users[0];

    console.log(userInfo);

    const [Invites] = await connection.query(
      "SELECT * FROM users WHERE `invite` = ? AND `status` = ?",
      [userInfo.code, 1]
    );
    const NumberOfInvites = Invites.length;

    console.log(NumberOfInvites);

    let NumberOfRecharge = 0; // Initialize as a number, not a string

    for (let inviteData of Invites) {
      const [recharges] = await connection.query(
        "SELECT * FROM recharge WHERE `phone` = ? AND `money` >= 300 AND `status` = ?",
        [inviteData.phone, 1]
      );

      NumberOfRecharge += recharges.length;
    }

    console.log(NumberOfRecharge, NumberOfInvites);

    // for (const condition of details) {
    //     // Check if both NumberOfRecharge and NumberOfInvites meet the condition
    //     if (NumberOfRecharge <= condition.invites && NumberOfInvites <= condition.invites) {
    //         // Check if the bonus has already been given
    //         const [check_i] = await connection.query(
    //             'SELECT * FROM invitation_records WHERE `bonus` = ? AND `phone` = ? AND `invites` = ? AND `status` = ?',
    //             [condition.bonus, userInfo.phone, condition.invites, 1]
    //         );

    //         if (check_i.length < 0) {
    //              // Insert into the invitation_records table (only for the first matched condition)
    //         const sql = 'INSERT INTO invitation_records (bonus, phone, invites, status) VALUES (?, ?, ?, ?)';
    //         await connection.query(sql, [condition.bonus, userInfo.phone, condition.invites, 1]);

    //         // Insert into the transfer_money table (only for the first matched condition)
    //         const sql2 = 'INSERT INTO transfer_money (amount, phone, status) VALUES (?, ?, ?)';
    //         await connection.query(sql2, [condition.bonus, userInfo.phone, 2]);

    //         // Stop processing further conditions once an insert has been made
    //         break;
    //         }

    //     }
    // }

    for (let detail of details) {
      detail.NumberOfRecharge = NumberOfRecharge;
      detail.NumberOfInvites = NumberOfInvites;
    }

    console.log(JSON.stringify(details));
    // Return the bet amount if found
    return res.status(200).json({
      message: "Success: Notice Fetch successfully",
      status: true,
      data: details,
      timeStamp: timeNow,
    });
  } catch (error) {
    console.error("Error processing rebate:", error);
    return res.status(500).json({
      message: "Server error",
      status: false,
      error: error.message,
      timeStamp: new Date().toISOString(),
    });
  }
};

const uploaded = multer({ storage: storage }).single("image");

const gameProblam = async (req, res) => {
  try {
    uploaded(req, res, async function (err) {
      if (err instanceof multer.MulterError) {
        console.error("Multer error:", err);
        return res.status(400).json({ message: "File upload error" });
      } else if (err) {
        console.error("Error uploading files:", err);
        return res.status(500).json({ message: "Internal server error" });
      }

      let auth = req.cookies.auth;
      let content = req.body.problam;
      let file = req.file;

      console.log(content, file);

      const timeNow = Date.now();

      // Required field validation
      if (!auth || !content || !file) {
        return res.status(200).json({
          message: "Failed: Please fill the required fields",
          status: false,
          timeStamp: timeNow,
        });
      }
      const [users] = await connection.query(
        "SELECT * FROM users WHERE `token` = ?",
        [auth]
      );
      if (users.length === 0) {
        return res.status(200).json({
          message: "Failed: User not found",
          status: false,
          timeStamp: timeNow,
        });
      }

      const userPhone = users[0].phone;
      const filepath = file.filename;
      console.log(filepath);

      await connection.execute(
        "INSERT INTO game_problam SET phone = ?, problam = ?, image = ?, status = ?",
        [userPhone, content, filepath, 0]
      );

      return res.status(200).json({
        message: "submited successfully",
        status: true,
        timeStamp: timeNow,
      });
    });
  } catch (err) {
    return res.status(200).json({
      message: "Failed ERROR" + err,
      status: false,
      timeStamp: timeNow,
    });
  }
};

const fetchGameProblamDetails = async (req, res) => {
  try {
    let auth = req.cookies.auth;
    let timeNow = new Date().toISOString();
    const [details] = await connection.query("SELECT * FROM game_problam ");

    // Check if bet amount exists
    if (details.length === 0) {
      return res.status(200).json({
        message: "Failed: No data",
        status: false,
        timeStamp: timeNow,
      });
    }

    return res.status(200).json({
      message: "Success: Fetch successfully",
      status: true,
      data: details,
      timeStamp: timeNow,
    });
  } catch (error) {
    console.error("Error processing rebate:", error);
    return res.status(500).json({
      message: "Server error",
      status: false,
      error: error.message,
      timeStamp: new Date().toISOString(),
    });
  }
};

const getGiftCodeHistory = async (req, res) => {
  let auth = req.cookies.auth;
  const [users] = await connection.query(
    "SELECT * FROM users WHERE `token` = ?",
    [auth]
  );
  if (users.length === 0) {
    return res.status(200).json({
      message: "Failed: User not found",
      status: false,
      timeStamp: timeNow,
    });
  }
  const userPhone = users[0].phone;

  console.log(userPhone);

  const [rows] = await connection.query(
    "SELECT * FROM redenvelopes_used WHERE `phone_used` = ? ORDER BY id DESC",
    [userPhone]
  );
  console.log(JSON.stringify(rows[0]));
  if (!rows) {
    return res.status(200).json({
      message: "Failed",
      status: false,
    });
  }
  return res.status(200).json({
    message: "Success",
    status: true,
    data: rows,
  });
};

const collectVipBonus = async (req, res) => {
  try {
    let auth = req.cookies.auth;
    const { id, type } = req.body;
    let timeNow = new Date().toISOString();

    const [users] = await connection.query(
      "SELECT `phone`, `money` FROM users WHERE `token` = ?",
      [auth]
    );
    const [ranking] = await connection.query(
      "SELECT * FROM ranking WHERE `id` = ?",
      [id]
    );

    // Check if the user exists
    if (users.length === 0) {
      return res.status(200).json({
        message: "Failed: User Number not found",
        status: false,
        timeStamp: timeNow,
      });
    }

    console.log(ranking[0]);

    if (type == "month") {
      await connection.query(
        "UPDATE users SET winning = winning + ? WHERE phone = ?",
        [ranking[0].f4, users[0].phone]
      );
      const bonus_add =
        "INSERT INTO vipbonus_recode (amount, phone, rank_id, status, type) VALUES (?, ?, ?, ?, ?)";
      await connection.query(bonus_add, [
        ranking[0].f4,
        users[0].phone,
        ranking[0].id,
        1,
        type,
      ]);
      const sql =
        "INSERT INTO transfer_money (amount, phone, type, status) VALUES (?, ?, ?, ?)";
      await connection.query(sql, [
        ranking[0].f4,
        users[0].phone,
        "VIP LEVEL BONUS",
        1,
      ]);
    } else {
      await connection.query(
        "UPDATE users SET winning = winning + ? WHERE phone = ?",
        [ranking[0].f3, users[0].phone]
      );
      const bonus_add =
        "INSERT INTO vipbonus_recode (amount, phone, rank_id, status, type) VALUES (?, ?, ?, ?, ?)";
      await connection.query(bonus_add, [
        ranking[0].f3,
        users[0].phone,
        ranking[0].id,
        1,
        type,
      ]);
      const sql =
        "INSERT INTO transfer_money (amount, phone, type, status) VALUES (?, ?, ?, ?)";
      await connection.query(sql, [
        ranking[0].f3,
        users[0].phone,
        "VIP LEVEL BONUS",
        1,
      ]);
    }

    return res.status(200).json({
      message: "Received successfully",
      status: true, // Assuming you want the first entry
      timeStamp: timeNow,
    });
  } catch (error) {
    console.error("Error processing rebate:", error);
    return res.status(500).json({
      message: "Server error",
      status: false,
      error: error.message,
      timeStamp: new Date().toISOString(),
    });
  }
};

const CheckVipCollect = async (req, res) => {
  try {
    let auth = req.cookies.auth;
    let id = req.body.id;

    if (!auth) {
      return res.status(400).json({
        status: false,
        message: "Authentication required.",
      });
    }

    const [users] = await connection.query(
      "SELECT `phone`, `money` FROM users WHERE `token` = ?",
      [auth]
    );
    if (!users.length) {
      return res.status(404).json({
        status: false,
        message: "User not found.",
      });
    }

    const userPhone = users[0].phone;

    const [checkin] = await connection.query(
      "SELECT * FROM vipbonus_recode WHERE `phone` = ? AND `rank_id` = ? ",
      [userPhone, id]
    );

    if (!checkin.length) {
      return res.status(404).json({
        status: false,
        message: "No bonus record found for user.",
      });
    }

    return res.status(200).json({
      status: true,
      data: checkin,
      timeStamp: timeNow,
    });
  } catch (error) {
    console.error("Error processing :", error);
    return res.status(500).json({
      message: "Server error",
      status: false,
      error: error.message,
      timeStamp: new Date().toISOString(),
    });
  }
};

const CheckInvitionBonus = async (req, res) => {
  try {
    let auth = req.cookies.auth;
    const id = req.body.id;
    let timeNow = new Date().toISOString();

    const [users] = await connection.query(
      "SELECT `phone`, `money` FROM users WHERE `token` = ?",
      [auth]
    );
    const [ranking] = await connection.query(
      "SELECT * FROM invitation_bonus WHERE `id` = ?",
      [id]
    );

    const [checkinInvitionBonus] = await connection.query(
      "SELECT * FROM invitation_records WHERE `phone` = ? AND `invites` = ? AND `bonus_number` = ?",
      [users[0].phone, ranking[0].invites, ranking[0].id]
    );

    // Check if the user exists
    if (users.length === 0) {
      return res.status(200).json({
        message: "Failed: User Number not found",
        status: false,
        timeStamp: timeNow,
      });
    }
    if (checkinInvitionBonus.length > 0) {
      return res.status(200).json({
        message: "you already claimed this bonus",
        status: false,
        timeStamp: timeNow,
      });
    }

    console.log(ranking[0]);

    await connection.query(
      "UPDATE users SET winning = winning + ? WHERE phone = ?",
      [ranking[0].bonus, users[0].phone]
    );

    const bonus_add =
      "INSERT INTO invitation_records (bonus, phone, invites, bonus_number, status) VALUES (?, ?, ?, ?, ?)";

    await connection.query(bonus_add, [
      ranking[0].bonus,
      users[0].phone,
      ranking[0].invites,
      ranking[0].id,
      1,
    ]);

    const sql =
      "INSERT INTO transfer_money (amount, phone, type, status) VALUES (?, ?, ?, ?)";

    await connection.query(sql, [
      ranking[0].bonus,
      users[0].phone,
      "INVITION BONUS",
      1,
    ]);

    return res.status(200).json({
      message: "Received successfully",
      status: true,
      timeStamp: timeNow,
    });
  } catch (error) {
    console.error("Error processing rebate:", error);
    return res.status(500).json({
      message: "Server error",
      status: false,
      error: error.message,
      timeStamp: new Date().toISOString(),
    });
  }
};

const CheckInvitionBonusCollect = async (req, res) => {
  try {
    let auth = req.cookies.auth;
    let id = req.body.id;

    console.log(id);

    if (!auth) {
      return res.status(400).json({
        status: false,
        message: "Authentication required.",
      });
    }

    const [users] = await connection.query(
      "SELECT `phone`, `money` FROM users WHERE `token` = ?",
      [auth]
    );
    if (!users.length) {
      return res.status(404).json({
        status: false,
        message: "User not found.",
      });
    }

    const userPhone = users[0].phone;
    console.log(userPhone);

    const [checkin] = await connection.query(
      "SELECT * FROM invitation_records WHERE `phone` = ? AND `bonus_number` = ? ",
      [userPhone, id]
    );

    if (!checkin.length) {
      return res.status(404).json({
        status: false,
        message: "No bonus record found for user.",
      });
    }
    console.log(JSON.stringify(checkin));

    return res.status(200).json({
      status: true,
      data: checkin,
      timeStamp: timeNow,
    });
  } catch (error) {
    console.error("Error processing :", error);
    return res.status(500).json({
      message: "Server error",
      status: false,
      error: error.message,
      timeStamp: new Date().toISOString(),
    });
  }
};

const CheckFirstRecharge = async (req, res) => {
  try {
    let auth = req.cookies.auth;
    let timeNow = new Date().toISOString();

    if (!auth) {
      return res.status(200).json({
        message: "Failed",
        status: false,
        timeStamp: timeNow,
      });
    }
    const [users] = await connection.query(
      "SELECT * FROM users WHERE token = ?",
      [auth]
    );

    const userPhone = users[0].phone;

    const [details] = await connection.query(
      "SELECT * FROM recharge WHERE phone = ?",
      [userPhone]
    );

    var rechargeCheck = false;
    if (details.length) {
      rechargeCheck = true;
    }

    return res.status(200).json({
      message: "Success: Fetch successfully",
      status: true,
      data: rechargeCheck,
      timeStamp: timeNow,
    });
  } catch (error) {
    console.error("Error processing rebate:", error);
    return res.status(500).json({
      message: "Server error",
      status: false,
      error: error.message,
      timeStamp: new Date().toISOString(),
    });
  }
};

const fetchTransitionDetialsHistory = async (req, res) => {
  let auth = req.cookies.auth;
  if (!auth) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }

  try {
    const [users] = await connection.query(
      "SELECT * FROM users WHERE `token` = ?",
      [auth]
    );

    if (users.length === 0) {
      console.log("No active users found.");
      return res.status(200).json({
        message: "User not found",
        status: false,
        timeStamp: timeNow,
      });
    }

    const [transaction] = await connection.query(
      `
            SELECT 
              IFNULL(SUM(CASE WHEN DATE(time) = CURDATE() - INTERVAL 1 DAY THEN amount ELSE 0 END), 0) AS yesterday_total,
              IFNULL(SUM(CASE WHEN DATE(time) >= CURDATE() - INTERVAL 1 WEEK THEN amount ELSE 0 END), 0) AS week_total,
              IFNULL(SUM(CASE WHEN DATE(time) >= CURDATE() - INTERVAL 1 MONTH THEN amount ELSE 0 END), 0) AS month_total,
              IFNULL(SUM(amount), 0) AS total
            FROM transfer_money
            WHERE phone = ?
          `,
      [users[0].phone]
    );

    console.log(transaction[0]);

    console.log("No active users found.");

    return res.status(200).json({
      message: "success",
      status: true,
      data: transaction,
      timeStamp: timeNow,
    });
  } catch (error) {
    console.error("Error processing rebate:", error);
  }
};

const fetchInvitionHistory = async (req, res) => {
  let auth = req.cookies.auth;
  if (!auth) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }

  try {
    const [users] = await connection.query(
      "SELECT * FROM users WHERE `token` = ?",
      [auth]
    );

    if (users.length === 0) {
      console.log("No active users found.");
      return res.status(200).json({
        message: "User not found",
        status: false,
        timeStamp: timeNow,
      });
    }

    const [transaction] = await connection.query(
      `SELECT * FROM invitation_records WHERE phone = ?`,
      [users[0].phone]
    );

    return res.status(200).json({
      message: "success",
      status: true,
      data: transaction,
      timeStamp: timeNow,
    });
  } catch (error) {
    console.error("Error processing rebate:", error);
  }
};

const withdrawableMoney = async (req, res) => {
  try {
    const { auth } = req.cookies;

    if (!auth) {
      return res.status(401).json({
        message: "Authentication failed",
        status: false,
        timeStamp: Date.now(),
      });
    }

    // Fetch user data based on token
    const [users] = await connection.query(
      "SELECT phone FROM users WHERE token = ? LIMIT 1",
      [auth]
    );

    if (users.length === 0) {
      return res.status(404).json({
        message: "User not found",
        status: false,
        timeStamp: Date.now(),
      });
    }

    const { phone, winning } = users[0];

    // ✅ Query to calculate total winning amount
    const totalWinningQuery = `
      SELECT COALESCE(SUM(\`get\`), 0) AS total_money
      FROM (
          SELECT \`get\` FROM minutes_1 WHERE phone = ? AND status = 1
          UNION ALL
          SELECT \`get\` FROM result_k3 WHERE phone = ? AND status = 1
          UNION ALL
          SELECT \`get\` FROM result_5d WHERE phone = ? AND status = 1
          UNION ALL
          SELECT \`get\` FROM trxresult WHERE phone = ? AND status = 1
      ) AS combined_data;
    `;

    // ✅ Query to calculate total withdrawn amount
    const totalWithdrawQuery = `
      SELECT COALESCE(SUM(money), 0) AS total_money
      FROM withdraw
      WHERE phone = ? AND status IN (0, 1);
    `;

    // Execute both queries in parallel
    const [[totalWinning], [totalWithdraw]] = await Promise.all([
      connection.query(totalWinningQuery, [phone, phone, phone, phone]),
      connection.query(totalWithdrawQuery, [phone]),
    ]);

    const totalWinningAmount = parseInt(totalWinning[0].total_money, 10) || 0;
    const totalWithdrawAmount = parseInt(totalWithdraw[0].total_money, 10) || 0;
    const withdrawableAmount = totalWinningAmount - totalWithdrawAmount;
    const finalWithdrawableAmount =
      withdrawableAmount > 0 ? withdrawableAmount : 0;

    return res.status(200).json({
      message: "Success",
      status: true,
      withdrawable_amount: finalWithdrawableAmount,
      total_winning: totalWinningAmount,
      total_withdraw: totalWithdrawAmount,
      timeStamp: Date.now(),
    });
  } catch (error) {
    console.error("Error in withdrawableMoney:", error.message);

    return res.status(500).json({
      message: "Internal server error",
      status: false,
      error: error.message,
      timeStamp: Date.now(),
    });
  }
};

// update avator
const updateAvatar = async (req, res) => {
  const auth = req.cookies.auth;
  const avatarId = req.body.avatarId || 0;
  const timeNow = new Date().toISOString(); // Get the current timestamp

  // Ensure the auth token is provided
  if (!auth) {
    return res.status(400).json({
      message: "Authentication token is missing.",
      status: false,
      timeStamp: timeNow,
    });
  }

  // Validate avatarId if needed
  if (!avatarId || avatarId === 0) {
    return res.status(400).json({
      message: "Invalid avatar ID.",
      status: false,
      timeStamp: timeNow,
    });
  }

  try {
    // Retrieve user from database
    const [users] = await connection.query(
      "SELECT * FROM users WHERE `token` = ?",
      [auth]
    );

    if (users.length === 0) {
      return res.status(404).json({
        message: "User not found.",
        status: false,
        timeStamp: timeNow,
      });
    }

    // Update avatar
    const [result] = await connection.query(
      "UPDATE users SET avatar = ? WHERE `token` = ?",
      [avatarId, auth]
    );

    // Check if the update was successful
    if (result.affectedRows === 0) {
      return res.status(500).json({
        message: "Failed to update avatar.",
        status: false,
        timeStamp: timeNow,
      });
    }

    return res.status(200).json({
      message: "Your avatar is updated successfully.",
      status: true,
      timeStamp: timeNow,
    });
  } catch (error) {
    console.error("Error processing avatar update:", error);
    return res.status(500).json({
      message: error.message || "Something went wrong! Please try again.",
      status: false,
      timeStamp: timeNow,
    });
  }
};

export default {
  userInfo,
  changeUser,
  promotion,
  myTeam,
  wowpay,
  recharge,
  recharge2,
  listRecharge,
  listWithdraw,
  changePassword,
  checkInHandling,
  infoUserBank,
  addBank,
  withdrawal3,
  transfer,
  transferHistory,
  callback_bank,
  listMyTeam,
  verifyCode,
  aviator,
  useRedenvelope,
  search,
  updateRecharge,
  confirmRecharge,
  makePayment,
  veriFyPayment,
  upd,
  fetchPaymentDetails,
  listBet,
  TransferMoney,
  TransferP2PMoney,
  TranstionDetails,
  TranstionInfoHistory,
  rebateBonus,
  fetchRebateBonus,
  collectRebateBonus,
  TotalReferrals,
  BonusGet,
  RechargeCalculate,
  loginNotice,
  GameStatistics,
  Feedback,
  fetchNotice,
  loginNoticeDelete,
  VIPLevelAsseing,
  fetchVIPLevelDetails,
  fetchVIPConditionData,
  fetchInvitationDetails,
  gameProblam,
  fetchGameProblamDetails,
  getGiftCodeHistory,
  veriFyPayment2,
  collectVipBonus,
  CheckVipCollect,
  CheckFirstRecharge,
  fetchTransitionDetialsHistory,
  CheckInvitionBonus,
  CheckInvitionBonusCollect,
  fetchInvitionHistory,
  withdrawableMoney,
  listTeamData,
  updateAvatar,
};
