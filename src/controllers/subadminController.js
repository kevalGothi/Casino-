import connection from "../config/connectDB.js";

const subAdminPage = async (req,res) => {
  return res.render("manage/subadmin/index.ejs");
};

const subAdminAddUser = async (req,res) => {
  return res.render("manage/subadmin/addNewMember.ejs");
};

const subAdminRecharge = async (req,res) => {
  return res.render("manage/subadmin/recharge.ejs");
};

const subAdminCrptoRechageDetails = async (req,res) => {
  return res.render("manage/subadmin/rechargeCrpto.ejs");
};

const subAdminWithdraw = async (req,res) => {
  return res.render("manage/subadmin/withdraw.ejs");
};

const subAdminCrptoWithdrawDetails = async (req,res) => {
  return res.render("manage/subadmin/withdrawCrpto.ejs");
};
const subAdminRechargeRecords = async (req,res) => {
  return res.render("manage/subadmin/rechargeRecord.ejs");
};

const subAdminWithdrawRecords = async (req,res) => {
  return res.render("manage/subadmin/withdrawRecord.ejs");
};

const infoMember = async (req, res) => {
    let phone = req.params.id;
    return res.render("manage/subadmin/profileMember.ejs", { phone });
}



const middlewareSubAdminController = async (req, res, next) => {
  const auth = req.cookies.auth;
  if (!auth) {
    return res.redirect("/login");
  }
  const [rows] = await connection.execute(
    "SELECT `token`,`level`, `status` FROM `users` WHERE `token` = ? AND veri = 1",
    [auth]
  );
  if (!rows) {
    return res.redirect("/login");
  }
  try {
    if (auth == rows[0].token && rows[0].status == 1) {
      if ( rows[0].level == 23) {
          console.log("this is pass auth")
        next();
      } else {
        return res.redirect("/home");
      }
    } else {
      return res.redirect("/login");
    }
  } catch (error) {
    return res.redirect("/login");
  }
};


const listMember = async (req, res) => {
  let { pageno, limit } = req.body;

  if (!pageno || !limit) {
    return res.status(200).json({
      code: 0,
      msg: "No more data",
      data: {
        gameslist: [],
      },
      status: false,
    });
  }

  if (pageno < 0 || limit < 0) {
    return res.status(200).json({
      code: 0,
      msg: "No more data",
      data: {
        gameslist: [],
      },
      status: false,
    });
  }
  const [users] = await connection.query(
    `SELECT * FROM users WHERE veri = 1 AND level != 2 ORDER BY id DESC LIMIT ${pageno}, ${limit} `
  );
  const [total_users] = await connection.query(
    `SELECT * FROM users WHERE veri = 1 AND level != 2`
  );
  return res.status(200).json({
    message: "Success",
    status: true,
    datas: users,
    page_total: Math.ceil(total_users.length / limit),
  });
};

const reachargeDetails = async (req, res) => {
  try {
    // Query for different sums
    const [rechargeSums] = await connection.query(`
      SELECT 
          SUM(money) AS total_sum, -- total money
          SUM(CASE WHEN DATE(today) = CURDATE() THEN money ELSE 0 END) AS today_sum, -- today's sum
          SUM(CASE WHEN DATE(today) >= CURDATE() - INTERVAL 7 DAY THEN money ELSE 0 END) AS one_week_sum,
          SUM(CASE WHEN DATE(today) >= CURDATE() - INTERVAL 1 MONTH THEN money ELSE 0 END) AS one_month_sum
      FROM recharge WHERE status = 1 AND type = 'submitauto'
    `);

    const [withdrawSums] = await connection.query(`
      SELECT 
          SUM(money) AS total_sum, -- total money
          SUM(CASE WHEN DATE(today) = CURDATE() THEN money ELSE 0 END) AS today_sum, -- today's sum
          SUM(CASE WHEN DATE(today) >= CURDATE() - INTERVAL 7 DAY THEN money ELSE 0 END) AS one_week_sum,
          SUM(CASE WHEN DATE(today) >= CURDATE() - INTERVAL 1 MONTH THEN money ELSE 0 END) AS one_month_sum
      FROM withdraw WHERE status = 1
    `);

    const [withdrawPandingSums] = await connection.query(`
      SELECT 
          SUM(money) AS total_sum, -- total money
          SUM(CASE WHEN DATE(today) = CURDATE() THEN money ELSE 0 END) AS today_sum, -- today's sum
          SUM(CASE WHEN DATE(today) >= CURDATE() - INTERVAL 7 DAY THEN money ELSE 0 END) AS one_week_sum,
          SUM(CASE WHEN DATE(today) >= CURDATE() - INTERVAL 1 MONTH THEN money ELSE 0 END) AS one_month_sum
      FROM withdraw WHERE status = 0
    `);

    // Example: Retrieving data from the results
    const totalSum = rechargeSums[0].total_sum;
    const todaySum = rechargeSums[0].today_sum;
    const oneWeekSum = rechargeSums[0].one_week_sum;
    const oneMonthSum = rechargeSums[0].one_month_sum;

    const totalwithdrawSum = withdrawSums[0].total_sum;
    const todaywithdrawSum = withdrawSums[0].today_sum;
    const oneWeekwithdrawSum = withdrawSums[0].one_week_sum;
    const oneMonthwithdrawSum = withdrawSums[0].one_month_sum;

    const totalwithdrawPaddingSum = withdrawPandingSums[0].total_sum;
    const todaywithdrawPaddingSum = withdrawPandingSums[0].today_sum;
    const oneWeekwithdrawPaddingSum = withdrawPandingSums[0].one_week_sum;
    const oneMonthwithdrawPaddingSum = withdrawPandingSums[0].one_month_sum;

    // Store values in an array
    const rechargeSummaryArray =  {
      total: totalSum, 
      today: todaySum, 
      week: oneWeekSum, 
      month: oneMonthSum
    };

    const withdrawSummaryArray =  {
      total: totalwithdrawSum, 
      today: todaywithdrawSum, 
      week: oneWeekwithdrawSum, 
      month: oneMonthwithdrawSum
    };

    const withdrawPaddingSummaryArray =  {
      total: totalwithdrawPaddingSum, 
      today: todaywithdrawPaddingSum, 
      week: oneWeekwithdrawPaddingSum, 
      month: oneMonthwithdrawPaddingSum
    };

    return res.status(200).json({
      message: "Success",
      status: true,
      data: rechargeSummaryArray,
      data2: withdrawSummaryArray,
      data3: withdrawPaddingSummaryArray,
    });
  } catch (error) {
    return res.status(200).json({
      message: "Failed " + error.message,
      status: false,
      timeStamp: timeNow,
    });
  }
};


const recharge = async (req, res) => {
    let auth = req.cookies.auth;
    if (!auth) {
        return res.status(200).json({
            message: 'Failed',
            status: false,
            timeStamp: timeNow,
        });
    }

      const [recharge] = await connection.query('SELECT * FROM recharge WHERE status = 0 AND type NOT IN ("BEP20", "TRC20") ORDER BY id DESC');
    const [rechargeCrpto] = await connection.query('SELECT * FROM recharge WHERE status = 0 AND type IN ("BEP20", "TRC20") ORDER BY id DESC');
    const [recharge2] = await connection.query('SELECT * FROM recharge WHERE status != 0 ORDER BY id DESC');
    const [withdraw] = await connection.query('SELECT * FROM withdraw WHERE status = 0  AND type NOT IN ("BEP20", "TRC20") ORDER BY id DESC');
    const [withdrawCrpto] = await connection.query('SELECT * FROM withdraw WHERE status = 0 AND type IN ("BEP20", "TRC20") ORDER BY id DESC');
    const [withdraw2] = await connection.query('SELECT * FROM withdraw WHERE status != 0 ORDER BY id DESC ');
    return res.status(200).json({
        message: 'Success',
        status: true,
        datas: recharge,
        datas2: recharge2,
        datas3: withdraw,
        datas4: withdraw2,
        datas5: rechargeCrpto,
        datas6: withdrawCrpto,
    });
}


const rechargeDuyet = async (req, res) => {
  try {
    const { auth } = req.cookies;
    const { id, type } = req.body;

    if (!auth || !id || !type) {
      return res.status(400).json({
        message: "Invalid request parameters",
        status: false,
        timeStamp: new Date().toISOString(),
      });
    }

    if (type === "confirm") {
      // Fetch recharge information
      const [rechargeInfo] = await connection.query(
        `SELECT * FROM recharge WHERE id = ?`,
        [id]
      );

      if (rechargeInfo.length === 0) {
        return res.status(404).json({
          message: "Recharge record not found",
          status: false,
        });
      }

      const recharge = rechargeInfo[0];

      // Retrieve admin data
      const [adminData] = await connection.query(`SELECT * FROM admin`);
      const admin = adminData[0];

      // Retrieve user information
      const [userInfo] = await connection.query(
        `SELECT * FROM users WHERE phone = ?`,
        [recharge.phone]
      );

      if (userInfo.length === 0) {
        return res.status(404).json({
          message: "User not found",
          status: false,
        });
      }

      const user = userInfo[0];

      // Retrieve inviter's information (if exists)
      let inviteBonus = 0;
      let inviter = null;

      if (user.invite) {
        const [inviteUserInfo] = await connection.query(
          `SELECT * FROM users WHERE code = ?`,
          [user.invite]
        );

        if (inviteUserInfo.length > 0) {
          inviter = inviteUserInfo[0];
        }
      }

      if (recharge.first_recharge === 1) {
        // Calculate first recharge bonus
        const firstRechargeBonus =
          recharge.money * (admin.first_recharge / 100);

        // Update recharge status
        await connection.query(
          `UPDATE recharge SET status = 1, first_recharge = 0 WHERE id = ?`,
          [id]
        );

        // Update user's wallet
        await connection.query(
          `UPDATE users SET money = money + ?, winning = winning + ? WHERE phone = ?`,
          [recharge.money, recharge.money + firstRechargeBonus, recharge.phone]
        );

        const TranstionQuery =
          "INSERT INTO transfer_money SET phone = ?, amount = ?, type = ?, status = 4 ";
        await connection.query(TranstionQuery, [
          recharge.phone,
          firstRechargeBonus,
          "first recharge bonus",
        ]);

        // Calculate invite bonus if inviter exists
        if (inviter) {
          inviteBonus = recharge.money * (admin.invite_bonus / 100);
          await connection.query(
            `UPDATE users SET winning = winning + ? WHERE phone = ?`,
            [inviteBonus, inviter.phone]
          );

          const TranstionQuery =
            "INSERT INTO transfer_money SET phone = ?, amount = ?, type = ?, status = 4 ";
          await connection.query(TranstionQuery, [
            inviter.phone,
            inviteBonus,
            "Invite recharge bonus",
          ]);
        }
      } else {
        const everyRechargeUser = 3; // Regular recharge bonus rate for user
        const everyRechargeInviter = 3; // Regular invite bonus rate

        // Calculate bonuses
        const rechargeBonus = recharge.money * (everyRechargeUser / 100);
        if (inviter) {
          inviteBonus = recharge.money * (everyRechargeInviter / 100);
        }

        // Update recharge status
        await connection.query(`UPDATE recharge SET status = 1 WHERE id = ?`, [
          id,
        ]);

        // Update user's wallet
        await connection.query(
          `UPDATE users SET money = money + ?, winning = winning + ? WHERE phone = ?`,
          [recharge.money, recharge.money + rechargeBonus, recharge.phone]
        );

        const TranstionQuery =
          "INSERT INTO transfer_money SET phone = ?, amount = ?, type = ?, status = 4 ";
        await connection.query(TranstionQuery, [
          recharge.phone,
          rechargeBonus,
          "Recharge bonus",
        ]);

        // Update inviter's wallet if exists
        if (inviter) {
          await connection.query(
            `UPDATE users SET winning = winning + ? WHERE phone = ?`,
            [inviteBonus, inviter.phone]
          );

          const TranstionQuery =
            "INSERT INTO transfer_money SET phone = ?, amount = ?, type = ?, status = 4 ";
          await connection.query(TranstionQuery, [
            inviter.phone,
            inviteBonus,
            "Invite Recharge bonus",
          ]);
        }
      }

      return res.status(200).json({
        message: "Recharge confirmed successfully",
        status: true,
      });
    }

    if (type === "delete") {
      // Check if recharge exists before updating
      const [existingRecharge] = await connection.query(
        `SELECT * FROM recharge WHERE id = ?`,
        [id]
      );

      if (existingRecharge.length === 0) {
        return res.status(404).json({
          message: "Recharge record not found",
          status: false,
        });
      }

      await connection.query(`UPDATE recharge SET status = 2 WHERE id = ?`, [
        id,
      ]);

      return res.status(200).json({
        message: "Recharge canceled successfully",
        status: true,
      });
    }

    return res.status(400).json({
      message: "Invalid request type",
      status: false,
    });
  } catch (error) {
    console.error("Error in rechargeDuyet:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      status: false,
    });
  }
};


const handlWithdraw = async (req, res) => {
  let auth = req.cookies.auth;
  let id = req.body.id;
  let type = req.body.type;
  if (!auth || !id || !type) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }
  if (type == "confirm") {
    
    const [info] = await connection.query(
      `SELECT * FROM withdraw WHERE id = ?`,
      [id]
    );
    const newMoney = Math.floor(info[0].money * 0.05);
    
    const availbalMoney = info[0].money - newMoney;

    try{
        const newData = {
            merchant_id: "INDIANPAY00INDIANPAY0098",
            merchant_token: "IxGzBJQ9mVzu3U8sozBnWKppOIEhQgi7",
            account_no: info[0].stk,
            ifsccode: info[0].ifsc,
            amount: availbalMoney,
            bankname: info[0].name_bank,
            remark: "withdraw",
            orderid: info[0].id_order,
            name: info[0].name_user,
            contact:  info[0].phone,
            email: "customer@gmail.com",
          };
          console.log(newData)
          
          const base64Encoded = base64url.encode(JSON.stringify(newData));
          console.log(base64Encoded)
           let data = JSON.stringify({
            "salt": `${base64Encoded}`
            });

            let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://indianpay.co.in/admin/single_transaction',
            headers: { 
                'Content-Type': 'application/json', 
                'Cookie': 'ci_session=m6s71j7euvdliifn5q2skpjchedq1lr8'
            },
            data : data
            };

            axios.request(config)
            .then((response) => {
            console.log(JSON.stringify(response.data));
            })
            .catch((error) => {
            console.log(error);
            });

            await connection.query(`UPDATE withdraw SET status = 1 WHERE id = ?`, [id]);

          return res.status(200).json({
            message: "Successful application confirmation",
            status: true,
            datas: recharge,
          });
    }catch{
        return res.status(200).json({
            message: "something went wrong",
            status: false,
          });
    }
    
  }
  if (type == "delete") {
    await connection.query(`UPDATE withdraw SET status = 2 WHERE id = ?`, [id]);
    const [info] = await connection.query(
      `SELECT * FROM withdraw WHERE id = ?`,
      [id]
    );
    await connection.query(
      "UPDATE users SET winning = winning + ? WHERE phone = ? ",
      [info[0].money, info[0].phone]
    );
    await connection.query(
      "UPDATE withdrawl_money SET amount = amount + ? WHERE phone = ? ",
      [info[0].money, info[0].phone]
    );

    return res.status(200).json({
      message: "Cancel successfully",
      status: true,
      datas: recharge,
    });
  }
};


const AddNewUser = async(req, res) => {
    let auth = req.cookies.auth;
    if(!auth){
        return res.status(200).json({
            message: 'Failed',
            status: false,
            timeStamp: timeNow,
        });
    }

    const [user] = await connection.query('SELECT * FROM users WHERE token = ? ', [auth]);

    if (user.length == 0) {
        return res.status(200).json({
            message: 'Failed : user does not Exist',
            status: false,
            timeStamp: timeNow,
        });
    }
    let userInfo = user[0];
    
    let now = new Date().getTime();
    let { username, pwd, uid, invitecode } = req.body; 
    let id_user = randomNumber(10000, 99999);
    let otp2 = randomNumber(100000, 999999);
    let name_user = "Member" + randomNumber(10000, 99999);
    let code = randomString(5) + randomNumber(10000, 99999);
    // console.log(username, email, pwd); // Debugging

    let time = timeCreate();
    if (!username || !pwd || !uid || !invitecode) {
        return res.status(200).json({
            message: 'ERROR : Please fill the required field',
            status: false
        });
    }
    if (username.length < 9 || username.length > 10 || !isNumber(username)) {
        return res.status(200).json({
            message: 'Failed: please fill valid phone number',
            status: false
        });
    }

    try {
        const [check_u] = await connection.query('SELECT * FROM users WHERE phone = ?', [username]);
        
        if (check_u.length == 1) {
            return res.status(200).json({
                message: 'Failed : Phone number has been already registered',
                status: false
            });
        } else {
            const sql = "INSERT INTO users SET id_user = ?,phone = ?,name_user = ?,password = ?, plain_password = ?, money = ?,total_money = ?, winning = ?, code = ?,invite = ?,ctv = ?,veri = ?,otp = ?,ip_address = ?,status = ?,time = ?";
            await connection.execute(sql, [uid, username, name_user, md5(pwd), pwd, 0, 0, 0, code, invitecode, 0, 1, otp2, 0, 1, time]);
                    
            await connection.execute('INSERT INTO point_list SET phone = ?', [username]);
            return res.status(200).json({
                message: 'success : Register Success',
                status: true
            });
        } 
    } catch (error) {
        console.log(error); // Ensure errors are logged
        return res.status(200).json({
            message: 'Failed : something went wrong while user register',
            status: false
        });
    }
}

const listWithdrawMem = async (req, res) => {
    let auth = req.cookies.auth;
    let phone = req.params.phone;
    let { pageno, limit } = req.body;

    if (!pageno || !limit) {
        return res.status(200).json({
            code: 0,
            msg: "No more data",
            data: {
                gameslist: [],
            },
            status: false
        });
    }

    if (pageno < 0 || limit < 0) {
        return res.status(200).json({
            code: 0,
            msg: "No more data",
            data: {
                gameslist: [],
            },
            status: false
        });
    }

    if (!phone) {
        return res.status(200).json({
            message: 'Failed',
            status: false,
            timeStamp: timeNow,
        });
    }

    const [user] = await connection.query('SELECT * FROM users WHERE phone = ? ', [phone]);
    const [auths] = await connection.query('SELECT * FROM users WHERE token = ? ', [auth]);

    if (user.length == 0 || auths.length == 0) {
        return res.status(200).json({
            message: 'Failed',
            status: false,
            timeStamp: timeNow,
        });
    }
    let { token, password, otp, level, ...userInfo } = user[0];

    const [withdraw] = await connection.query(`SELECT * FROM withdraw WHERE phone = ? ORDER BY id DESC LIMIT ${pageno}, ${limit} `, [phone]);
    const [total_users] = await connection.query(`SELECT * FROM withdraw WHERE phone = ?`, [phone]);
    return res.status(200).json({
        message: 'Success',
        status: true,
        datas: withdraw,
        page_total: Math.ceil(total_users.length / limit)
    });
}

const listRechargeMem = async (req, res) => {
    let auth = req.cookies.auth;
    let phone = req.params.phone;
    let { pageno, limit } = req.body;

    if (!pageno || !limit) {
        return res.status(200).json({
            code: 0,
            msg: "No more data",
            data: {
                gameslist: [],
            },
            status: false
        });
    }

    if (pageno < 0 || limit < 0) {
        return res.status(200).json({
            code: 0,
            msg: "No more data",
            data: {
                gameslist: [],
            },
            status: false
        });
    }

    if (!phone) {
        return res.status(200).json({
            message: 'Failed',
            status: false,
            timeStamp: timeNow,
        });
    }

    const [user] = await connection.query('SELECT * FROM users WHERE phone = ? ', [phone]);
    const [auths] = await connection.query('SELECT * FROM users WHERE token = ? ', [auth]);

    if (user.length == 0 || auths.length == 0) {
        return res.status(200).json({
            message: 'Failed',
            status: false,
            timeStamp: timeNow,
        });
    }
    let { token, password, otp, level, ...userInfo } = user[0];

    const [recharge] = await connection.query(`SELECT * FROM recharge WHERE phone = ? ORDER BY id DESC LIMIT ${pageno}, ${limit} `, [phone]);
    const [total_users] = await connection.query(`SELECT * FROM recharge WHERE phone = ?`, [phone]);
    return res.status(200).json({
        message: 'Success',
        status: true,
        datas: recharge,
        page_total: Math.ceil(total_users.length / limit)
    });
}


const listRedenvelope = async (req, res) => {
    let auth = req.cookies.auth;
    let phone = req.params.phone;
    let { pageno, limit } = req.body;

    if (!pageno || !limit) {
        return res.status(200).json({
            code: 0,
            msg: "No more data",
            data: {
                gameslist: [],
            },
            status: false
        });
    }

    if (pageno < 0 || limit < 0) {
        return res.status(200).json({
            code: 0,
            msg: "No more data",
            data: {
                gameslist: [],
            },
            status: false
        });
    }

    if (!phone) {
        return res.status(200).json({
            message: 'Failed',
            status: false,
            timeStamp: timeNow,
        });
    }

    const [user] = await connection.query('SELECT * FROM users WHERE phone = ? ', [phone]);
    const [auths] = await connection.query('SELECT * FROM users WHERE token = ? ', [auth]);

    if (user.length == 0 || auths.length == 0) {
        return res.status(200).json({
            message: 'Failed',
            status: false,
            timeStamp: timeNow,
        });
    }
    let { token, password, otp, level, ...userInfo } = user[0];

    const [redenvelopes_used] = await connection.query(`SELECT * FROM redenvelopes_used WHERE phone_used = ? ORDER BY id DESC LIMIT ${pageno}, ${limit} `, [phone]);
    const [total_users] = await connection.query(`SELECT * FROM redenvelopes_used WHERE phone_used = ?`, [phone]);
    return res.status(200).json({
        message: 'Success',
        status: true,
        datas: redenvelopes_used,
        page_total: Math.ceil(total_users.length / limit)
    });
}

const listBet = async (req, res) => {
    let auth = req.cookies.auth;
    let phone = req.params.phone;
    let { pageno, limit } = req.body;

    if (!pageno || !limit) {
        return res.status(200).json({
            code: 0,
            msg: "No more data",
            data: {
                gameslist: [],
            },
            status: false
        });
    }

    if (pageno < 0 || limit < 0) {
        return res.status(200).json({
            code: 0,
            msg: "No more data",
            data: {
                gameslist: [],
            },
            status: false
        });
    }

    if (!phone) {
        return res.status(200).json({
            message: 'Failed',
            status: false,
            timeStamp: timeNow,
        });
    }

    const [user] = await connection.query('SELECT * FROM users WHERE phone = ? ', [phone]);
    const [auths] = await connection.query('SELECT * FROM users WHERE token = ? ', [auth]);

    if (user.length == 0 || auths.length == 0) {
        return res.status(200).json({
            message: 'Failed',
            status: false,
            timeStamp: timeNow,
        });
    }
    let { token, password, otp, level, ...userInfo } = user[0];

    const [listBet] = await connection.query(`SELECT * FROM minutes_1 WHERE phone = ? AND status != 0 ORDER BY id DESC LIMIT ${pageno}, ${limit} `, [phone]);
    const [total_users] = await connection.query(`SELECT * FROM minutes_1 WHERE phone = ? AND status != 0`, [phone]);
    return res.status(200).json({
        message: 'Success',
        status: true,
        datas: listBet,
        page_total: Math.ceil(total_users.length / limit)
    });
}

const listRoiPackage = async (req, res) => {
    let auth = req.cookies.auth;
    let phone = req.params.phone;
    let { pageno, limit } = req.body;

    console.log(phone, auth);

    if (!pageno || !limit) {
        return res.status(200).json({
            code: 0,
            msg: "No more data",
            data: {
                gameslist: [],
            },
            status: false
        });
    }

    if (pageno < 0 || limit < 0) {
        return res.status(200).json({
            code: 0,
            msg: "No more data",
            data: {
                gameslist: [],
            },
            status: false
        });
    }

    if (!phone) {
        return res.status(200).json({
            message: 'Failed',
            status: false,
            timeStamp: timeNow,
        });
    }

    const [user] = await connection.query('SELECT * FROM users WHERE phone = ? ', [phone]);
    const [auths] = await connection.query('SELECT * FROM users WHERE token = ? ', [auth]);

    
    if (user.length == 0 || auths.length == 0) {
        return res.status(200).json({
            message: 'Failed',
            status: false,
            timeStamp: timeNow,
        });
    }
    console.log("this is user :" + JSON.stringify(user[0]), "this is auths : " + JSON.stringify(auths[0]))
    let { token, password, otp, level, ...userInfo } = user[0];
    const user_id = user[0].id;
    console.log(user_id)

    const [listBet] = await connection.query(`SELECT * FROM purchase_plans WHERE user_id = ? AND status = 1 ORDER BY id DESC LIMIT ${pageno}, ${limit} `, [user_id]);
    const [total_users] = await connection.query(`SELECT * FROM purchase_plans WHERE user_id = ? AND status = 1 ORDER BY id DESC`, [user_id]);

    console.log("this is datas :" + JSON.stringify(listBet))
    return res.status(200).json({
        message: 'Success',
        status: true,
        datas: listBet,
        page_total: Math.ceil(total_users.length / limit)
    });
}

const userInfo = async (req, res) => {
    let auth = req.cookies.auth;
    let phone = req.body.phone;
    if (!phone) {
        return res.status(200).json({
            message: 'Failed',
            status: false,
            timeStamp: timeNow,
        });
    }

    const [user] = await connection.query('SELECT * FROM users WHERE phone = ? ', [phone]);

    if (user.length == 0) {
        return res.status(200).json({
            message: 'Failed',
            status: false,
            timeStamp: timeNow,
        });
    }
    let userInfo = user[0];
    // direct subordinate all
    const [f1s] = await connection.query('SELECT `phone`, `password`, `plain_password`, `code`,`invite`, `time` FROM users WHERE `invite` = ? ', [userInfo.code]);

    // cấp dưới trực tiếp hôm nay 
    let f1_today = 0;
    for (let i = 0; i < f1s.length; i++) {
        const f1_time = f1s[i].time; // Mã giới thiệu f1
        let check = (timerJoin(f1_time) == timerJoin()) ? true : false;
        if (check) {
            f1_today += 1;
        }
    }

    // tất cả cấp dưới hôm nay 
    let f_all_today = 0;
    for (let i = 0; i < f1s.length; i++) {
        const f1_code = f1s[i].code; // Mã giới thiệu f1
        const f1_time = f1s[i].time; // time f1
        let check_f1 = (timerJoin(f1_time) == timerJoin()) ? true : false;
        if (check_f1) f_all_today += 1;
        // tổng f1 mời đc hôm nay
        const [f2s] = await connection.query('SELECT `phone`, `password`, `plain_password`,  `code`,`invite`, `time` FROM users WHERE `invite` = ? ', [f1_code]);
        for (let i = 0; i < f2s.length; i++) {
            const f2_code = f2s[i].code; // Mã giới thiệu f2
            const f2_time = f2s[i].time; // time f2
            let check_f2 = (timerJoin(f2_time) == timerJoin()) ? true : false;
            if (check_f2) f_all_today += 1;
            // tổng f2 mời đc hôm nay
            const [f3s] = await connection.query('SELECT `phone`, `password`, `plain_password`,  `code`,`invite`, `time` FROM users WHERE `invite` = ? ', [f2_code]);
            for (let i = 0; i < f3s.length; i++) {
                const f3_code = f3s[i].code; // Mã giới thiệu f3
                const f3_time = f3s[i].time; // time f3
                let check_f3 = (timerJoin(f3_time) == timerJoin()) ? true : false;
                if (check_f3) f_all_today += 1;
                const [f4s] = await connection.query('SELECT `phone`, `password`, `plain_password`,  `code`,`invite`, `time` FROM users WHERE `invite` = ? ', [f3_code]);
                // tổng f3 mời đc hôm nay
                for (let i = 0; i < f4s.length; i++) {
                    const f4_code = f4s[i].code; // Mã giới thiệu f4
                    const f4_time = f4s[i].time; // time f4
                    let check_f4 = (timerJoin(f4_time) == timerJoin()) ? true : false;
                    if (check_f4) f_all_today += 1;
                    // tổng f3 mời đc hôm nay
                }
            }
        }
    }

    // Tổng số f2
    let f2 = 0;
    for (let i = 0; i < f1s.length; i++) {
        const f1_code = f1s[i].code; // Mã giới thiệu f1
        const [f2s] = await connection.query('SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ', [f1_code]);
        f2 += f2s.length;
    }

    // Tổng số f3
    let f3 = 0;
    for (let i = 0; i < f1s.length; i++) {
        const f1_code = f1s[i].code; // Mã giới thiệu f1
        const [f2s] = await connection.query('SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ', [f1_code]);
        for (let i = 0; i < f2s.length; i++) {
            const f2_code = f2s[i].code;
            const [f3s] = await connection.query('SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ', [f2_code]);
            if (f3s.length > 0) f3 += f3s.length;
        }
    }

    // Tổng số f4
    let f4 = 0;
    for (let i = 0; i < f1s.length; i++) {
        const f1_code = f1s[i].code; // Mã giới thiệu f1
        const [f2s] = await connection.query('SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ', [f1_code]);
        for (let i = 0; i < f2s.length; i++) {
            const f2_code = f2s[i].code;
            const [f3s] = await connection.query('SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ', [f2_code]);
            for (let i = 0; i < f3s.length; i++) {
                const f3_code = f3s[i].code;
                const [f4s] = await connection.query('SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ', [f3_code]);
                if (f4s.length > 0) f4 += f4s.length;
            }
        }
    }

    let f5 = 0;
    for (let i = 0; i < f1s.length; i++) {
        const f1_code = f1s[i].code; // Mã giới thiệu f1
        const [f2s] = await connection.query('SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ', [f1_code]);
        for (let i = 0; i < f2s.length; i++) {
            const f2_code = f2s[i].code;
            const [f3s] = await connection.query('SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ', [f2_code]);
            for (let i = 0; i < f3s.length; i++) {
                const f3_code = f3s[i].code;
                const [f4s] = await connection.query('SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ', [f3_code]);
                for(let i = 0; i < f4s.length; i++){
                const f4_code = f4s[i].code;
                const [f5s] = await connection.query('SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ', [f4_code]);
                if (f5s.length > 0) f5 += f5s.length;
                }
            }
        }
    }

    let f6 = 0;
    for (let i = 0; i < f1s.length; i++) {
        const f1_code = f1s[i].code; // Mã giới thiệu f1
        const [f2s] = await connection.query('SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ', [f1_code]);
        for (let i = 0; i < f2s.length; i++) {
            const f2_code = f2s[i].code;
            const [f3s] = await connection.query('SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ', [f2_code]);
            for (let i = 0; i < f3s.length; i++) {
                const f3_code = f3s[i].code;
                const [f4s] = await connection.query('SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ', [f3_code]);
                for(let i = 0; i < f4s.length; i++){
                const f4_code = f4s[i].code;
                const [f5s] = await connection.query('SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ', [f4_code]);
                for(let i = 0; i < f5s.length; i++){
                    const f5_code = f5s[i].code;
                    const [f6s] = await connection.query('SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ', [f5_code]);
                      
                    if (f6s.length > 0) f6 += f6s.length;
                }
                }
            }
        }
    }

    let f7 = 0;
    for (let i = 0; i < f1s.length; i++) {
        const f1_code = f1s[i].code; // Mã giới thiệu f1
        const [f2s] = await connection.query('SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ', [f1_code]);
        for (let i = 0; i < f2s.length; i++) {
            const f2_code = f2s[i].code;
            const [f3s] = await connection.query('SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ', [f2_code]);
            for (let i = 0; i < f3s.length; i++) {
                const f3_code = f3s[i].code;
                const [f4s] = await connection.query('SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ', [f3_code]);
                for(let i = 0; i < f4s.length; i++){
                const f4_code = f4s[i].code;
                const [f5s] = await connection.query('SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ', [f4_code]);
                for(let i = 0; i < f5s.length; i++){
                    const f5_code = f5s[i].code;
                    const [f6s] = await connection.query('SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ', [f5_code]);
                      for(let i = 0; i < f6s.length; i++){
                        const f6_code = f6s[i].code;
                        const [f7s] = await connection.query('SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ', [f6_code]);
                          
                        if (f7s.length > 0) f7 += f7s.length;
                      }
                }
                }
            }
        }
    }

    let f8 = 0;
    for (let i = 0; i < f1s.length; i++) {
        const f1_code = f1s[i].code; // Mã giới thiệu f1
        const [f2s] = await connection.query('SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ', [f1_code]);
        for (let i = 0; i < f2s.length; i++) {
            const f2_code = f2s[i].code;
            const [f3s] = await connection.query('SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ', [f2_code]);
            for (let i = 0; i < f3s.length; i++) {
                const f3_code = f3s[i].code;
                const [f4s] = await connection.query('SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ', [f3_code]);
                for(let i = 0; i < f4s.length; i++){
                const f4_code = f4s[i].code;
                const [f5s] = await connection.query('SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ', [f4_code]);
                for(let i = 0; i < f5s.length; i++){
                    const f5_code = f5s[i].code;
                    const [f6s] = await connection.query('SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ', [f5_code]);
                      for(let i = 0; i < f6s.length; i++){
                        const f6_code = f6s[i].code;
                        const [f7s] = await connection.query('SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ', [f6_code]);
                        for(let i = 0; i < f7s.length; i++){
                         const f7_code = f7s[i].code;
                         const [f8s] = await connection.query('SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ', [f7_code]);
                         
                         if (f8s.length > 0) f8 += f8s.length;
                        }
                      }
                }
                }
            }
        }
    }

    let f9 = 0;
    for (let i = 0; i < f1s.length; i++) {
        const f1_code = f1s[i].code; // Mã giới thiệu f1
        const [f2s] = await connection.query('SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ', [f1_code]);
        for (let i = 0; i < f2s.length; i++) {
            const f2_code = f2s[i].code;
            const [f3s] = await connection.query('SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ', [f2_code]);
            for (let i = 0; i < f3s.length; i++) {
                const f3_code = f3s[i].code;
                const [f4s] = await connection.query('SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ', [f3_code]);
                for(let i = 0; i < f4s.length; i++){
                const f4_code = f4s[i].code;
                const [f5s] = await connection.query('SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ', [f4_code]);
                for(let i = 0; i < f5s.length; i++){
                    const f5_code = f5s[i].code;
                    const [f6s] = await connection.query('SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ', [f5_code]);
                      for(let i = 0; i < f6s.length; i++){
                        const f6_code = f6s[i].code;
                        const [f7s] = await connection.query('SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ', [f6_code]);
                        for(let i = 0; i < f7s.length; i++){
                         const f7_code = f7s[i].code;
                         const [f8s] = await connection.query('SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ', [f7_code]);
                         for(let i = 0; i < f8s.length; i++){
                         const f8_code = f8s[i].code;
                         const [f9s] = await connection.query('SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ', [f8_code]);
                         
                         if (f9s.length > 0) f9 += f9s.length;
                         }
                        }
                      }
                }
                }
            }
        }
    }

    let f10 = 0;
    for (let i = 0; i < f1s.length; i++) {
        const f1_code = f1s[i].code; // Mã giới thiệu f1
        const [f2s] = await connection.query('SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ', [f1_code]);
        for (let i = 0; i < f2s.length; i++) {
            const f2_code = f2s[i].code;
            const [f3s] = await connection.query('SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ', [f2_code]);
            for (let i = 0; i < f3s.length; i++) {
                const f3_code = f3s[i].code;
                const [f4s] = await connection.query('SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ', [f3_code]);
                for(let i = 0; i < f4s.length; i++){
                const f4_code = f4s[i].code;
                const [f5s] = await connection.query('SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ', [f4_code]);
                for(let i = 0; i < f5s.length; i++){
                    const f5_code = f5s[i].code;
                    const [f6s] = await connection.query('SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ', [f5_code]);
                      for(let i = 0; i < f6s.length; i++){
                        const f6_code = f6s[i].code;
                        const [f7s] = await connection.query('SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ', [f6_code]);
                        for(let i = 0; i < f7s.length; i++){
                         const f7_code = f7s[i].code;
                         const [f8s] = await connection.query('SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ', [f7_code]);
                         for(let i = 0; i < f8s.length; i++){
                         const f8_code = f8s[i].code;
                         const [f9s] = await connection.query('SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ', [f8_code]);
                         for(let i = 0; i < f9s.length; i++){
                            const f9_code = f9s[i].code;
                            const [f10s] = await connection.query('SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ', [f9_code]);
                            
                            if (f10s.length > 0) f10 += f10s.length;
                         }
                         }
                        }
                      }
                }
                }
            }
        }
    }
    console.log("TOTAL_F_TODAY:" + f_all_today);
    console.log("F1: " + f1s.length);
    console.log("F2: " + f2);
    console.log("F3: " + f3);
    console.log("F5: " + f5);
    console.log("F6: " + f6);
    console.log("F7: " + f7);
    console.log("F8: " + f8);
    console.log("F9: " + f9);
    console.log("F10: " + f10);

    const [recharge] = await connection.query('SELECT SUM(`money`) as total FROM recharge WHERE phone = ? AND status = 1 ', [phone]);
    const [withdraw] = await connection.query('SELECT SUM(`money`) as total FROM withdraw WHERE phone = ? AND status = 1 ', [phone]);
    const [bank_user] = await connection.query('SELECT * FROM user_bank WHERE phone = ? ', [phone]);
    const [telegram_ctv] = await connection.query('SELECT `telegram` FROM point_list WHERE phone = ? ', [userInfo.ctv]);
    const [ng_moi] = await connection.query('SELECT `phone` FROM users WHERE code = ? ', [userInfo.invite]);
    return res.status(200).json({
        message: 'Success',
        status: true,
        datas: user,
        total_r: recharge,
        total_w: withdraw,
        f1: f1s.length,
        f2: f2,
        f3: f3,
        f4: f4,
        f5: f5,
        f6: f6,
        f7: f7,
        f8: f8,
        f9: f9,
        f10: f10,
        bank_user: bank_user,
        telegram: telegram_ctv[0],
        ng_moi: ng_moi[0],
        daily: userInfo.ctv,
    });
}


export default {
    userInfo,
    listRoiPackage,
    listBet,
    listRedenvelope,
    listRechargeMem,
    listWithdrawMem,
    AddNewUser,
    handlWithdraw,
    rechargeDuyet,
  recharge,
  reachargeDetails,
  subAdminPage,
  middlewareSubAdminController,
  subAdminAddUser,
  subAdminWithdrawRecords,
  subAdminRechargeRecords,
  subAdminCrptoWithdrawDetails,
  subAdminWithdraw,
  subAdminCrptoRechageDetails,
  subAdminRecharge,
  listMember,
  infoMember
};
