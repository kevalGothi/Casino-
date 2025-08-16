import connection from "../config/connectDB.js";
import jwt from 'jsonwebtoken'
import md5 from "md5";
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import axios from 'axios';
import base64url  from 'base64-url';
import { promisify } from 'util';

const unlinkFile = promisify(fs.unlink);


import dotenv from "dotenv";
import { console } from "inspector";
dotenv.config();

let timeNow = Date.now();

const adminPage = async (req, res) => {
    return res.render("manage/index.ejs");
}

const dashboardView = async (req, res) => {

    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

    try {
        const queries = {
            totalUsers: `SELECT COUNT(*) AS total FROM users`,
            todayJoining: `SELECT COUNT(*) AS total FROM users WHERE DATE(today) = ?`,
            yesterdayJoining: `SELECT COUNT(*) AS total FROM users WHERE DATE(today) = ?`,
            
            totalDeposits: `SELECT SUM(money) AS total FROM recharge WHERE status = 1`,
            todayDepositsINR: `SELECT SUM(money) AS total FROM recharge WHERE status = 1 AND type = 'bank' AND today = ?`,
            todayDepositsCrypto: `SELECT SUM(money) AS total FROM recharge WHERE status = 1 AND type = 'crypto' AND today = ?`,
            todayDepositsUSDT: `SELECT SUM(money) AS total FROM recharge WHERE status = 1 AND type = 'usdt' AND today = ?`,
            
            todaysNewPlayerDeposits: `SELECT COUNT(*) AS total FROM recharge WHERE status = 1 AND first_recharge = 1 AND today = ?`,

            yesterdayDepositsINR: `SELECT SUM(money) AS total FROM recharge WHERE status = 1 AND type = 'bank' AND today = ?`,
            yesterdayDepositsCrypto: `SELECT SUM(money) AS total FROM recharge WHERE status = 1 AND type = 'crypto' AND today = ?`,
            yesterdayDepositsUSDT: `SELECT SUM(money) AS total FROM recharge WHERE status = 1 AND type = 'usdt' AND today = ?`,

            totalWithdrawals: `SELECT SUM(money) AS total FROM withdraw WHERE status = 1`,
            todayWithdrawalsINR: `SELECT SUM(money) AS total FROM withdraw WHERE status = 1 AND type = 'bank' AND today = ?`,
            todayWithdrawalsCrypto: `SELECT SUM(money) AS total FROM withdraw WHERE status = 1 AND type = 'crypto' AND today = ?`,
            todayWithdrawalsUSDT: `SELECT SUM(money) AS total FROM withdraw WHERE status = 1 AND type = 'usdt' AND today = ?`,
            todaysNewPlayerWithdrawals: `SELECT COUNT(*) AS total FROM withdraw WHERE status = 1 AND today = ?`,

            yesterdayWithdrawalsINR: `SELECT SUM(money) AS total FROM withdraw WHERE status = 1 AND type = 'bank' AND today = ?`,
            yesterdayWithdrawalsCrypto: `SELECT SUM(money) AS total FROM withdraw WHERE status = 1 AND type = 'crypto' AND today = ?`,
            yesterdayWithdrawalsUSDT: `SELECT SUM(money) AS total FROM withdraw WHERE status = 1 AND type = 'usdt' AND today = ?`,

            totalProfit: `SELECT NULL`,
            todayProfit: `SELECT NULL`,
            yesterdayProfit: `SELECT NULL`,

            currentCashableINR: `SELECT NULL`,
            currentCashableCrypto: `SELECT NULL`, // No data field, fill in when available
            currentCashableUSDT: `SELECT NULL`,

            ggrCasino: `SELECT NULL`, // Replace with actual logic if available
            ggrAviator: `SELECT NULL`,

            totalAgents: `SELECT COUNT(*) AS total FROM users WHERE level = 1`,
            todayNewAgents: `SELECT COUNT(*) AS total FROM users WHERE level = 1 AND DATE(today) = ?`,
            yesterdayNewAgents: `SELECT COUNT(*) AS total FROM users WHERE level = 1 AND DATE(today) = ?`,

            todaySalaryCash: `SELECT SUM(amount) AS total FROM salary WHERE type = 'cash' AND DATE(time) = ?`,
            todaySalaryCoins: `SELECT SUM(amount) AS total FROM salary WHERE type = 'coin' AND DATE(time) = ?`,

            bonuses: `SELECT NULL`, // Not clear where bonuses are stored

            grossProfitINR: `SELECT NULL`,
            grossProfitCrypto: `SELECT NULL`,
            grossProfitUSDT: `SELECT NULL`
        };

        const values = [today, yesterday];
        const errData = {};
        const results = {};
        for (const key in queries) {
            try {
                // const [row] = await connection.execute(queries[key]);
                const [row] = await connection.execute(queries[key], key.includes('yesterday') ? [yesterday] : key.includes('today') ? [today] : []);

                results[key] = row[0]?.total || '?';
            } catch (err) {
                results[key] = null; 
                errData[key] = err.message;
            }
        }
        console.log(results);
        return res.render("manage/dashboard.ejs", { stats: results,errorData:errData });
    } catch (error) {
        console.error("Dashboard error:", error);
        return res.status(500).send("Error loading dashboard.");
    }
};



const ManualSalaryCreatePage = async (req, res) => {
    return res.render("manage/createManualSalary.ejs");
}
const salaryRecordPage = async (req, res) => {
    return res.render("manage/salarySetting.ejs");
}
const salaryRecordHistoryPage = async (req, res) => {
    return res.render("manage/salaryhistory.ejs");
}

const gameIssuePage = async (req, res) => {
    return res.render("manage/gameIssue.ejs");
}

const RankLevelPage = async (req, res) => {
    return res.render("manage/rankLevelSetting.ejs");
}

const creatInviteBonusPage = async (req, res) => {
    return res.render("manage/createInvitationBonus.ejs");
}

const paymentpage = async (req, res) => {
    return res.render("manage/payment.ejs");
}

const roiManage = async (req, res) => {
    return res.render("manage/roimanagment.ejs");
}

const roiHistoryRecodes = async (req, res) => {
    return res.render("manage/roiHistoryRecodes.ejs");
}

const RoiCreatePage = async (req, res) => {
    return res.render("manage/createRoi.ejs");
}

const RoiSetting = async (req, res) => {
    return res.render("manage/RoiSetting.ejs");
}

const addUser = async (req, res) => {
    return res.render("manage/addNewMember.ejs");
}

const createNoticePage = async (req, res) => {
    return res.render("manage/createNotice.ejs");
}

const adminPage3 = async (req, res) => {
    return res.render("manage/a-index-bet/index3.ejs");
}

const adminPage5 = async (req, res) => {
    return res.render("manage/a-index-bet/index5.ejs");
}

const adminPage10 = async (req, res) => {
    return res.render("manage/a-index-bet/index10.ejs");
}
const trxPage = async (req, res) => {
    return res.render("manage/trx.ejs");
}

const trxPage3 = async (req, res) => {
    return res.render("manage/trx-bet/index3.ejs");
}

const trxPage5 = async (req, res) => {
    return res.render("manage/trx-bet/index5.ejs");
}

const trxPage10 = async (req, res) => {
    return res.render("manage/trx-bet/index10.ejs");
}

const adminPage5d = async (req, res) => {
    return res.render("manage/5d.ejs");
}

const adminPageK3 = async (req, res) => {
    return res.render("manage/k3.ejs");
}

const ctvProfilePage = async (req, res) => {
    var phone = req.params.phone;
    return res.render("manage/profileCTV.ejs", { phone });
}

const giftPage = async (req, res) => {
    return res.render("manage/giftPage.ejs");
}

const giftCodeHistoryPage = async (req, res) => {
  return res.render("manage/giftcodeUsed.ejs");
};

const bonusPage = async (req, res) => {
  return res.render("manage/bonus.ejs");
};

const rechargeBonusPage = async (req, res) => {
  return res.render("manage/rechargeBonus.ejs");
};

const attendanceBonusPage = async (req, res) => {
  return res.render("manage/attendanceBonus.ejs");
};

const betCommissionPage = async (req, res) => {
  return res.render("manage/betCommission.ejs");
};

const dailySalaryBetting = async (req, res) => {
  return res.render("manage/dsibettingBonus.ejs");
};

const reffralBonus = async (req, res) => {
  return res.render("manage/reffralBonus.ejs");
};

const levelIncomeBonus = async (req, res) => {
  return res.render("manage/levelincomeBonus.ejs");
};




const membersPage = async (req, res) => {
    return res.render("manage/members.ejs");
}

const ctvPage = async (req, res) => {
    return res.render("manage/ctv.ejs");
}

const infoMember = async (req, res) => {
    let phone = req.params.id;
    return res.render("manage/profileMember.ejs", { phone });
}

const statistical = async (req, res) => {
    return res.render("manage/statistical.ejs");
}

const rechargePage = async (req, res) => {
    return res.render("manage/recharge.ejs");
}
const rechargeCrptoPage = async (req, res) => {
    return res.render("manage/rechargeCrpto.ejs");
}
const withdrawCrptoPage = async (req, res) => {
    return res.render("manage/withdrawCrpto.ejs");
}

const rechargeRecord = async (req, res) => {
    return res.render("manage/rechargeRecord.ejs");
}

const withdraw = async (req, res) => {
    return res.render("manage/withdraw.ejs");
}

const levelSetting = async (req, res) => {
    return res.render("manage/levelSetting.ejs");
}

const CreatedSalaryRecord = async (req, res) => {
    return res.render("manage/CreatedSalaryRecord.ejs");
}

const withdrawRecord = async (req, res) => {
    return res.render("manage/withdrawRecord.ejs");
}
const settings = async (req, res) => {
    return res.render("manage/settings.ejs");
}


// xác nhận admin
const middlewareAdminController = async (req, res, next) => {
    // xác nhận token
    const auth = req.cookies.auth;
    if (!auth) {
        return res.redirect("/login");
    }
    const [rows] = await connection.execute('SELECT `token`,`level`, `status` FROM `users` WHERE `token` = ? AND veri = 1', [auth]);
    if (!rows) {
        return res.redirect("/login");
    }
    try {
        if (auth == rows[0].token && rows[0].status == 1) {
            if (rows[0].level == 1) {
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
}

const totalJoin = async (req, res) => {
    let auth = req.cookies.auth;
    let typeid = req.body.typeid;
    if (!typeid) {
        return res.status(200).json({
            message: 'Failed',
            status: false,
            timeStamp: timeNow,
        });
    }
    let game = '';
    if (typeid == '1') game = 'wingo';
    if (typeid == '2') game = 'wingo3';
    if (typeid == '3') game = 'wingo5';
    if (typeid == '4') game = 'wingo10';

    const [rows] = await connection.query('SELECT * FROM users WHERE `token` = ? ', [auth]);

    if (rows.length > 0) {
        const [wingoall] = await connection.query(`SELECT * FROM minutes_1 WHERE game = "${game}" AND status = 0 AND level = 0 ORDER BY id ASC `, [auth]);
        const [winGo1] = await connection.execute(`SELECT * FROM wingo WHERE status = 0 AND game = '${game}' ORDER BY id DESC LIMIT 1 `, []);
        const [winGo10] = await connection.execute(`SELECT * FROM wingo WHERE status != 0 AND game = '${game}' ORDER BY id DESC LIMIT 10 `, []);
        const [setting] = await connection.execute(`SELECT * FROM admin `, []);

        return res.status(200).json({
            message: 'Success',
            status: true,
            datas: wingoall,
            lotterys: winGo1,
            list_orders: winGo10,
            setting: setting,
            timeStamp: timeNow,
        });
    } else {
        return res.status(200).json({
            message: 'Failed',
            status: false,
            timeStamp: timeNow,
        });
    }
}

const totalJoin1 = async (req, res) => {
    let auth = req.cookies.auth;
    let typeid = req.body.typeid;
    if (!typeid) {
        return res.status(200).json({
            message: 'Failed',
            status: false,
            timeStamp: timeNow,
        });
    }
    let game = '';
    if (typeid == '1') game = 'trx';
    if (typeid == '2') game = 'trx3';
    if (typeid == '3') game = 'trx5';
    if (typeid == '4') game = 'trx10';

    const [rows] = await connection.query('SELECT * FROM users WHERE `token` = ? ', [auth]);

    if (rows.length > 0) {
        const [trxall] = await connection.query(`SELECT * FROM trxresult WHERE game = "${game}" AND status = 0 AND level = 0 ORDER BY id ASC `, [auth]);
        const [trx1] = await connection.execute(`SELECT * FROM trx WHERE status = 0 AND game = '${game}' ORDER BY id DESC LIMIT 1 `, []);
        const [trx10] = await connection.execute(`SELECT * FROM trx WHERE status != 0 AND game = '${game}' ORDER BY id DESC LIMIT 10 `, []);
        const [setting] = await connection.execute(`SELECT * FROM admin `, []);

        return res.status(200).json({
            message: 'Success',
            status: true,
            datas: trxall,
            lotterys: trx1,
            list_orders: trx10,
            setting: setting,
            timeStamp: timeNow,
        });
    } else {
        return res.status(200).json({
            message: 'Failed',
            status: false,
            timeStamp: timeNow,
        });
    }
}

// const listMember = async (req, res) => {
//     let { pageno, limit } = req.body;

//     if (!pageno || !limit) {
//         return res.status(200).json({
//             code: 0,
//             msg: "No more data",
//             data: {
//                 gameslist: [],
//             },
//             status: false
//         });
//     }

//     if (pageno < 0 || limit < 0) {
//         return res.status(200).json({
//             code: 0,
//             msg: "No more data",
//             data: {
//                 gameslist: [],
//             },
//             status: false
//         });
//     }
//     const [users] = await connection.query(`SELECT * FROM users WHERE veri = 1 AND level != 2 ORDER BY id DESC LIMIT ${pageno}, ${limit} `);
//     const [total_users] = await connection.query(`SELECT * FROM users WHERE veri = 1 AND level != 2`);
//     return res.status(200).json({
//         message: 'Success',
//         status: true,
//         datas: users,
//         page_total: Math.ceil(total_users.length / limit)
//     });
// }
const listMember = async (req, res) => {
    try {
      let { pageno = 1, limit = 10, search } = req.body;
      pageno = parseInt(pageno);
      limit = parseInt(limit);
  
      if (isNaN(pageno) || isNaN(limit) || pageno < 1 || limit <= 0) {
        return res.status(400).json({
          code: 0,
          msg: "Invalid pagination parameters",
          data: {
            gameslist: [],
          },
          status: false,
        });
      }
  
      let query = "SELECT * FROM users WHERE veri = 1 AND level != 2";
      let countQuery =
        "SELECT COUNT(*) AS total FROM users WHERE veri = 1 AND level != 2";
      let queryParams = [];
  
      if (search) {
        query += " AND (id LIKE ? OR id_user LIKE ? OR phone LIKE ?)";
        countQuery += " AND (id LIKE ? OR id_user LIKE ? OR phone LIKE ?)";
        queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }
  
      query += " ORDER BY id DESC LIMIT ?, ?";
      queryParams.push((pageno - 1) * limit, limit);
  
      console.log(queryParams, "queryParams");
  
      const [users] = await connection.query(query, queryParams);
      const [[{ total }]] = await connection.query(countQuery, queryParams.slice(0, -2));
  
      return res.status(200).json({
        message: "Success",
        status: true,
        datas: users,
        page_total: Math.ceil(total / limit),
        total_records: total,
        current_page: pageno,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Internal Server Error",
        status: false,
        datas: [],
        page_total: 0,
        total_records: 0,
        current_page: 1,
      });
    }
  };
  
const listCTV = async (req, res) => {
    let { pageno, pageto } = req.body;

    if (!pageno || !pageto) {
        return res.status(200).json({
            code: 0,
            msg: "No more data",
            data: {
                gameslist: [],
            },
            status: false
        });
    }

    if (pageno < 0 || pageto < 0) {
        return res.status(200).json({
            code: 0,
            msg: "No more data",
            data: {
                gameslist: [],
            },
            status: false
        });
    }
    const [wingo] = await connection.query(`SELECT * FROM users WHERE veri = 1 AND level = 2 ORDER BY id DESC LIMIT ${pageno}, ${pageto} `);
    return res.status(200).json({
        message: 'Success',
        status: true,
        datas: wingo,
    });
}

function formateT2(params) {
    let result = (params < 10) ? "0" + params : params;
    return result;
}

function timerJoin2(params = '', addHours = 0) {
    let date = '';
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

    // return years + '-' + months + '-' + days + ' ' + hours + ':' + minutes + ':' + seconds + ' ' + ampm;
    return years + '-' + months + '-' + days ;
}

const statistical2 = async (req, res) => {
    const [wingo] = await connection.query(`SELECT SUM(money) as total FROM minutes_1 WHERE status = 1 `);
    const [wingo2] = await connection.query(`SELECT SUM(money) as total FROM minutes_1 WHERE status = 2 `);
    const [users] = await connection.query(`SELECT COUNT(id) as total FROM users WHERE status = 1 `);
    const [users2] = await connection.query(`SELECT COUNT(id) as total FROM users WHERE status = 0 `);
    const [recharge] = await connection.query(`SELECT SUM(money) as total FROM recharge WHERE status = 1 `);
    const [withdraw] = await connection.query(`SELECT SUM(money) as total FROM withdraw WHERE status = 1 `);

    const [recharge_today] = await connection.query(`SELECT SUM(money) as total FROM recharge WHERE status = 1 AND today = ?`, [timerJoin2()]);
    const [withdraw_today] = await connection.query(`SELECT SUM(money) as total FROM withdraw WHERE status = 1 AND today = ?`, [timerJoin2()]);

    let win = wingo[0].total;
    let loss = wingo2[0].total;
    let usersOnline = users[0].total;
    let usersOffline = users2[0].total;
    let recharges = recharge[0].total;
    let withdraws = withdraw[0].total;
    return res.status(200).json({
        message: 'Success',
        status: true,
        win: win,
        loss: loss,
        usersOnline: usersOnline,
        usersOffline: usersOffline,
        recharges: recharges,
        withdraws: withdraws,
        rechargeToday: recharge_today[0].total,
        withdrawToday: withdraw_today[0].total,
    });
}

const changeAdmin = async (req, res) => {
    let auth = req.cookies.auth;
    let value = req.body.value;
    let type = req.body.type;
    let typeid = req.body.typeid;

    if (!value || !type || !typeid) return res.status(200).json({
        message: 'Failed',
        status: false,
        timeStamp: timeNow,
    });;
    let game = '';
    let bs = '';
    if (typeid == '1') {
        game = 'wingo1';
        bs = 'bs1';
    }
    if (typeid == '2') {
        game = 'wingo3';
        bs = 'bs3';
    }
    if (typeid == '3') {
        game = 'wingo5';
        bs = 'bs5';
    }
    if (typeid == '4') {
        game = 'wingo10';
        bs = 'bs10';
    }
    switch (type) {
        case 'change-wingo1':
            await connection.query(`UPDATE admin SET ${game} = ? `, [value]);
            return res.status(200).json({
                message: 'Editing results successfully',
                status: true,
                timeStamp: timeNow,
            });
            break;
        case 'change-win_rate':
            await connection.query(`UPDATE admin SET ${bs} = ? `, [value]);
            return res.status(200).json({
                message: 'Editing win rate successfully',
                status: true,
                timeStamp: timeNow,
            });
            break;

        default:
            return res.status(200).json({
                message: 'Failed',
                status: false,
                timeStamp: timeNow,
            });
            break;
    }

}

const changeAdmin1 = async (req, res) => {
    let auth = req.cookies.auth;
    let value = req.body.value;
    let type = req.body.type;
    let typeid = req.body.typeid;

    if (!value || !type || !typeid) return res.status(200).json({
        message: 'Failed',
        status: false,
        timeStamp: timeNow,
    });;
    let game = '';
    let bs = '';
    if (typeid == '1') {
        game = 'trx1';
        bs = 'bs1';
    }
    if (typeid == '2') {
        game = 'trx3';
        bs = 'bs3';
    }
    if (typeid == '3') {
        game = 'trx5';
        bs = 'bs5';
    }
    if (typeid == '4') {
        game = 'trx10';
        bs = 'bs10';
    }
    switch (type) {
        case 'change-trx1':
            await connection.query(`UPDATE admin SET ${game} = ? `, [value]);
            return res.status(200).json({
                message: 'Editing results successfully',
                status: true,
                timeStamp: timeNow,
            });
            break;
        case 'change-win_rate':
            await connection.query(`UPDATE admin SET ${bs} = ? `, [value]);
            return res.status(200).json({
                message: 'Editing win rate successfully',
                status: true,
                timeStamp: timeNow,
            });
            break;

        default:
            return res.status(200).json({
                message: 'Failed',
                status: false,
                timeStamp: timeNow,
            });
            break;
    }

}

function formateT(params) {
    let result = (params < 10) ? "0" + params : params;
    return result;
}

function timerJoin(params = '', addHours = 0) {
    let date = '';
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

    return years + '-' + months + '-' + days + ' ' + hours + ':' + minutes + ':' + seconds + ' ' + ampm;
}

// const userInfo = async (req, res) => {
//     let auth = req.cookies.auth;
//     let phone = req.body.phone;
//     if (!phone) {
//         return res.status(200).json({
//             message: 'Failed',
//             status: false,
//             timeStamp: timeNow,
//         });
//     }

//     const [user] = await connection.query('SELECT * FROM users WHERE phone = ? ', [phone]);

//     if (user.length == 0) {
//         return res.status(200).json({
//             message: 'Failed',
//             status: false,
//             timeStamp: timeNow,
//         });
//     }
//     let userInfo = user[0];
//     // direct subordinate all
//     const [f1s] = await connection.query('SELECT `phone`, `code`,`invite`, `time` FROM users WHERE `invite` = ? ', [userInfo.code]);

//     // cấp dưới trực tiếp hôm nay 
//     let f1_today = 0;
//     for (let i = 0; i < f1s.length; i++) {
//         const f1_time = f1s[i].time; // Mã giới thiệu f1
//         let check = (timerJoin(f1_time) == timerJoin()) ? true : false;
//         if (check) {
//             f1_today += 1;
//         }
//     }

//     // tất cả cấp dưới hôm nay 
//     let f_all_today = 0;
//     for (let i = 0; i < f1s.length; i++) {
//         const f1_code = f1s[i].code; // Mã giới thiệu f1
//         const f1_time = f1s[i].time; // time f1
//         let check_f1 = (timerJoin(f1_time) == timerJoin()) ? true : false;
//         if (check_f1) f_all_today += 1;
//         // tổng f1 mời đc hôm nay
//         const [f2s] = await connection.query('SELECT `phone`, `code`,`invite`, `time` FROM users WHERE `invite` = ? ', [f1_code]);
//         for (let i = 0; i < f2s.length; i++) {
//             const f2_code = f2s[i].code; // Mã giới thiệu f2
//             const f2_time = f2s[i].time; // time f2
//             let check_f2 = (timerJoin(f2_time) == timerJoin()) ? true : false;
//             if (check_f2) f_all_today += 1;
//             // tổng f2 mời đc hôm nay
//             const [f3s] = await connection.query('SELECT `phone`, `code`,`invite`, `time` FROM users WHERE `invite` = ? ', [f2_code]);
//             for (let i = 0; i < f3s.length; i++) {
//                 const f3_code = f3s[i].code; // Mã giới thiệu f3
//                 const f3_time = f3s[i].time; // time f3
//                 let check_f3 = (timerJoin(f3_time) == timerJoin()) ? true : false;
//                 if (check_f3) f_all_today += 1;
//                 const [f4s] = await connection.query('SELECT `phone`, `code`,`invite`, `time` FROM users WHERE `invite` = ? ', [f3_code]);
//                 // tổng f3 mời đc hôm nay
//                 for (let i = 0; i < f4s.length; i++) {
//                     const f4_code = f4s[i].code; // Mã giới thiệu f4
//                     const f4_time = f4s[i].time; // time f4
//                     let check_f4 = (timerJoin(f4_time) == timerJoin()) ? true : false;
//                     if (check_f4) f_all_today += 1;
//                     // tổng f3 mời đc hôm nay
//                 }
//             }
//         }
//     }

//     // Tổng số f2
//     let f2 = 0;
//     for (let i = 0; i < f1s.length; i++) {
//         const f1_code = f1s[i].code; // Mã giới thiệu f1
//         const [f2s] = await connection.query('SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ', [f1_code]);
//         f2 += f2s.length;
//     }

//     // Tổng số f3
//     let f3 = 0;
//     for (let i = 0; i < f1s.length; i++) {
//         const f1_code = f1s[i].code; // Mã giới thiệu f1
//         const [f2s] = await connection.query('SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ', [f1_code]);
//         for (let i = 0; i < f2s.length; i++) {
//             const f2_code = f2s[i].code;
//             const [f3s] = await connection.query('SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ', [f2_code]);
//             if (f3s.length > 0) f3 += f3s.length;
//         }
//     }

//     // Tổng số f4
//     let f4 = 0;
//     for (let i = 0; i < f1s.length; i++) {
//         const f1_code = f1s[i].code; // Mã giới thiệu f1
//         const [f2s] = await connection.query('SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ', [f1_code]);
//         for (let i = 0; i < f2s.length; i++) {
//             const f2_code = f2s[i].code;
//             const [f3s] = await connection.query('SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ', [f2_code]);
//             for (let i = 0; i < f3s.length; i++) {
//                 const f3_code = f3s[i].code;
//                 const [f4s] = await connection.query('SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ', [f3_code]);
//                 if (f4s.length > 0) f4 += f4s.length;
//             }
//         }
//     }
//     // console.log("TOTAL_F_TODAY:" + f_all_today);
//     // console.log("F1: " + f1s.length);
//     // console.log("F2: " + f2);
//     // console.log("F3: " + f3);
//     // console.log("F4: " + f4);

//     const [recharge] = await connection.query('SELECT SUM(`money`) as total FROM recharge WHERE phone = ? AND status = 1 ', [phone]);
//     const [withdraw] = await connection.query('SELECT SUM(`money`) as total FROM withdraw WHERE phone = ? AND status = 1 ', [phone]);
//     const [bank_user] = await connection.query('SELECT * FROM user_bank WHERE phone = ? ', [phone]);
//     const [telegram_ctv] = await connection.query('SELECT `telegram` FROM point_list WHERE phone = ? ', [userInfo.ctv]);
//     const [ng_moi] = await connection.query('SELECT `phone` FROM users WHERE code = ? ', [userInfo.invite]);
//     return res.status(200).json({
//         message: 'Success',
//         status: true,
//         datas: user,
//         total_r: recharge,
//         total_w: withdraw,
//         f1: f1s.length,
//         f2: f2,
//         f3: f3,
//         f4: f4,
//         bank_user: bank_user,
//         telegram: telegram_ctv[0],
//         ng_moi: ng_moi[0],
//         daily: userInfo.ctv,
//     });
// }

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

const settingGet = async (req, res) => {
    let auth = req.cookies.auth;
    if (!auth) {
        return res.status(200).json({
            message: 'Failed',
            status: false,
            timeStamp: timeNow,
        });
    }

    const [bank_recharge] = await connection.query('SELECT * FROM bank_recharge ');
    const [settings] = await connection.query('SELECT * FROM admin ');
    return res.status(200).json({
        message: 'Success',
        status: true,
        settings: settings,
        datas: bank_recharge,
    });
}

// const rechargeDuyet = async (req, res) => {
//     let auth = req.cookies.auth;
//     let id = req.body.id;
//     let type = req.body.type;
//     if (!auth || !id || !type) {
//         return res.status(200).json({
//             message: 'Failed',
//             status: false,
//             timeStamp: timeNow,
//         });
//     }
//     if (type == 'confirm') {
//     // Fetch recharge information
//     const [info] = await connection.query(`SELECT * FROM recharge WHERE id = ?`, [id]);
//     if (info[0].first_recharge == 1) {
//         // Retrieve admin data
//         const [data] = await connection.query(`SELECT * FROM admin`);
//         // Retrieve user information
//         const [info2] = await connection.query(`SELECT * FROM users WHERE phone = ?`, info[0].phone);
//         // Retrieve invite user information
//         const [invite_user] = await connection.query(`SELECT * FROM users WHERE code = ?`, info2[0].invite);
//         // Calculate first recharge bonus based on recharge amount
//         const first_recharge_bonus = info[0].money * (data[0].first_recharge / 100);
//         console.log("this is first Recharge :" + first_recharge_bonus, data[0].first_recharge)
//         const bonusType = "First Recharge Bonus"
        
//         //  let trans = 'INSERT INTO transfer_money SET amount = ?, phone = ?, type = ?, status = 1';
//         // await connection.query(trans, [first_recharge_bonus, info[0].phone, bonusType]);

        
//         // Update recharge status and mark as not first recharge
//         await connection.query(`UPDATE recharge SET status = 1, first_recharge = 0 WHERE id = ?`, [id]);
        
//         // Add first recharge bonus to the user's wallet along with the recharge amount
//         await connection.query('UPDATE users SET winning = winning + ?, money = money + ? WHERE phone = ? ', [info[0].money + first_recharge_bonus, info[0].money, info[0].phone]);
//         // Calculate total money to add to invite user's wallet
//         const invite_bonus =  info[0].money * (data[0].invite_bonus / 100);
        
//         // Update the invite user's wallet with the invite bonus
//         // let trans2 = 'INSERT INTO transfer_money SET amount = ?, phone = ?, type = ?, status = 1';
//         // await connection.query(trans2, [invite_bonus, invite_user[0].phone, "Invite Bonus"]);

//         await connection.query('UPDATE users SET winning = winning + ? WHERE phone = ? ', [invite_bonus,  invite_user[0].phone]);
        
        

//     } else {
//         // Retrieve admin data
//         const [data] = await connection.query(`SELECT * FROM admin`);
//         // Update recharge status if it's not the first recharge
//         const first_recharge_bonus = info[0].money * (data[0].first_recharge / 100);

//         await connection.query(`UPDATE recharge SET status = 1 WHERE id = ?`, [id]);
//         // Add recharge amount to the user's wallet
//       await connection.query('UPDATE users SET money = money + ?, winning = winning + ? WHERE phone = ? ', [info[0].money, info[0].money + first_recharge_bonus,  info[0].phone]);
//     }
//     return res.status(200).json({
//         message: 'Successful application confirmation',
//         status: true,
//         datas: recharge,
//     });
// }
// if (type == 'delete') {
//     await connection.query(`UPDATE recharge SET status = 2 WHERE id = ?`, [id]);

//     return res.status(200).json({
//         message: 'Cancellation successful',
//         status: true,
//         datas: recharge,
//     });
// }

// }

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
       const everyRechargeUser = admin.recharge_bonus || 20; // Regular recharge bonus rate for user
        const everyRechargeInviter =  15; // Regular invite bonus rate

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
        
        // await connection.query(
        //   `INSERT INTO `,
        //   [recharge.money, recharge.money + rechargeBonus, recharge.phone]
        // );

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
        
    } else {
        const everyRechargeUser = admin.recharge_bonus || 20; // Regular recharge bonus rate for user
        const everyRechargeInviter =  15; // Regular invite bonus rate

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
        
        // await connection.query(
        //   `INSERT INTO `,
        //   [recharge.money, recharge.money + rechargeBonus, recharge.phone]
        // );

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
    console.log("Rahul");
    console.error("Error in rechargeDuyet:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      status: false,
    });
  }
};

const updateLevel = async (req, res) => {
    const updatedLevels = req.body;
    
    console.log(updatedLevels)
    try {
        for (const level of updatedLevels) {
            const { id, status, f1, f2 } = level;
            console.log(level)
            await connection.query(
                'UPDATE `level` SET `status` = ?, `f1` = ?, `f2` = ? WHERE `level` = ?',
                [status, f1, f2, id]
            );
        }
        res.status(200).json({
            message: 'Update successful',
            status: true,
        });
    } catch (error) {
        console.error('Error updating level:', error);

        // Send an error response to the client
        res.status(500).json({
            message: 'Update failed',
            status: false,
            error: error.message,
        });
    }
};

const rankLevelUpdate = async (req, res) => {
    const updatedLevels = req.body;
    
    console.log(JSON.stringify(updatedLevels))
    try {
        for (const level of updatedLevels) {
            const { id, status, f1, f2, f3, f4, f5 } = level;
            console.log(level)
            await connection.query(
                'UPDATE `ranking` SET `status` = ?, `f1` = ?, `f2` = ?,  `f3` = ?, `f4` = ?, `f5` = ? WHERE `level` = ?',
                [status, f1, f2, f3, f4, f5, id]
            );
        }
        res.status(200).json({
            message: 'Update successful',
            status: true,
        });
    } catch (error) {
        console.error('Error updating level:', error);

        // Send an error response to the client
        res.status(500).json({
            message: 'Update failed',
            status: false,
            error: error.message,
        });
    }
};

// const handlWithdraw = async (req, res) => {
//     let auth = req.cookies.auth;
//     let id = req.body.id;
//     let type = req.body.type;
//     if (!auth || !id || !type) {
//         return res.status(200).json({
//             message: 'Failed',
//             status: false,
//             timeStamp: timeNow,
//         });
//     }
//     if (type == 'confirm') {
//         await connection.query(`UPDATE withdraw SET status = 1 WHERE id = ?`, [id]);
//         const [info] = await connection.query(`SELECT * FROM withdraw WHERE id = ?`, [id]);
//         return res.status(200).json({
//             message: 'Successful application confirmation',
//             status: true,
//             datas: recharge,
//         });
//     }
//     if (type == 'delete') {
//         await connection.query(`UPDATE withdraw SET status = 2 WHERE id = ?`, [id]);
//         const [info] = await connection.query(`SELECT * FROM withdraw WHERE id = ?`, [id]);
//         await connection.query('UPDATE users SET winning = winning + ? WHERE phone = ? ', [info[0].money, info[0].phone]);
//         await connection.query('UPDATE withdrawl_money SET amount = amount + ? WHERE phone = ? ', [info[0].money, info[0].phone]);

//         return res.status(200).json({
//             message: 'Cancel successfully',
//             status: true,
//             datas: recharge,
//         });
//     }
// }

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
    // await connection.query(
    //   "UPDATE withdrawl_money SET amount = amount + ? WHERE phone = ? ",
    //   [info[0].money, info[0].phone]
    // );

    return res.status(200).json({
      message: "Cancel successfully",
      status: true,
      datas: recharge,
    });
  }
};


const settingBank = async (req, res) => {
    let auth = req.cookies.auth;
    let name_bank = req.body.name_bank;
    let name = req.body.name;
    let info = req.body.info;
    let qr = req.body.qr;
    let typer = req.body.typer;
    if (!auth || !typer) {
        return res.status(200).json({
            message: 'Failed',
            status: false,
            timeStamp: timeNow,
        });
    }
    if (typer == 'bank') {
        await connection.query(`UPDATE bank_recharge SET name_bank = ?, name_user = ?, stk = ? WHERE type = 'bank'`, [name_bank, name, info]);
        return res.status(200).json({
            message: 'Successful change',
            status: true,
            datas: recharge,
        });
    }
    if (typer == 'momo') {
        await connection.query(`UPDATE bank_recharge SET name_bank = ?, name_user = ?, stk = ?, qr_code_image = ? WHERE type = 'upi'`, [name_bank, name, info, qr]);
        return res.status(200).json({
            message: 'Successful change',
            status: true,
            datas: recharge,
        });
    }
}

const settingCskh = async (req, res) => {
    try{
    let auth = req.cookies.auth;
    let telegram = req.body.telegram;
    let cskh = req.body.cskh;
    let myapp_web = req.body.myapp_web;
    if (!auth || !cskh || !telegram) {
        return res.status(200).json({
            message: 'Failed',
            status: false,
            timeStamp: timeNow,
        });
    }
    await connection.query(`UPDATE admin SET telegram = ?, cskh = ?, app = ?`, [telegram, cskh, myapp_web]);
    return res.status(200).json({
        message: 'Successful change',
        status: true,
    });
    }
    catch (error) {
        if (error) console.log(error);
        return res.status(200).json({
        message: 'Error in Changing',
        status: false,
    });
    }
}

const settingNotice = async (req, res) => {
    let auth = req.cookies.auth;
    let notice = req.body.notice;

    if (!auth || !notice ){
        return res.status(200).json({
            message: 'Failed',
            status: false,
            timeStamp: timeNow,
        });
    }
    await connection.query(`UPDATE admin SET  notice = ?`, [notice]);
    return res.status(200).json({
        message: 'Successful change',
        status: true,
    });
}
const settingRegistrationBonus = async (req, res) => {
    let auth = req.cookies.auth;
    let bonus = req.body.bonus;
    let first_recharge = req.body.fr;
    let invite_bonus = req.body.ib;
    let gameAmount = req.body.game;
    let adminCommission = req.body.admin;

    if (!auth || !bonus ){
        return res.status(200).json({
            message: 'Failed',
            status: false,
            timeStamp: timeNow,
        });
    }
    await connection.query(`UPDATE admin SET  game_wallet = ? , admin_wallet = ? , bonus = ? , invite_bonus = ? , first_recharge = ?`, [gameAmount, adminCommission, bonus , invite_bonus , first_recharge]);
    return res.status(200).json({
        message: 'Successful change',
        status: true,
    });
}

const gameToggelStatus = async (req, res) => {
    try {
        const auth = req.cookies.auth;
        const { type } = req.body;

        if (!auth || !type) {
            return res.status(400).json({
                message: 'Invalid request',
                status: false,
            });
        }

        // Map type to the database column
        let methodCheck = '';
        switch (type) {
            case 'wallet':
                methodCheck = 'wallet_active';
                break;
            case 'max':
                methodCheck = 'max_wise';
                break;
            case 'min':
                methodCheck = 'min_wise';
                break;
            case 'random':
                methodCheck = 'random_wise';
                break;
            default:
                return res.status(400).json({
                    message: 'Invalid type',
                    status: false,
                });
        }

        console.log(methodCheck);
        // Fetch current status
        const [info] = await connection.query(`SELECT ${methodCheck} FROM admin WHERE id = ?`, [1]);
        console.log(JSON.stringify(info));
        if (!info || !info.length) {
            return res.status(404).json({
                message: 'Record not found',
                status: false,
            });
        }

        const currentStatus = info[0][methodCheck];

        // Toggle status
        const newStatus = currentStatus === 1 ? 0 : 1;

        // Update status in the database
        await connection.query(`UPDATE admin SET ${methodCheck} = ? WHERE id = ?`, [newStatus, 1]);

        return res.status(200).json({
            message: 'Status updated successfully!',
            status: true,
            newStatus, // Return new status for frontend
        });
    } catch (error) {
        console.error('Error in gameToggelStatus:', error);
        return res.status(500).json({
            message: 'Internal server error',
            status: false,
        });
    }
};


const adminGameActivity = async (req, res) => {
    try {
       
        const [info] = await connection.query(`SELECT * FROM admin WHERE id = ?`, [1]);

        if (!info || !info.length) {
            return res.status(404).json({
                message: 'Record not found',
                status: false,
            });
        }

        return res.status(200).json({
            message: 'Fetch updated successfully!',
            status: true,
            data: info, 
        });
    } catch (error) {
        console.error('Error in gameToggelStatus:', error);
    }
};

const banned = async (req, res) => {
    let auth = req.cookies.auth;
    let id = req.body.id;
    let type = req.body.type;
    if (!auth || !id) {
        return res.status(200).json({
            message: 'Failed',
            status: false,
            timeStamp: timeNow,
        });
    }
    if (type == 'open') {
        await connection.query(`UPDATE users SET status = 1 WHERE id = ?`, [id]);
    }
    if (type == 'close') {
        await connection.query(`UPDATE users SET status = 2 WHERE id = ?`, [id]);
    }
    return res.status(200).json({
        message: 'Successful change',
        status: true,
    });
}


// const createBonus = async (req, res) => {
//     const randomString = (length) => {
//         var result = '';
//         var characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
//         var charactersLength = characters.length;
//         for (var i = 0; i < length; i++) {
//             result += characters.charAt(Math.floor(Math.random() *
//                 charactersLength));
//         }
//         return result;
//     }
//     function timerJoin(params = '', addHours = 0) {
//         let date = '';
//         if (params) {
//             date = new Date(Number(params));
//         } else {
//             date = new Date();
//         }

//         date.setHours(date.getHours() + addHours);

//         let years = formateT(date.getFullYear());
//         let months = formateT(date.getMonth() + 1);
//         let days = formateT(date.getDate());

//         let hours = date.getHours() % 12;
//         hours = hours === 0 ? 12 : hours;
//         let ampm = date.getHours() < 12 ? "AM" : "PM";

//         let minutes = formateT(date.getMinutes());
//         let seconds = formateT(date.getSeconds());

//         return years + '-' + months + '-' + days + ' ' + hours + ':' + minutes + ':' + seconds + ' ' + ampm;
//     }
//     const d = new Date();
//     const time = d.getTime();

//     let auth = req.cookies.auth;
//     let money = req.body.money;
//     let type = req.body.type;


//     if (!money || !auth) {
//         return res.status(200).json({
//             message: 'Failed',
//             status: false,
//             timeStamp: timeNow,
//         });
//     }
//     const [user] = await connection.query('SELECT * FROM users WHERE token = ? ', [auth]);

//     if (user.length == 0) {
//         return res.status(200).json({
//             message: 'Failed',
//             status: false,
//             timeStamp: timeNow,
//         });
//     }
//     let userInfo = user[0];

//     if (type == 'all') {
//         let select = req.body.select;
//         if (select == '1') {
//             await connection.query(`UPDATE point_list SET money = money + ? WHERE level = 2`, [money]);
//         } else {
//             await connection.query(`UPDATE point_list SET money = money - ? WHERE level = 2`, [money]);
//         }
//         return res.status(200).json({
//             message: 'successful change',
//             status: true,
//         });
//     }

//     if (type == 'two') {
//         let select = req.body.select;
//         if (select == '1') {
//             await connection.query(`UPDATE point_list SET money_us = money_us + ? WHERE level = 2`, [money]);
//         } else {
//             await connection.query(`UPDATE point_list SET money_us = money_us - ? WHERE level = 2`, [money]);
//         }
//         return res.status(200).json({
//             message: 'successful change',
//             status: true,
//         });
//     }

//     if (type == 'one') {
//         let select = req.body.select;
//         let phone = req.body.phone;
//         const [user] = await connection.query('SELECT * FROM point_list WHERE phone = ? ', [phone]);
//         if (user.length == 0) {
//             return res.status(200).json({
//                 message: 'Failed',
//                 status: false,
//                 timeStamp: timeNow,
//             });
//         }
//         if (select == '1') {
//             await connection.query(`UPDATE point_list SET money = money + ? WHERE level = 2 and phone = ?`, [money, phone]);
//         } else {
//             await connection.query(`UPDATE point_list SET money = money - ? WHERE level = 2 and phone = ?`, [money, phone]);
//         }
//         return res.status(200).json({
//             message: 'successful change',
//             status: true,
//         });
//     }

//     if (type == 'three') {
//         let select = req.body.select;
//         let phone = req.body.phone;
//         const [user] = await connection.query('SELECT * FROM point_list WHERE phone = ? ', [phone]);
//         if (user.length == 0) {
//             return res.status(200).json({
//                 message: 'account does not exist',
//                 status: false,
//                 timeStamp: timeNow,
//             });
//         }
//         if (select == '1') {
//             await connection.query(`UPDATE point_list SET money_us = money_us + ? WHERE level = 2 and phone = ?`, [money, phone]);
//         } else {
//             await connection.query(`UPDATE point_list SET money_us = money_us - ? WHERE level = 2 and phone = ?`, [money, phone]);
//         }
//         return res.status(200).json({
//             message: 'successful change',
//             status: true,
//         });
//     }

//     if (!type) {
//         let id_redenvelops = randomString(16);
//         let sql = `INSERT INTO redenvelopes SET id_redenvelope = ?, phone = ?, money = ?, used = ?, amount = ?, status = ?, time = ?`;
//         await connection.query(sql, [id_redenvelops, userInfo.phone, money, 1, 1, 0, time]);
//         return res.status(200).json({
//             message: 'Successful change',
//             status: true,
//             id: id_redenvelops,
//         });
//     }
// }

const createBonus = async (req, res) => {
  const randomString = (length) => {
    var result = "";
    var characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  };
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
  const d = new Date();
  const time = d.getTime();

  let auth = req.cookies.auth;
  let money = req.body.money;
  let type = req.body.type;

  if (!money || !auth) {
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
  let userInfo = user[0];

  if (type == "all") {
    let select = req.body.select;
    if (select == "1") {
      await connection.query(
        `UPDATE point_list SET money = money + ? WHERE level = 2`,
        [money]
      );
    } else {
      await connection.query(
        `UPDATE point_list SET money = money - ? WHERE level = 2`,
        [money]
      );
    }
    return res.status(200).json({
      message: "successful change",
      status: true,
    });
  }

  if (type == "two") {
    let select = req.body.select;
    if (select == "1") {
      await connection.query(
        `UPDATE point_list SET money_us = money_us + ? WHERE level = 2`,
        [money]
      );
    } else {
      await connection.query(
        `UPDATE point_list SET money_us = money_us - ? WHERE level = 2`,
        [money]
      );
    }
    return res.status(200).json({
      message: "successful change",
      status: true,
    });
  }

  if (type == "one") {
    let select = req.body.select;
    let phone = req.body.phone;
    const [user] = await connection.query(
      "SELECT * FROM point_list WHERE phone = ? ",
      [phone]
    );
    if (user.length == 0) {
      return res.status(200).json({
        message: "Failed",
        status: false,
        timeStamp: timeNow,
      });
    }
    if (select == "1") {
      await connection.query(
        `UPDATE point_list SET money = money + ? WHERE level = 2 and phone = ?`,
        [money, phone]
      );
    } else {
      await connection.query(
        `UPDATE point_list SET money = money - ? WHERE level = 2 and phone = ?`,
        [money, phone]
      );
    }
    return res.status(200).json({
      message: "successful change",
      status: true,
    });
  }

  if (type == "three") {
    let select = req.body.select;
    let phone = req.body.phone;
    const [user] = await connection.query(
      "SELECT * FROM point_list WHERE phone = ? ",
      [phone]
    );
    if (user.length == 0) {
      return res.status(200).json({
        message: "account does not exist",
        status: false,
        timeStamp: timeNow,
      });
    }
    if (select == "1") {
      await connection.query(
        `UPDATE point_list SET money_us = money_us + ? WHERE level = 2 and phone = ?`,
        [money, phone]
      );
    } else {
      await connection.query(
        `UPDATE point_list SET money_us = money_us - ? WHERE level = 2 and phone = ?`,
        [money, phone]
      );
    }
    return res.status(200).json({
      message: "successful change",
      status: true,
    });
  }

  if (!type) {
    const numberOfUsers = req.body?.numberOfUsers || 1;
    let id_redenvelops = randomString(16);
    let sql = `INSERT INTO redenvelopes SET id_redenvelope = ?, phone = ?, money = ?, used = ?,max_claims= ?, amount = ?, status = ?, time = ?`;
    await connection.query(sql, [
      id_redenvelops,
      userInfo.phone,
      money,
      0,
      numberOfUsers,
      1,
      0,
      time,
    ]);
    return res.status(200).json({
      message: "Successful change",
      status: true,
      id: id_redenvelops,
    });
  }
};

const listRedenvelops = async (req, res) => {
  let [redenvelopes] = await connection.query(
    "SELECT * FROM redenvelopes ORDER BY id DESC"
  );
  return res.status(200).json({
    message: "Successful change",
    status: true,
    redenvelopes: redenvelopes,
  });
};

const settingbuff = async (req, res) => {
    let auth = req.cookies.auth;
    let id_user = req.body.id_user;
    let buff_acc = req.body.buff_acc;
    let money_value = req.body.money_value;
    if (!id_user || !buff_acc || !money_value) {
        return res.status(200).json({
            message: 'Failed',
            status: false,
            timeStamp: timeNow,
        });
    }
    const [user_id] = await connection.query(`SELECT * FROM users WHERE id_user = ?`, [id_user]);

    if (user_id.length > 0) {
        if (buff_acc == '1') {
            await connection.query(`UPDATE users SET money = money + ?, winning = winning + ? WHERE id_user = ?`, [money_value, money_value, id_user]);
        }
        if (buff_acc == '2') {
            await connection.query(`UPDATE users SET money = money - ?, winning = winning - ? WHERE id_user = ?`, [money_value, money_value,  id_user]);
        }
        return res.status(200).json({
            message: 'Successful change',
            status: true,
        });
    } else {
        return res.status(200).json({
            message: 'Successful change',
            status: false,
        });
    }
}
const randomNumber = (min, max) => {
    return String(Math.floor(Math.random() * (max - min + 1)) + min);
}

const randomString = (length) => {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}

const ipAddress = (req) => {
    let ip = '';
    if (req.headers['x-forwarded-for']) {
        ip = req.headers['x-forwarded-for'].split(",")[0];
    } else if (req.connection && req.connection.remoteAddress) {
        ip = req.connection.remoteAddress;
    } else {
        ip = req.ip;
    }
    return ip;
}

const timeCreate = () => {
    const d = new Date();
    const time = d.getTime();
    return time;
}



const register = async (req, res) => {
    let { username, password, invitecode } = req.body;
    let id_user = randomNumber(10000, 99999);
    let name_user = "Member" + randomNumber(10000, 99999);
    let code = randomString(5) + randomNumber(10000, 99999);
    let ip = ipAddress(req);
    let time = timeCreate();

    invitecode = '2cOCs36373';

    if (!username || !password || !invitecode) {
        return res.status(200).json({
            message: 'ERROR!!!',
            status: false
        });
    }

    if (!username) {
        return res.status(200).json({
            message: 'phone error',
            status: false
        });
    }

    try {
        const [check_u] = await connection.query('SELECT * FROM users WHERE phone = ? ', [username]);
        if (check_u.length == 1) {
            return res.status(200).json({
                message: 'register account', //Số điện thoại đã được đăng ký
                status: false
            });
        } else {
            const sql = `INSERT INTO users SET 
            id_user = ?,
            phone = ?,
            name_user = ?,
            password = ?,
            money = ?,
            level = ?,
            code = ?,
            invite = ?,
            veri = ?,
            ip_address = ?,
            status = ?,
            time = ?`;
            await connection.execute(sql, [id_user, username, name_user, md5(password), 0, 2, code, invitecode, 1, ip, 1, time]);
            await connection.execute('INSERT INTO point_list SET phone = ?, level = 2', [username]);
            return res.status(200).json({
                message: 'registration success',//Register Sucess
                status: true
            });
        }
    } catch (error) {
        if (error) console.log(error);
    }

}

const profileUser = async (req, res) => {
    let phone = req.body.phone;
    if (!phone) {
        return res.status(200).json({
            message: 'Phone Error',
            status: false,
            timeStamp: timeNow,
        });
    }
    let [user] = await connection.query(`SELECT * FROM users WHERE phone = ?`, [phone]);

    if (user.length == 0) {
        return res.status(200).json({
            message: 'Phone Error',
            status: false,
            timeStamp: timeNow,
        });
    }
    let [recharge] = await connection.query(`SELECT * FROM recharge WHERE phone = ? ORDER BY id DESC LIMIT 10`, [phone]);
    let [withdraw] = await connection.query(`SELECT * FROM withdraw WHERE phone = ? ORDER BY id DESC LIMIT 10`, [phone]);
    return res.status(200).json({
        message: 'Get success',
        status: true,
        recharge: recharge,
        withdraw: withdraw,
    });
}

const profileUser1 = async (req, res) => {
    let phone = req.body.phone;
    if (!phone) {
        return res.status(200).json({
            message: 'Phone Error',
            status: false,
            timeStamp: timeNow,
        });
    }
    let [user] = await connection.query(`SELECT * FROM users WHERE phone = ?`, [phone]);

    if (user.length == 0) {
        return res.status(200).json({
            message: 'Phone Error',
            status: false,
            timeStamp: timeNow,
        });
    }
    let [recharge] = await connection.query(`SELECT * FROM recharge WHERE phone = ? ORDER BY id DESC LIMIT 10`, [phone]);
    let [withdraw] = await connection.query(`SELECT * FROM withdraw WHERE phone = ? ORDER BY id DESC LIMIT 10`, [phone]);
    return res.status(200).json({
        message: 'Get success',
        status: true,
        recharge: recharge,
        withdraw: withdraw,
    });
}

const infoCtv = async (req, res) => {
    const phone = req.body.phone;

    const [user] = await connection.query('SELECT * FROM users WHERE phone = ? ', [phone]);

    if (user.length == 0) {
        return res.status(200).json({
            message: 'Phone Error',
            status: false,
        });
    }
    let userInfo = user[0];
    // cấp dưới trực tiếp all
    const [f1s] = await connection.query('SELECT `phone`, `code`,`invite`, `time` FROM users WHERE `invite` = ? ', [userInfo.code]);

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
        const [f2s] = await connection.query('SELECT `phone`, `code`,`invite`, `time` FROM users WHERE `invite` = ? ', [f1_code]);
        for (let i = 0; i < f2s.length; i++) {
            const f2_code = f2s[i].code; // Mã giới thiệu f2
            const f2_time = f2s[i].time; // time f2
            let check_f2 = (timerJoin(f2_time) == timerJoin()) ? true : false;
            if (check_f2) f_all_today += 1;
            // tổng f2 mời đc hôm nay
            const [f3s] = await connection.query('SELECT `phone`, `code`,`invite`, `time` FROM users WHERE `invite` = ? ', [f2_code]);
            for (let i = 0; i < f3s.length; i++) {
                const f3_code = f3s[i].code; // Mã giới thiệu f3
                const f3_time = f3s[i].time; // time f3
                let check_f3 = (timerJoin(f3_time) == timerJoin()) ? true : false;
                if (check_f3) f_all_today += 1;
                const [f4s] = await connection.query('SELECT `phone`, `code`,`invite`, `time` FROM users WHERE `invite` = ? ', [f3_code]);
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

    const [list_mem] = await connection.query('SELECT * FROM users WHERE ctv = ? AND status = 1 AND veri = 1 ', [phone]);
    const [list_mem_baned] = await connection.query('SELECT * FROM users WHERE ctv = ? AND status = 2 AND veri = 1 ', [phone]);
    let total_recharge = 0;
    let total_withdraw = 0;
    for (let i = 0; i < list_mem.length; i++) {
        let phone = list_mem[i].phone;
        const [recharge] = await connection.query('SELECT SUM(money) as money FROM recharge WHERE phone = ? AND status = 1 ', [phone]);
        const [withdraw] = await connection.query('SELECT SUM(money) as money FROM withdraw WHERE phone = ? AND status = 1 ', [phone]);
        if (recharge[0].money) {
            total_recharge += Number(recharge[0].money);
        }
        if (withdraw[0].money) {
            total_withdraw += Number(withdraw[0].money);
        }
    }

    let total_recharge_today = 0;
    let total_withdraw_today = 0;
    for (let i = 0; i < list_mem.length; i++) {
        let phone = list_mem[i].phone;
        const [recharge_today] = await connection.query('SELECT `money`, `time` FROM recharge WHERE phone = ? AND status = 1 ', [phone]);
        const [withdraw_today] = await connection.query('SELECT `money`, `time` FROM withdraw WHERE phone = ? AND status = 1 ', [phone]);
        for (let i = 0; i < recharge_today.length; i++) {
            let today = timerJoin();
            let time = timerJoin(recharge_today[i].time);
            if (time == today) {
                total_recharge_today += recharge_today[i].money;
            }
        }
        for (let i = 0; i < withdraw_today.length; i++) {
            let today = timerJoin();
            let time = timerJoin(withdraw_today[i].time);
            if (time == today) {
                total_withdraw_today += withdraw_today[i].money;
            }
        }
    }

    let win = 0;
    let loss = 0;
    for (let i = 0; i < list_mem.length; i++) {
        let phone = list_mem[i].phone;
        const [wins] = await connection.query('SELECT `money`, `time` FROM minutes_1 WHERE phone = ? AND status = 1 ', [phone]);
        const [losses] = await connection.query('SELECT `money`, `time` FROM minutes_1 WHERE phone = ? AND status = 2 ', [phone]);
        for (let i = 0; i < wins.length; i++) {
            let today = timerJoin();
            let time = timerJoin(wins[i].time);
            if (time == today) {
                win += wins[i].money;
            }
        }
        for (let i = 0; i < losses.length; i++) {
            let today = timerJoin();
            let time = timerJoin(losses[i].time);
            if (time == today) {
                loss += losses[i].money;
            }
        }
    }
    let list_mems = [];
    const [list_mem_today] = await connection.query('SELECT * FROM users WHERE ctv = ? AND status = 1 AND veri = 1 ', [phone]);
    for (let i = 0; i < list_mem_today.length; i++) {
        let today = timerJoin();
        let time = timerJoin(list_mem_today[i].time);
        if (time == today) {
            list_mems.push(list_mem_today[i]);
        }
    }

    const [point_list] = await connection.query('SELECT * FROM point_list WHERE phone = ? ', [phone]);
    let moneyCTV = point_list[0].money;

    let list_recharge_news = [];
    let list_withdraw_news = [];
    for (let i = 0; i < list_mem.length; i++) {
        let phone = list_mem[i].phone;
        const [recharge_today] = await connection.query('SELECT `id`, `status`, `type`,`phone`, `money`, `time` FROM recharge WHERE phone = ? AND status = 1 ', [phone]);
        const [withdraw_today] = await connection.query('SELECT `id`, `status`,`phone`, `money`, `time` FROM withdraw WHERE phone = ? AND status = 1 ', [phone]);
        for (let i = 0; i < recharge_today.length; i++) {
            let today = timerJoin();
            let time = timerJoin(recharge_today[i].time);
            if (time == today) {
                list_recharge_news.push(recharge_today[i]);
            }
        }
        for (let i = 0; i < withdraw_today.length; i++) {
            let today = timerJoin();
            let time = timerJoin(withdraw_today[i].time);
            if (time == today) {
                list_withdraw_news.push(withdraw_today[i]);
            }
        }
    }

    const [redenvelopes_used] = await connection.query('SELECT * FROM redenvelopes_used WHERE phone = ? ', [phone]);
    let redenvelopes_used_today = [];
    for (let i = 0; i < redenvelopes_used.length; i++) {
        let today = timerJoin();
        let time = timerJoin(redenvelopes_used[i].time);
        if (time == today) {
            redenvelopes_used_today.push(redenvelopes_used[i]);
        }
    }

    const [financial_details] = await connection.query('SELECT * FROM financial_details WHERE phone = ? ', [phone]);
    let financial_details_today = [];
    for (let i = 0; i < financial_details.length; i++) {
        let today = timerJoin();
        let time = timerJoin(financial_details[i].time);
        if (time == today) {
            financial_details_today.push(financial_details[i]);
        }
    }


    return res.status(200).json({
        message: 'Success',
        status: true,
        datas: user,
        f1: f1s.length,
        f2: f2,
        f3: f3,
        f4: f4,
        list_mems: list_mems,
        total_recharge: total_recharge,
        total_withdraw: total_withdraw,
        total_recharge_today: total_recharge_today,
        total_withdraw_today: total_withdraw_today,
        list_mem_baned: list_mem_baned.length,
        win: win,
        loss: loss,
        list_recharge_news: list_recharge_news,
        list_withdraw_news: list_withdraw_news,
        moneyCTV: moneyCTV,
        redenvelopes_used: redenvelopes_used_today,
        financial_details_today: financial_details_today,
    });
}

const infoCtv2 = async (req, res) => {
    const phone = req.body.phone;
    const timeDate = req.body.timeDate;

    function timerJoin(params = '', addHours = 0) {
        let date = '';
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

        return years + '-' + months + '-' + days + ' ' + hours + ':' + minutes + ':' + seconds + ' ' + ampm;
    }

    const [user] = await connection.query('SELECT * FROM users WHERE phone = ? ', [phone]);

    if (user.length == 0) {
        return res.status(200).json({
            message: 'Phone Error',
            status: false,
        });
    }
    let userInfo = user[0];
    const [list_mem] = await connection.query('SELECT * FROM users WHERE ctv = ? AND status = 1 AND veri = 1 ', [phone]);

    let list_mems = [];
    const [list_mem_today] = await connection.query('SELECT * FROM users WHERE ctv = ? AND status = 1 AND veri = 1 ', [phone]);
    for (let i = 0; i < list_mem_today.length; i++) {
        let today = timeDate;
        let time = timerJoin(list_mem_today[i].time);
        if (time == today) {
            list_mems.push(list_mem_today[i]);
        }
    }

    let list_recharge_news = [];
    let list_withdraw_news = [];
    for (let i = 0; i < list_mem.length; i++) {
        let phone = list_mem[i].phone;
        const [recharge_today] = await connection.query('SELECT `id`, `status`, `type`,`phone`, `money`, `time` FROM recharge WHERE phone = ? AND status = 1 ', [phone]);
        const [withdraw_today] = await connection.query('SELECT `id`, `status`,`phone`, `money`, `time` FROM withdraw WHERE phone = ? AND status = 1 ', [phone]);
        for (let i = 0; i < recharge_today.length; i++) {
            let today = timeDate;
            let time = timerJoin(recharge_today[i].time);
            if (time == today) {
                list_recharge_news.push(recharge_today[i]);
            }
        }
        for (let i = 0; i < withdraw_today.length; i++) {
            let today = timeDate;
            let time = timerJoin(withdraw_today[i].time);
            if (time == today) {
                list_withdraw_news.push(withdraw_today[i]);
            }
        }
    }

    const [redenvelopes_used] = await connection.query('SELECT * FROM redenvelopes_used WHERE phone = ? ', [phone]);
    let redenvelopes_used_today = [];
    for (let i = 0; i < redenvelopes_used.length; i++) {
        let today = timeDate;
        let time = timerJoin(redenvelopes_used[i].time);
        if (time == today) {
            redenvelopes_used_today.push(redenvelopes_used[i]);
        }
    }

    const [financial_details] = await connection.query('SELECT * FROM financial_details WHERE phone = ? ', [phone]);
    let financial_details_today = [];
    for (let i = 0; i < financial_details.length; i++) {
        let today = timeDate;
        let time = timerJoin(financial_details[i].time);
        if (time == today) {
            financial_details_today.push(financial_details[i]);
        }
    }

    return res.status(200).json({
        message: 'Success',
        status: true,
        datas: user,
        list_mems: list_mems,
        list_recharge_news: list_recharge_news,
        list_withdraw_news: list_withdraw_news,
        redenvelopes_used: redenvelopes_used_today,
        financial_details_today: financial_details_today,
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
// Level Setting get

const getLevelInfo = async (req, res) => {

    const [rows] = await connection.query('SELECT * FROM `level`');

    if (!rows) {
        return res.status(200).json({
            message: 'Failed',
            status: false,

        });
    }
    console.log("asdasdasd : " + rows)
    return res.status(200).json({
        message: 'Success',
        status: true,
        data: {

        },
        rows: rows
    });

    // const [recharge] = await connection.query('SELECT * FROM recharge WHERE `phone` = ? AND status = 1', [rows[0].phone]);
    // let totalRecharge = 0;
    // recharge.forEach((data) => {
    //     totalRecharge += data.money;
    // });
    // const [withdraw] = await connection.query('SELECT * FROM withdraw WHERE `phone` = ? AND status = 1', [rows[0].phone]);
    // let totalWithdraw = 0;
    // withdraw.forEach((data) => {
    //     totalWithdraw += data.money;
    // });

    // const { id, password, ip, veri, ip_address, status, time, token, ...others } = rows[0];
    // return res.status(200).json({
    //     message: 'Success',
    //     status: true,
    //     data: {
    //         code: others.code,
    //         id_user: others.id_user,
    //         name_user: others.name_user,
    //         phone_user: others.phone,
    //         money_user: others.money,
    //     },
    //     totalRecharge: totalRecharge,
    //     totalWithdraw: totalWithdraw,
    //     timeStamp: timeNow,
    // });


}

const getRankLevelInfo = async (req, res) => {

    const [rows] = await connection.query('SELECT * FROM `ranking`');

    if (!rows) {
        return res.status(200).json({
            message: 'Failed',
            status: false,

        });
    }
    console.log("asdasdasd : " + rows)
    return res.status(200).json({
        message: 'Success',
        status: true,
        data: {

        },
        rows: rows
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


const listOrderOld = async (req, res) => {
    let { gameJoin } = req.body;

    let checkGame = ['1', '3', '5', '10'].includes(String(gameJoin));
    if (!checkGame) {
        return res.status(200).json({
            code: 0,
            msg: "No more data",
            data: {
                gameslist: [],
            },
            status: false
        });
    }
    let game = Number(gameJoin);

    let join = '';
    if (game == 1) join = 'k5d';
    if (game == 3) join = 'k5d3';
    if (game == 5) join = 'k5d5';
    if (game == 10) join = 'k5d10';

    const [k5d] = await connection.query(`SELECT * FROM 5d WHERE status != 0 AND game = '${game}' ORDER BY id DESC LIMIT 10 `);
    const [period] = await connection.query(`SELECT period FROM 5d WHERE status = 0 AND game = '${game}' ORDER BY id DESC LIMIT 1 `);
    const [waiting] = await connection.query(`SELECT phone, money, price, amount, bet FROM result_5d WHERE status = 0 AND level = 0 AND game = '${game}' ORDER BY id ASC `);
    const [settings] = await connection.query(`SELECT ${join} FROM admin`);
    if (k5d.length == 0) {
        return res.status(200).json({
            code: 0,
            msg: "No more data",
            data: {
                gameslist: [],
            },
            status: false
        });
    }
    if (!k5d[0] || !period[0]) {
        return res.status(200).json({
            message: 'Error!',
            status: false
        });
    }
    return res.status(200).json({
        code: 0,
        msg: "Get success",
        data: {
            gameslist: k5d,
        },
        bet: waiting,
        settings: settings,
        join: join,
        period: period[0].period,
        status: true
    });
}

const listOrderOldK3 = async (req, res) => {
    let { gameJoin } = req.body;

    let checkGame = ['1', '3', '5', '10'].includes(String(gameJoin));
    if (!checkGame) {
        return res.status(200).json({
            code: 0,
            msg: "No more data",
            data: {
                gameslist: [],
            },
            status: false
        });
    }
    let game = Number(gameJoin);

    let join = '';
    if (game == 1) join = 'k3d';
    if (game == 3) join = 'k3d3';
    if (game == 5) join = 'k3d5';
    if (game == 10) join = 'k3d10';

    const [k5d] = await connection.query(`SELECT * FROM k3 WHERE status != 0 AND game = '${game}' ORDER BY id DESC LIMIT 10 `);
    const [period] = await connection.query(`SELECT period FROM k3 WHERE status = 0 AND game = '${game}' ORDER BY id DESC LIMIT 1 `);
    const [waiting] = await connection.query(`SELECT phone, money, price, typeGame, amount, bet FROM result_k3 WHERE status = 0 AND level = 0 AND game = '${game}' ORDER BY id ASC `);
    const [settings] = await connection.query(`SELECT ${join} FROM admin`);
    if (k5d.length == 0) {
        return res.status(200).json({
            code: 0,
            msg: "No more data",
            data: {
                gameslist: [],
            },
            status: false
        });
    }
    if (!k5d[0] || !period[0]) {
        return res.status(200).json({
            message: 'Error!',
            status: false
        });
    }
    return res.status(200).json({
        code: 0,
        msg: "Get Success",
        data: {
            gameslist: k5d,
        },
        bet: waiting,
        settings: settings,
        join: join,
        period: period[0].period,
        status: true
    });
}

const editResult = async (req, res) => {
    let { game, list } = req.body;

    if (!list || !game) {
        return res.status(200).json({
            message: 'ERROR!!!',
            status: false
        });
    }

    let join = '';
    if (game == 1) join = 'k5d';
    if (game == 3) join = 'k5d3';
    if (game == 5) join = 'k5d5';
    if (game == 10) join = 'k5d10';

    const sql = `UPDATE admin SET ${join} = ?`;
    await connection.execute(sql, [list]);
    return res.status(200).json({
        message: 'Editing is successful',//Register Sucess
        status: true
    });

}

const editResult2 = async (req, res) => {
    let { game, list } = req.body;

    if (!list || !game) {
        return res.status(200).json({
            message: 'ERROR!!!',
            status: false
        });
    }

    let join = '';
    if (game == 1) join = 'k3d';
    if (game == 3) join = 'k3d3';
    if (game == 5) join = 'k3d5';
    if (game == 10) join = 'k3d10';

    const sql = `UPDATE admin SET ${join} = ?`;
    await connection.execute(sql, [list]);
    return res.status(200).json({
        message: 'Editing is successful',//Register Sucess
        status: true
    });

}

const CreatedSalary = async (req, res) => {
    try {
        const phone = req.body.phone;
        const amount = req.body.amount;
        const type = req.body.type;
        const now = new Date();
        const formattedTime = now.toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });

        // Check if the phone number is a 10-digit number
        if (!/^\d{10}$/.test(phone)) {
            return res.status(400).json({
                message: 'ERROR!!! Invalid phone number. Please provide a 10-digit phone number.',
                status: false
            });
        }

        // Check if user with the given phone number exists
        const checkUserQuery = 'SELECT * FROM `users` WHERE phone = ?';
        const [existingUser] = await connection.execute(checkUserQuery, [phone]);

        if (existingUser.length === 0) {
            // If user doesn't exist, return an error
            return res.status(400).json({
                message: 'ERROR!!! User with the provided phone number does not exist.',
                status: false
            });
        }

        // If user exists, update the 'users' table
        const updateUserQuery = 'UPDATE `users` SET `winning` = `winning` + ? WHERE phone = ?';
        await connection.execute(updateUserQuery, [amount, phone]);


        // Insert record into 'salary' table
        const insertSalaryQuery = 'INSERT INTO salary (phone, amount, type, time) VALUES (?, ?, ?, ?)';
        await connection.execute(insertSalaryQuery, [phone, amount, type, formattedTime]);

        res.status(200).json({ message: 'Salary record created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


const getSalary = async (req, res) => {
      const [rows] = await connection.query(`SELECT * FROM salary ORDER BY time DESC`);
  
      if (!rows) {
        return res.status(200).json({
            message: 'Failed',
            status: false,

        });
    }
    console.log("asdasdasd : " + rows)
    return res.status(200).json({
        message: 'Success',
        status: true,
        data: {

        },
        rows: rows
  })
};



// adminController.js

// Set up multer storage
const currentDirectory = process.cwd();

// Define the destination directory relative to the current directory
const uploadDir = path.join(currentDirectory, 'src', 'public', 'uploads', 'banners');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir); // Specify the destination folder for banner uploads
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname)); // Set the filename
    }
});

// Initialize multer upload
const upload = multer({ storage: storage }).array('banners');

const uploadBanner = async (req, res) => {
    try {
        // Handle file upload using multer
        upload(req, res, async function (err) {
            if (err instanceof multer.MulterError) {
                console.error('Multer error:', err);
                return res.status(400).json({ message: 'File upload error' });
            } else if (err) {
                console.error('Error uploading files:', err);
                return res.status(500).json({ message: 'Internal server error' });
            }

            // If files are successfully uploaded
            const banners = req.files; // Access uploaded files
            if (!banners || banners.length === 0) {
                return res.status(400).json({ message: 'No files uploaded' });
            }

            // Process and save the files to storage
            // Assuming each uploaded banner corresponds to a separate record in the database
            for (const banner of banners) {
                const filename = banner.filename;
                // Save file information to MySQL database
                await connection.query('INSERT INTO banners (filename) VALUES (?)', [filename]);
            }

            return res.status(200).json({ message: 'Files uploaded successfully', status: true, files: banners });
        });
    } catch (error) {
        console.error('Error uploading files:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

const getBanners = async (req, res) => {
    try {
        const [rows] = await connection.query('SELECT filename FROM banners');
        console.log("Banners fetched from DB:", rows);  // Log the rows to verify data
        return res.status(200).json({ message: 'Success', status: true, filename: rows });
    } catch (error) {
        console.error("Database query error:", error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

const getBannersHome = async (req, res) => {
    try {
        const [rows] = await connection.query('SELECT filename FROM banners');
        console.log("Banners fetched from DB:", rows);  // Log the rows to verify data
        return res.status(200).json({ message: 'Success', status: true, filename: rows });
    } catch (error) {
        console.error("Database query error:", error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};


const deleteBanner = async (req, res) => {
    const filename = req.body.filename; // Access the filename from the request parameters
    const currentDirectory = process.cwd();
    const filePath = path.join(currentDirectory, 'src', 'public', 'uploads', 'banners', filename);
    
    // Delete the file
    fs.unlink(filePath, async (err) => {
        if (err) {
            console.error('Error deleting banner:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }       
        // If the file is deleted successfully, delete its record from the database
        try {
            await connection.query('DELETE FROM banners WHERE filename = ?', [filename]);
            res.status(200).json({ message: 'Banner deleted successfully', status: true });
        } catch (error) {
            console.error('Error deleting banner from database:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    });
};


const getRoiLevelInfo = async (req, res) => {

    const [rows] = await connection.query('SELECT * FROM `roi_profit`');

    if (!rows) {
        return res.status(200).json({
            message: 'Failed',
            status: false,

        });
    }
    return res.status(200).json({
        message: 'Success',
        status: true,
        data: rows
    });
}

const updateRoiLevel = async (req, res) => {
    const updatedLevels = req.body;
    console.log(updatedLevels);
    try {
        for (const level of updatedLevels) {
            console.log(JSON.stringify(level))
            const { id, status, profit } = level;
            console.log("Level 2 : " + JSON.stringify(level.id))
            await connection.query(
                'UPDATE `roi_profit` SET `status` = ?, `profit` = ? WHERE `id` = ?',
                [status, profit, id]
            );
        }
        res.status(200).json({
            message: 'Update successful',
            status: true,
        });
    } catch (error) {
        console.error('Error updating level:', error);

        // Send an error response to the client
        res.status(500).json({
            message: 'Update failed',
            status: false,
            error: error.message,
        });
    }
};


// const randomString = (length) => {
//     var result = '';
//     var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
//     var charactersLength = characters.length;
//     for (var i = 0; i < length; i++) {
//         result += characters.charAt(Math.floor(Math.random() *
//             charactersLength));
//     }
//     return result;
// }


// const randomNumber = (min, max) => {
//     return String(Math.floor(Math.random() * (max - min + 1)) + min);
// }

// const timeCreate = () => {
//     const d = new Date();
//     const time = d.getTime();
//     return time;
// }
const isNumber = (params) => {
    let pattern = /^[0-9]*\d$/;
    return pattern.test(params);
}

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

const getSalarySetting = async (req, res) => {

    const [rows] = await connection.query('SELECT * FROM `salary_setting`');

    if (!rows) {
        return res.status(200).json({
            message: 'Failed',
            status: false,

        });
    }
    return res.status(200).json({
        message: 'Success',
        status: true,
        data: rows
    });
}

const updateSalarySetting = async (req, res) => {
    const updatedLevels = req.body;
    try {
        for (const level of updatedLevels) {
            const { id, status, team, total_amount, amount } = level;
            await connection.query('UPDATE `salary_setting` SET `status` = ?, `team` = ?, `amount` = ?, `total_amount` = ? WHERE `id` = ?',  [status, team, amount, total_amount, id] );
        }
        res.status(200).json({
            message: 'Update successful',
            status: true,
        });
    } catch (error) {
        console.error('Error updating level:', error);

        // Send an error response to the client
        res.status(500).json({
            message: 'Update failed',
            status: false,
            error: error.message,
        });
    }
};
  
  
  const getSalaryRecord = async(req, res)=>{
  
    const [getPhone] = await connection.query(
    `SELECT * FROM salary WHERE status = 1 `
    );

      return res.status(200).json({
          message: 'Success',
          status: true,
          data: {
             getPhone
          }
    })
}
  
  const getSalaryRecordHistory = async(req, res)=>{
  
    const [getPhone] = await connection.query(
    `SELECT * FROM salary WHERE status = 0 `
    );

      return res.status(200).json({
          message: 'Success',
          status: true,
          data: {
             getPhone
          }
    })
}


const fetchReferralsMember = async (inviteCode, level, maxLevels) => {
    if (level > maxLevels) return { total: 0, totalAmount: 0 };

    const [referrals] = await connection.query('SELECT * FROM users WHERE invite = ?', [inviteCode]);

    if (!referrals.length) return { total: 0, totalAmount: 0 };

    let total = referrals.length;
    let totalAmount = 0;

    for (let referral of referrals) {
        const [rechargeData] = await connection.query('SELECT money FROM recharge WHERE phone = ? AND DATE(today) = CURDATE()', [referral.phone]);
        if (rechargeData.length) {
            for (let record of rechargeData) {
                totalAmount += record.money;
            }
        }

        const childReferralsData = await fetchReferralsMember(referral.code, level + 1, maxLevels);
        total += childReferralsData.total;
        totalAmount += childReferralsData.totalAmount;
    }

    return { total, totalAmount };
};

// const SalaryAmountDistributed = async (req, res) => {
//     console.log("sagar ranasdgf",3357)
//     const timeNow = new Date();
    
//     try {
//         const [users] = await connection.query('SELECT * FROM users');

//         if (!users.length) {
//             return res.status(200).json({
//                 message: 'Failed',
//                 status: false,
//                 timeStamp: timeNow,
//             });
//         }

//         const [settings] = await connection.query('SELECT * FROM salary_setting WHERE status = 1 ORDER BY team DESC');

//         if (!settings.length) {
//             return res.status(200).json({
//                 message: 'Failed',
//                 status: false,
//                 timeStamp: timeNow,
//             });
//         }

//         const rankAMount = (team, recharge) => {
//             let bonusamount = 0;
//             let rank = 0;

//             for (const setting of settings) {
//                 if (recharge >= setting.total_amount && team >= setting.team) {
//                     bonusamount = setting.amount;
//                     rank = setting.level;
//                     break;
//                 }
//             }

//             return { bonusamount, rank, recharge };
//         };

//         let salaryDetails = [];

//         for (let user of users) {
//             const userInfo = user;
//             const referralData = await fetchReferralsMember(userInfo.code, 1, 20);
//             console.log('User ID:', userInfo.id, 'Referral Data:', referralData);

//             const allMember = referralData.total;
//             const TodayAllRecharg = referralData.totalAmount;

//             const salaryData = rankAMount(allMember, TodayAllRecharg);
//             console.log('Salary Data:', salaryData);

//             // Update the user's salary only if criteria are met
//             if (salaryData.bonusamount > 0) {
//                 try {
//                     const type = "daily";
//                     // await connection.query('UPDATE users SET winning = winning + ? WHERE phone = ?', [salaryData.bonusamount, userInfo.phone]);
//                     let sql = 'INSERT INTO salary (phone, user_id, amount, total_recharge, type) VALUES (?, ?, ?, ?, ?)';
//                     await connection.query(sql, [userInfo.phone, userInfo.id_user, salaryData.bonusamount, TodayAllRecharg, type]);
                    
//                     const TranstionQuery = 'INSERT INTO transfer_money SET phone = ?, amount = ?, type = ?, status = 2 ';
//                     await connection.query(TranstionQuery, [userInfo.phone, salaryData.bonusamount, "Salary Bonus"]);

//                     salaryDetails.push({
//                         phone: userInfo.phone,
//                         bonusamount: salaryData.bonusamount,
//                         total_recharge: TodayAllRecharg,
//                         type: type
//                     });
//                 } catch (error) {
//                     console.error('Error updating salary for user:', userInfo.phone, error);
//                 }
//             }
//         }

//         return res.status(200).json({
//             message: 'Success',
//             status: true,
//             timeStamp: timeNow,
//             data: salaryDetails
//         });

//     } catch (error) {
//         console.error('Error creating salary:', error);
//         return res.status(500).json({
//             message: 'Failed',
//             status: false,
//             timeStamp: timeNow,
//         });
//     }
// };
const SalaryAmountDistributed = async () => {
  console.log("🚀 Executing Salary Distribution Job...");
  const type = "daily";

  try {
    const [users] = await connection.query(
      "SELECT id_user, code, phone FROM users"
    );

    if (!users.length) {
      console.log("❌ No users found.");
      return;
    }

    const [settings] = await connection.query(
      "SELECT * FROM salary_setting WHERE CAST(status AS UNSIGNED) = 1 ORDER BY CAST(team AS UNSIGNED) DESC"
    );

    if (!settings.length) {
      console.log("❌ No salary settings found.");
      return;
    }

    console.log("✅ Settings:", settings);

    for (const user of users) {
      // Get direct referrals
      const [directReffreal] = await connection.query(
        "SELECT id_user, code, phone FROM users WHERE invite = ?",
        [user.code]
      );

      console.log(directReffreal, "directReffreal");

      const directCount = directReffreal.length;

      // Find the highest team level the user qualifies for
      let matchedSettings = settings.find(setting => directCount >= parseInt(setting.team));

      if (!matchedSettings) {
        console.log(`⚠️ User ${user.phone} does not qualify for salary.`);
        continue;
      }

      console.log(`🔍 Checking referrals for user: ${user.phone}`);

      const startOfDay = new Date().setHours(0, 0, 0, 0);
      const endOfDay = new Date().setHours(23, 59, 59, 999);

      // Fetch total recharge amount within today's time range
      const [recharges] = await connection.query(
        `SELECT SUM(money) AS total_recharge FROM recharge 
         WHERE phone IN (?) AND status = 1 AND time BETWEEN ? AND ?`,
        [directReffreal.map(ref => ref.phone), startOfDay, endOfDay]
      );
      console.log(recharges, "recharges", user.phone);

      let totalRecharge = recharges[0]?.total_recharge || 0;

      console.log(`💰 Total Recharge for ${user.phone}:`, totalRecharge);

      // Find the highest qualifying salary setting based on total recharge
      let finalSettings = matchedSettings;
      while (finalSettings && totalRecharge < parseInt(finalSettings.total_amount)) {
        // Move to the next lower team setting
        const currentIndex = settings.findIndex(s => s.team === finalSettings.team);
        finalSettings = settings[currentIndex + 1] || null;
      }

      if (!finalSettings) {
        console.log(`⚠️ User ${user.phone} did not meet salary criteria.`);
        continue;
      }

      console.log(`✅ User ${user.phone} qualifies for salary at Level ${finalSettings.level}.`);

      try {
        // Update winning balance
        await connection.query(
          "UPDATE users SET winning = winning + ? WHERE phone = ?",
          [finalSettings.amount, user.phone]
        );

        // Insert salary record
        const currentTime = Math.floor(Date.now() / 1000); // Convert to seconds

        console.log(`📌 Inserting salary for ${user.phone}: Amount ${finalSettings.amount}`);

        await connection.query(
          `INSERT INTO salary (phone, user_id, amount, total_recharge, type, time) 
           VALUES (?, ?, ?, ?, ?, FROM_UNIXTIME(?))`,
          [user.phone, user.id_user, finalSettings.amount, totalRecharge, type, currentTime]
        );
        
        const TranstionQuery =
          "INSERT INTO transfer_money SET phone = ?, amount = ?, type = ?, status = 2 ";
        await connection.query(TranstionQuery, [
          user.phone,
          finalSettings.amount,
          "Daily Salary Bonus",
        ]);

        console.log(`🎉 Salary inserted successfully for ${user.phone}`);
      } catch (insertError) {
        console.error(`❌ Error inserting salary for ${user.phone}:`, insertError);
      }
    }

    console.log("✅ Salary Distribution Job Completed.");
  } catch (error) {
    console.error("❌ Error in Salary Distribution:", error);
  }
};


const SalaryStatus = async (req, res) => {
    let auth = req.cookies.auth;
    let id = req.body.id;
    let type = req.body.type;
    if (!auth || !id || !type) {
        return res.status(200).json({
            message: 'Failed',
            status: false,
            timeStamp: timeNow,
        });
    }
    console.log(id, type)
    if (type == 'confirm') {
    const [info] = await connection.query(`SELECT * FROM salary WHERE id = ?`, [id]);
    if(!info){
        return res.status(200).json({
            message: 'Salary not Exist',
            status: false,
            timeStamp: timeNow,
        });
    }
    const [user] = await connection.query(`SELECT * FROM users WHERE phone = ?`, [info[0].phone]);
    console.log(info[0])
     if(!user){
        return res.status(200).json({
            message: 'User not found',
            status: false,
            timeStamp: timeNow,
        });
    }
    console.log(user[0])
    const updated = await connection.query(`UPDATE users SET winning = winning + ? WHERE phone = ?`, [info[0].amount, user[0].phone ]);
    await connection.query(`UPDATE salary SET status = 0 WHERE id = ?`, [id]);
    console.log(updated)
   
    return res.status(200).json({
        message: 'Successful application confirmation',
        status: true,
        datas: recharge,
    });
}
if (type == 'delete') {
    await connection.query(`UPDATE salary SET status = 2 WHERE id = ?`, [id]);

    return res.status(200).json({
        message: 'Cancellation successful',
        status: true,
        datas: recharge,
    });
}

}


const CreatedManualSalary = async (req, res) => {
    try {
        const phone = req.body.phone;
        const amount = req.body.amount;
        const type = req.body.type;
        const now = new Date();
        const formattedTime = now.toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });

        // Check if the phone number is a 10-digit number
        if (!/^\d{10}$/.test(phone)) {
            return res.status(400).json({
                message: 'ERROR!!! Invalid phone number. Please provide a 10-digit phone number.',
                status: false
            });
        }

        // Check if user with the given phone number exists
        const checkUserQuery = 'SELECT * FROM `users` WHERE phone = ?';
        const [existingUser] = await connection.execute(checkUserQuery, [phone]);

        if (existingUser.length === 0) {
            // If user doesn't exist, return an error
            return res.status(400).json({
                message: 'ERROR!!! User with the provided phone number does not exist.',
                status: false
            });
        }

        // If user exists, update the 'users' table
        const updateUserQuery = 'UPDATE `users` SET `winning` = `winning` + ? WHERE phone = ?';
        await connection.execute(updateUserQuery, [amount, phone]);


        // Insert record into 'salary' table
        const insertSalaryQuery = 'INSERT INTO manual_salary_recode (phone, amount, type, status) VALUES (?, ?, ?, ?)';
        await connection.execute(insertSalaryQuery, [phone, amount, type, 1]);
        
        const TranstionQuery = 'INSERT INTO transfer_money SET phone = ?, amount = ?, type = ?, status = 2 ';
         await connection.query(TranstionQuery, [phone, amount, "Agent Salary Bonus"]);

        res.status(200).json({ message: 'Salary record created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error'+error });
    }
};

const getManualSalaryRecords = async (req, res) => {
    const [rows] = await connection.query(`SELECT * FROM manual_salary_recode ORDER BY time DESC`);

    if (!rows) {
        return res.status(200).json({
            message: 'Failed',
            status: false,

        });
    }
    return res.status(200).json({
        message: 'Success',
        status: true,
        data: {

        },
        rows: rows
    })
};



const AdminToUserLogin = async (req, res) => {
    let auth = req.cookies.auth;  // Admin auth token from cookie
    const { username } = req.body;

    if (!username) {
        return res.status(400).json({
            message: 'Failed: Username required',
            status: false,
        });
    }

    if (!auth) {
        return res.status(400).json({
            message: 'Failed: Admin not Found',
            status: false,
        });
    }

    console.log(username, auth)

    try {
        // Fetch user based on username (phone in this case)
        const [rows] = await connection.query('SELECT * FROM users WHERE phone = ?', [username]);

    console.log("this is rows data : ", rows[0])
        // Fetch admin using the token (auth) from cookie
        const [admin] = await connection.query('SELECT * FROM users WHERE token = ?', [auth]);

        if (admin.length === 0) {
            return res.status(404).json({
                message: 'Admin account does not exist',
                status: false
            });
        }
    console.log("this is rows admin : ", admin[0])

             // Log out the admin by setting their token to NULL (instead of 0)
             const checking = await connection.execute('UPDATE `users` SET `token` = ? WHERE `phone` = ?', [0, admin[0].phone]);
             
             if(!checking){
                 console.log("In logout query : ", admin[0])
                return res.status(404).json({
                message: 'Failed',
                status: false
            });
             }

             console.log("Admin logged out");
     

   
        // Check if user exists
        if (rows.length === 1) {
            const user = rows[0];

            // Check if the user's account is active
            if (user.status === 1) {
                const { password, money, ip, veri, ip_address, status, time, ...others } = user;

                // Ensure that `timeNow` is defined
                const timeNow = new Date().getTime();

                // Generate the JWT token for the user being logged in
                const accessToken = jwt.sign(
                    { user: { ...others }, timeNow: timeNow },
                    process.env.JWT_ACCESS_TOKEN,
                    { expiresIn: "1d" }
                );

                console.log("JWT token generated:", accessToken);

                // Update the user's token in the database
                await connection.execute('UPDATE `users` SET `token` = ? WHERE `phone` = ?', [md5(accessToken), username]);

                console.log("User token updated in the database");

                // Send success response with the generated JWT token
                return res.status(200).json({
                    message: 'Login Success',
                    status: true,
                    token: accessToken,
                    value: md5(accessToken)
                });
            } else {
                return res.status(403).json({
                    message: 'User account has been locked',
                    status: false
                });
            }
        } else {
            return res.status(404).json({
                message: 'User not found',
                status: false
            });
        }
    } catch (error) {
        console.error('Error in login flow:', error);
        return res.status(500).json({
            message: 'Server error',
            status: false
        });
    }
};


const addNotification = async (req, res) => {
    let auth = req.cookies.auth;
    let name = req.body.name;
    let content = req.body.content;

    console.log(content, auth, name);

    const timeNow = Date.now();

    // Required field validation
    if (!auth || !content || !name) {
        return res.status(200).json({
            message: 'Failed: Please fill the required fields',
            status: false,
            timeStamp: timeNow,
        });
    }
    // Check if recipient user exists
    const [users] = await connection.query('SELECT * FROM users WHERE `token` = ?', [auth]);
    if (users.length === 0) {
        return res.status(200).json({
            message: 'Failed: User not found',
            status: false,
            timeStamp: timeNow,
        });
    }

    
    await connection.execute('INSERT INTO notification SET name = ?, content = ?, status = ?', [name, content, 1]);
 
    return res.status(200).json({
        message: 'Notification Added Success',
        status: true,
        timeStamp: timeNow,
    });
};



const addInvitationBonus = async (req, res) => {
    let auth = req.cookies.auth;
    let bonus = req.body.amount;
    let invite = req.body.invites;
    let recharge = req.body.recharge;
    console.log(invite, auth, recharge, bonus);

    const timeNow = Date.now();

    // Required field validation
    if (!auth || !bonus || !invite || !recharge) {
        return res.status(200).json({
            message: 'Failed: Please fill the required fields',
            status: false,
            timeStamp: timeNow,
        });
    }
    // Check if recipient user exists
    const [users] = await connection.query('SELECT * FROM users WHERE `token` = ?', [auth]);
    if (users.length === 0) {
        return res.status(200).json({
            message: 'Failed: User not found',
            status: false,
            timeStamp: timeNow,
        });
    }

    
    await connection.execute('INSERT INTO invitation_bonus SET bonus = ?, invites = ?, recharge = ?, status = ?', [bonus,  invite, recharge, 1]);
 
    return res.status(200).json({
        message: 'Bonus Added Success',
        status: true,
        timeStamp: timeNow,
    });
};

const fetchGameProblam = async (req, res) => {
    try {
        let auth = req.cookies.auth;
        let timeNow = new Date().toISOString(); 
        const [details] = await connection.query('SELECT * FROM game_problam WHERE status = 0');
        
        // Check if bet amount exists
        if (details.length === 0) {
            return res.status(200).json({
                message: 'Failed: No data',
                status: false,
                timeStamp: timeNow,
            });
        }

        return res.status(200).json({
            message: 'Success: Fetch successfully',
            status: true,
            data: details, 
            timeStamp: timeNow,
        });

    } catch (error) {
        console.error("Error processing rebate:", error);
        return res.status(500).json({
            message: 'Server error',
            status: false,
            error: error.message,
            timeStamp: new Date().toISOString(),
        });
    }
};


const gameIssueDuyet = async (req, res) => {
    let auth = req.cookies.auth;
    let id = req.body.id;
    let type = req.body.type;

    if (!auth || !id || !type) {
        return res.status(200).json({
            message: 'Failed',
            status: false,
            timeStamp: timeNow,
        });
    }

    if (type == 'confirm') {
        await connection.query(`UPDATE game_problam SET status = 1 WHERE id = ?`, [id]);
        return res.status(200).json({
            message: 'Successful application confirmation',
            status: true,
            datas: recharge,
        });
    } else if (type == 'delete') {
        await connection.query(`UPDATE game_problam SET status = 2 WHERE id = ?`, [id]);
        return res.status(200).json({
            message: 'Cancellation successful',
            status: true,
            datas: recharge,
        });
    }
};


// Set up multer storage
const currentDirectory2 = process.cwd();

// Define the destination directory relative to the current directory
const uploadDir2 = path.join(currentDirectory2, 'src', 'public', 'uploads', 'images');

// Ensure the upload directory exists
if (!fs.existsSync(uploadDir2)) {
    try {
        fs.mkdirSync(uploadDir2, { recursive: true });
    } catch (err) {
        console.error("Error creating directory:", err);
    }
}

// Multer storage configuration
const storage2 = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir2); // Set the destination folder for uploads
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname)); // Unique filename
    }
});

// Optional: File filter to allow only certain file types (e.g., images)
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, and GIF are allowed.'));
    }
};

// Initialize multer upload with file filter and size limit (e.g., 5MB)
const upload2 = multer({
    storage: storage2,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5 MB file size limit
}).fields([
    { name: 'phonepe', maxCount: 1 },
    { name: 'gpay', maxCount: 1 },
    { name: 'trcscanner', maxCount: 1 },
    { name: 'bepscanner', maxCount: 1 },
]);

// const UpdatePayment = async (req, res) => {
//     upload2(req, res, async function (err) {
//         if (err instanceof multer.MulterError) {
//             console.error('Multer error:', err);
//             return res.status(400).json({ message: 'File upload error', error: err.message });
//         } else if (err) {
//             console.error('Error uploading files:', err);
//             return res.status(500).json({ message: 'Internal server error', error: err.message });
//         }

//       let auth = req.cookies.auth;
//         let { upi, bep, trc, bank_name, ifsc, account_number, holder_name, usdt } = req.body;
//         let files = req.files; // Access uploaded files

//         if (!auth || (!upi && !bep && !trc && !bank_name && !ifsc && !account_number && !holder_name && usdt && !files)) {
//             return res.status(400).json({
//                 message: 'Failed: Please fill in at least one field',
//                 status: false,
//                 timeStamp: new Date().toISOString(),
//             });
//         }

//         try {
//             const [rows] = await connection.query(`SELECT * FROM payment_details LIMIT 1`);

//             // Prepare file names (if files exist)
//             let phonepeFile = files?.phonepe ? files.phonepe[0].filename : null;
//             let gpayFile = files?.gpay ? files.gpay[0].filename : null;
//             let trcscannerFile = files?.trcscanner ? files.trcscanner[0].filename : null;
//             let bepscannerFile = files?.bepscanner ? files.bepscanner[0].filename : null;
//               let nagadFile = files?.nagad ? files.nagad[0].filename : null;
//             let bkashFile = files?.bkash ? files.bkash[0].filename : null;

//             if (rows.length === 0) {
//                 // Insert data if no existing records
//                 const sql = `INSERT INTO payment_details (usdt, upi, bep, trc, phonepe,nagad,bkash, gpay, trcscanner, bepscanner, bank_name, account_number, ifsc_code, holder_name) 
//                              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
//                 await connection.execute(sql, [
//                     usdt || null, 
//                     upi || null, 
//                     bep || null, 
//                     trc || null, 
//                     phonepeFile, 
//                     nagadFile,
//                     bkashFile,
//                     gpayFile, 
//                     trcscannerFile, 
//                     bepscannerFile, 
//                     bank_name || null, 
//                     account_number || null, 
//                     ifsc || null, 
//                     holder_name || null
//                 ]);
//                 return res.status(200).json({
//                     message: 'Success: Successfully Inserted',
//                     status: true
//                 });
//             } else {
//                 // Update existing record
//                 let updates = [];
//                 let params = [];

//                 if (usdt) {
//                     updates.push("usdt = ?");
//                     params.push(usdt);
//                 }  
//                 if (upi) {
//                     updates.push("upi = ?");
//                     params.push(upi);
//                 }
//                 if (bep) {
//                     updates.push("bep = ?");
//                     params.push(bep);
//                 }
//                 if (trc) {
//                     updates.push("trc = ?");
//                     params.push(trc);
//                 }
//                 if (phonepeFile) {
//                     updates.push("phonepe = ?");
//                     params.push(phonepeFile);
//                 }
//                 if (gpayFile) {
//                     updates.push("gpay = ?");
//                     params.push(gpayFile);
//                 }
//                 if (trcscannerFile) {
//                     updates.push("trcscanner = ?");
//                     params.push(trcscannerFile);
//                 }
//                 if (bepscannerFile) {
//                     updates.push("bepscanner = ?");
//                     params.push(bepscannerFile);
//                 }
//                 if (bank_name) {
//                     updates.push("bank_name = ?");
//                     params.push(bank_name);
//                 }
//                 if (account_number) {
//                     updates.push("account_number = ?");
//                     params.push(account_number);
//                 }
//                 if (ifsc) {
//                     updates.push("ifsc_code = ?");
//                     params.push(ifsc);
//                 }
//                 if (holder_name) {
//                     updates.push("holder_name = ?");
//                     params.push(holder_name);
//                 }

//                 if (updates.length > 0) {
//                     const sql = `UPDATE payment_details SET ${updates.join(', ')} WHERE id = ?`;
//                     params.push(rows[0].id); // Assuming the first row contains the id
//                     await connection.query(sql, params);
//                 }

//                 return res.status(200).json({
//                     message: 'Success: Updated Successfully',
//                     status: true,
//                 });
//             }
//         } catch (error) {
//             console.error(error);
//             return res.status(500).json({
//                 message: 'Failed: Internal Server Error',
//                 status: false,
//                 error: error.message
//             });
//         }
//     });
// };

// const UpdatePayment = async (req, res) => {
//     upload2(req, res, async function (err) {
//         if (err instanceof multer.MulterError) {
//             console.error('Multer error:', err);
//             return res.status(400).json({ message: 'File upload error', error: err.message });
//         } else if (err) {
//             console.error('Error uploading files:', err);
//             return res.status(500).json({ message: 'Internal server error', error: err.message });
//         }

//         let auth = req.cookies.auth;
//         let { upi, bep, trc, bank_name, ifsc, account_number, holder_name, usdt,bkashAddress,nagadAddress } = req.body;
//         let files = req.files; // Access uploaded files

//         if (!auth || (!upi && !bep && !trc && !bank_name && !ifsc && !account_number && !holder_name && !usdt && !files)) {
//             return res.status(400).json({
//                 message: 'Failed: Please fill in at least one field',
//                 status: false,
//                 timeStamp: new Date().toISOString(),
//             });
//         }

//         try {
//             const [rows] = await connection.query(`SELECT * FROM payment_details LIMIT 1`);

//             // Prepare file names (if files exist)
//             let phonepeFile = files?.phonepe ? files.phonepe[0].filename : null;
//             let gpayFile = files?.gpay ? files.gpay[0].filename : null;
//             let trcscannerFile = files?.trcscanner ? files.trcscanner[0].filename : null;
//             let bepscannerFile = files?.bepscanner ? files.bepscanner[0].filename : null;
//             let nagadFile = files?.nagad ? files.nagad[0].filename : null;
//             let bkashFile = files?.bkash ? files.bkash[0].filename : null;

//             if (rows.length === 0) {
//                 // Insert data if no existing records
//                 const sql = `INSERT INTO payment_details 
//                     (usdt, upi, bep, trc, phonepe, nagad, bkash, gpay, trcscanner, bepscanner, bank_name, account_number, ifsc_code, holder_name) 
//                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
//                 await connection.execute(sql, [
//                     usdt || null, 
//                     upi || null, 
//                     bep || null, 
//                     trc || null, 
//                     phonepeFile, 
//                     nagadFile,
//                     bkashFile,
//                     gpayFile, 
//                     trcscannerFile, 
//                     bepscannerFile, 
//                     bank_name || null, 
//                     account_number || null, 
//                     ifsc || null, 
//                     holder_name || null
//                 ]);
//                 return res.status(200).json({
//                     message: 'Success: Successfully Inserted',
//                     status: true
//                 });
//             } else {
//                 // Update existing record
//                 let updates = [];
//                 let params = [];

//                 if (usdt) {
//                     updates.push("usdt = ?");
//                     params.push(usdt);
//                 }  
//                 if (upi) {
//                     updates.push("upi = ?");
//                     params.push(upi);
//                 }
//                 if (bep) {
//                     updates.push("bep = ?");
//                     params.push(bep);
//                 }
//                 if (trc) {
//                     updates.push("trc = ?");
//                     params.push(trc);
//                 }
//                 if (phonepeFile) {
//                     updates.push("phonepe = ?");
//                     params.push(phonepeFile);
//                 }
//                 if (gpayFile) {
//                     updates.push("gpay = ?");
//                     params.push(gpayFile);
//                 }
//                 if (trcscannerFile) {
//                     updates.push("trcscanner = ?");
//                     params.push(trcscannerFile);
//                 }
//                 if (bepscannerFile) {
//                     updates.push("bepscanner = ?");
//                     params.push(bepscannerFile);
//                 }
//                 if (nagadFile) {
//                     updates.push("nagad = ?");
//                     params.push(nagadFile);
//                 }
//                 if (bkashFile) {
//                     updates.push("bkash = ?");
//                     params.push(bkashFile);
//                 }
//                 if (bank_name) {
//                     updates.push("bank_name = ?");
//                     params.push(bank_name);
//                 }
//                 if (account_number) {
//                     updates.push("account_number = ?");
//                     params.push(account_number);
//                 }
//                 if (ifsc) {
//                     updates.push("ifsc_code = ?");
//                     params.push(ifsc);
//                 }
//                 if (holder_name) {
//                     updates.push("holder_name = ?");
//                     params.push(holder_name);
//                 }

//                 if (updates.length > 0) {
//                     const sql = `UPDATE payment_details SET ${updates.join(', ')} WHERE id = ?`;
//                     params.push(rows[0].id); // Assuming the first row contains the id
//                     await connection.query(sql, params);
//                 }

//                 return res.status(200).json({
//                     message: 'Success: Updated Successfully',
//                     status: true,
//                 });
//             }
//         } catch (error) {
//             console.error(error);
//             return res.status(500).json({
//                 message: 'Failed: Internal Server Error',
//                 status: false,
//                 error: error.message
//             });
//         }
//     });
// };

const UpdatePayment = async (req, res) => {
  try {
    // Wrap upload2 in a Promise to handle async properly
    await new Promise((resolve, reject) => {
      upload2(req, res, (err) => {
        if (err instanceof multer.MulterError) {
          console.error("Multer error:", err);
          return reject(res.status(400).json({ message: "File upload error", error: err.message }));
        } else if (err) {
          console.error("Error uploading files:", err);
          return reject(res.status(500).json({ message: "Internal server error", error: err.message }));
        }
        resolve();
      });
    });

    let auth = req.cookies.auth;
    let {
      upi, bep, trc, bank_name, ifsc_code, account_number, holder_name,
      usdt, bkashAddress, nagadAddress, bkashAddress2, nagadAddress2
    } = req.body;

    let files = req.files || {};

    // Extract file names
    let phonepeFile = files.phonepe?.[0]?.filename || null;
    let gpayFile = files.gpay?.[0]?.filename || null;
    let trcscannerFile = files.trcscanner?.[0]?.filename || null;
    let bepscannerFile = files.bepscanner?.[0]?.filename || null;

    // Check if any valid field is present
    let isEmpty = !upi && !bep && !trc && !bank_name && !ifsc_code && !account_number &&
      !holder_name && !usdt && !bkashAddress && !nagadAddress && !bkashAddress2 &&
      !nagadAddress2 && Object.keys(files).length === 0;

    if (!auth || isEmpty) {
      return res.status(400).json({
        message: "Failed: Please fill in at least one field",
        status: false,
        timeStamp: new Date().toISOString(),
      });
    }

    // Check if a record already exists
    const [rows] = await connection.query(`SELECT id FROM payment_details LIMIT 1`);

    if (rows.length === 0) {
      // Insert new record if none exists
      const sql = `INSERT INTO payment_details (usdt, upi, bep, trc, nagadAddress, bkashAddress, nagadAddress2, bkashAddress2, phonepe, gpay, trcscanner, bepscanner, bank_name, account_number, ifsc_code, holder_name) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      await connection.execute(sql, [
        usdt || null, upi || null, bep || null, trc || null,
        nagadAddress || null, bkashAddress || null, nagadAddress2 || null, bkashAddress2 || null,
        phonepeFile, gpayFile, trcscannerFile, bepscannerFile,
        bank_name || null, account_number || null, ifsc_code || null, holder_name || null,
      ]);
    } else {
      // Update existing record
      let updates = [];
      let params = [];
      const fieldsToUpdate = {
        usdt, upi, bep, trc, bank_name, ifsc_code, account_number, holder_name,
        bkashAddress, nagadAddress, bkashAddress2, nagadAddress2,
        phonepe: phonepeFile, gpay: gpayFile, trcscanner: trcscannerFile, bepscanner: bepscannerFile
      };

      Object.entries(fieldsToUpdate).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          updates.push(`${key} = ?`);
          params.push(value);
        }
      });

      if (updates.length > 0) {
        const sql = `UPDATE payment_details SET ${updates.join(", ")} WHERE id = ?`;
        params.push(rows[0].id);
        await connection.query(sql, params);
      }
    }

    return res.status(200).json({
      message: "Payment details updated successfully",
      status: true
    });

  } catch (error) {
    console.error("UpdatePayment Error:", error);
    return res.status(500).json({
      message: "Failed: Internal Server Error",
      status: false,
      error: error.message,
    });
  }
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



// const bonus = async (req, res) => {
//   try {
//     let { pageno, limit, type } = req.body;

//     // Convert pageno and limit to numbers to prevent SQL errors
//     pageno = Number(pageno);
//     limit = Number(limit);

//     // Ensure pageno and limit are provided (0 is valid)
//     if (pageno === undefined || limit === undefined || isNaN(pageno) || isNaN(limit)) {
//       return res.status(200).json({
//         code: 0,
//         msg: "No more data",
//         data: {
//           gameslist: [],
//         },
//         status: false,
//       });
//     }

//     if (pageno < 0 || limit <= 0) {
//       return res.status(200).json({
//         code: 0,
//         msg: "No more data",
//         data: {
//           gameslist: [],
//         },
//         status: false,
//       });
//     }

//     let query = `SELECT * FROM transfer_money`;
//     let countQuery = `SELECT COUNT(*) as count FROM transfer_money`;
//     let queryParams = [];

//     if (type) {
//       query += ` WHERE LOWER(type) LIKE LOWER(?)`;
//       countQuery += ` WHERE LOWER(type) LIKE LOWER(?)`;
//       queryParams.push(`%${type}%`); // Match 'Signup bonus' with 'signup'
//     }

//     query += ` ORDER BY id DESC LIMIT ?, ?`;
//     queryParams.push(pageno * limit, limit);

//     const [bonus] = await connection.query(query, queryParams);
//     const [total_bonus] = await connection.query(countQuery, type ? [`%${type}%`] : []);

//     return res.status(200).json({
//       status: true,
//       data: bonus,
//       page_total: Math.ceil(total_bonus[0].count / limit),
//     });
//   } catch (error) {
//     return res.status(500).json({
//       message: "Internal server error",
//       error: error.message,
//       status: false,
//     });
//   }
// };


// const bonus = async (req, res) => {
//   try {
//     let { pageno, limit, type, search } = req.body;

//     // Convert pageno and limit to numbers to prevent SQL errors
//     pageno = Number(pageno);
//     limit = Number(limit);

//     // Ensure pageno and limit are valid
//     if (isNaN(pageno) || isNaN(limit) || pageno < 0 || limit <= 0) {
//       return res.status(200).json({
//         code: 0,
//         msg: "No more data",
//         data: {
//           gameslist: [],
//         },
//         status: false,
//       });
//     }

//     let query = `SELECT * FROM transfer_money WHERE 1=1`; // Using WHERE 1=1 to simplify conditions
//     let countQuery = `SELECT COUNT(*) as count FROM transfer_money WHERE 1=1`;
//     let queryParams = [];
//     let countParams = [];

//     // Search by type (case-insensitive)
//     if (type) {
//       query += ` AND LOWER(type) LIKE LOWER(?)`;
//       countQuery += ` AND LOWER(type) LIKE LOWER(?)`;
//       queryParams.push(`%${type}%`);
//       countParams.push(`%${type}%`);
//     }

//     // Search by mobile, id, or type using a common "search" field
//     if (search) {
//       query += ` AND (mobile LIKE ? OR id LIKE ? OR LOWER(type) LIKE LOWER(?))`;
//       countQuery += ` AND (mobile LIKE ? OR id LIKE ? OR LOWER(type) LIKE LOWER(?))`;
//       queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
//       countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
//     }

//     // Add pagination and sorting
//     query += ` ORDER BY id DESC LIMIT ?, ?`;
//     queryParams.push(pageno * limit, limit);

//     // Execute queries
//     const [bonus] = await connection.query(query, queryParams);
//     const [total_bonus] = await connection.query(countQuery, countParams);

//     return res.status(200).json({
//       status: true,
//       data: bonus,
//       page_total: Math.ceil(total_bonus[0].count / limit),
//     });
//   } catch (error) {
//     return res.status(500).json({
//       message: "Internal server error",
//       error: error.message,
//       status: false,
//     });
//   }
// };

const bonus = async (req, res) => {
  try {
    let { pageno, limit, type, search } = req.body;

    // Convert to numbers and ensure valid pagination values
    pageno = Number(pageno) || 0;
    limit = Number(limit) || 30;

    if (pageno < 0 || limit <= 0) {
      return res.status(200).json({
        code: 0,
        msg: "No more data",
        data: { gameslist: [] },
        status: false,
      });
    }

    let query = `SELECT * FROM transfer_money WHERE 1=1`;
    let countQuery = `SELECT COUNT(*) as count FROM transfer_money WHERE 1=1`;
    let queryParams = [];
    let countParams = [];

    // Filter by type (if provided)
    if (type) {
      query += ` AND LOWER(type) LIKE LOWER(?)`;
      countQuery += ` AND LOWER(type) LIKE LOWER(?)`;
      queryParams.push(`%${type}%`);
      countParams.push(`%${type}%`);
    }

    // Apply search filter only if search is not empty
    if (search && search.trim() !== "") {
      query += ` AND (phone LIKE ? OR id LIKE ? OR LOWER(type) LIKE LOWER(?))`;
      countQuery += ` AND (phone LIKE ? OR id LIKE ? OR LOWER(type) LIKE LOWER(?))`;
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    // Apply pagination
    query += ` ORDER BY id DESC LIMIT ?, ?`;
    queryParams.push(pageno * limit, limit);

    // Execute queries
    const [bonus] = await connection.query(query, queryParams);
    const [total_bonus] = await connection.query(countQuery, countParams);

    return res.status(200).json({
      status: true,
      data: bonus,
      page_total: Math.ceil(total_bonus[0].count / limit),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
      status: false,
    });
  }
};



const BetCommission = async (req,res)=>{
  try {
    let { pageno = 1, limit = 10, search = "" } = req.body;
    pageno = parseInt(pageno) > 0 ? parseInt(pageno) : 1;
    limit = parseInt(limit) > 0 ? parseInt(limit) : 10;
    let offset = (pageno - 1) * limit;
    let timeNow = new Date().toISOString();

    // Advanced Query Building
    let query = "SELECT SQL_CALC_FOUND_ROWS * FROM betting_commission WHERE `status` = 1";
    let queryParams = [];

    if (search) {
      query += " AND (`phone` LIKE ? OR `id` = ? )";
      queryParams.push(`%${search}%`, search);
    }

    query += " ORDER BY id DESC LIMIT ? OFFSET ?";
    queryParams.push(limit, offset);

    // Execute Main Query
    const [betting_get] = await connection.query(query, queryParams);
    
    // Get Total Count for Pagination
    const [[{ totalRecords }]] = await connection.query("SELECT FOUND_ROWS() AS totalRecords");
    const totalPages = Math.ceil(totalRecords / limit);

    return res.status(200).json({
      message: "Success: Bet amount retrieved successfully",
      status: true,
      data: betting_get,
      pagination: {
        pageno,
        limit,
        totalRecords,
        totalPages,
        hasNextPage: pageno < totalPages,
        hasPrevPage: pageno > 1,
      },
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
}


const updatePositionSubAdmin = async (req, res) => {
  try {
    const { phone } = req.body;
    const [users] = await connection.query(
      "SELECT * FROM users WHERE `phone` = ?",
      [phone]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found", status: false });
    }

    const newLevel = users[0].level === 23 ? 0 : 23;
    await connection.query("UPDATE users SET `level` = ? WHERE `phone` = ?", [
      newLevel,
      phone,
    ]);

    return res
      .status(200)
      .json({ message: "User level updated successfully", status: true });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", status: false });
  }
};



const getGiftCodeHistory = async (req, res) => {
  try {
    let { pageNo = 1, limit = 10, search = "" } = req.query;

    // Forcefully cast and ensure pageNo is minimum 1
    pageNo = Math.max(parseInt(pageNo), 1);
    limit = parseInt(limit);

    const offset = (pageNo - 1) * limit;
    const searchValue = `%${search}%`;

    const [rows] = await connection.query(
      `
      SELECT 
        r.*, 
        u.name_user, 
        u.id_user
      FROM 
        redenvelopes_used r
      LEFT JOIN 
        users u ON r.phone_used = u.phone
      WHERE 
        r.phone_used LIKE ? OR 
        r.id_redenvelops LIKE ?
      ORDER BY 
        r.id DESC
      LIMIT ? OFFSET ?
      `,
      [searchValue, searchValue, limit, offset]
    );

    const [countResult] = await connection.query(
      `
      SELECT COUNT(*) as total 
      FROM redenvelopes_used 
      WHERE phone_used LIKE ? OR id_redenvelops LIKE ?
      `,
      [searchValue, searchValue]
    );

    const total = countResult[0].total;

    return res.status(200).json({
      message: "Success",
      status: true,
      data: rows,
      pagination: {
        total,
        pageNo,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching redenvelopes_used:", error);
    return res.status(500).json({
      message: "Internal server error hai",
      status: false,
      error,
    });
  }
};

const updateUserAvatarWithdrawal = async (req, res) => {
    try {
        const { phone } = req.body;

        if (!phone) {
            return res.status(400).json({
            message: 'Invalid input. Please provide a valid phone.',
            status: false,
            });
        }

        const [user] = await connection.query('SELECT * FROM users WHERE phone = ?', [phone]);

        if (user.length === 0) {
            return res.status(404).json({
            message: 'User not found',
            status: false,
            });
        }

        const currentAvatarWithdrawal = user[0].avatar_withdrawal;
        const newAvatarWithdrawal = currentAvatarWithdrawal === 0 ? 1 : 0;

        await connection.query('UPDATE users SET avatar_withdrawal = ? WHERE phone = ?', [newAvatarWithdrawal, phone]);

        return res.status(200).json({
            message: 'User withdrawal setting updated successfully',
            status: true,
        });
    } catch (error) {
        console.error('Error updating avatar_withdrawal:', error);
        return res.status(500).json({
            message: 'Internal server error',
            status: false,
        });
    }
};





const updateBankDetails = async (req, res) => {
    try {
        const { phone } = req.params;

        console.log(req.body,"resdfdg");
        const {
            name_bank = "0",
            name_user = "0",
            stk = "0",
            email = "0",
            tinh = "0",
            upi = "0",
            bep = "0",
            trc = "0",
            nagad = "0",
            bkash = "0"
        } = req.body;

        if (!phone) {
            return res.status(400).json({
                message: 'Phone number is required',
                status: false,
            });
        }

        const [existingUserBank] = await connection.query('SELECT * FROM user_bank WHERE phone = ?', [phone]);

        if (existingUserBank.length > 0) {
            // Update existing record
            await connection.query(
                `UPDATE user_bank SET 
                    name_bank = ?, 
                    name_user = ?, 
                    stk = ?, 
                    email = ?, 
                    tinh = ?, 
                    upi = ?, 
                    bep = ?, 
                    trc = ?, 
                    nagad = ?, 
                    bkash = ? 
                WHERE phone = ?`,
                [name_bank, name_user, stk, email, tinh, upi, bep, trc, nagad, bkash, phone]
            );
            return res.status(200).json({
                message: 'Bank details updated successfully',
                status: true,
            });
        } else {
            // Insert new record
            await connection.query(
                `INSERT INTO user_bank 
                    (phone, name_bank, name_user, stk, email, tinh, upi, bep, trc, nagad, bkash) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [phone, name_bank, name_user, stk, email, tinh, upi, bep, trc, nagad, bkash]
            );
            return res.status(200).json({
                message: 'Bank details added successfully',
                status: true,
            });
        }

            //    return res.status(200).json({
            //     message: 'Bank details updated successfully',
            //     status: true,
            //     body:req.body
            // });
    } catch (error) {
        console.error('Error updating bank details:', error);
        return res.status(500).json({
            message: 'Internal server error',
            status: false,
            error:error
        });
    }
};




export default {
    updateBankDetails,
    updateUserAvatarWithdrawal,
    giftCodeHistoryPage,
    getGiftCodeHistory,
    adminPage,
    adminPage3,
    adminPage5,
    adminPage10,
    trxPage,
    trxPage3,
    trxPage5,
    trxPage10,
    totalJoin,
    totalJoin1,
    middlewareAdminController,
    changeAdmin,
    changeAdmin1,
    membersPage,
    listMember,
    infoMember,
    userInfo,
    statistical,
    statistical2,
    rechargePage,
    recharge,
    rechargeDuyet,
    rechargeRecord,
    withdrawRecord,
    withdraw,
    levelSetting,
    handlWithdraw,
    settings,
    editResult2,
    settingBank,
    settingGet,
    settingCskh,
    settingNotice,
    settingRegistrationBonus,
    settingbuff,
    register,
    ctvPage,
    listCTV,
    profileUser,
    profileUser1,
    ctvProfilePage,
    infoCtv,
    infoCtv2,
    giftPage,
    createBonus,
    listRedenvelops,
    banned,
    listRechargeMem,
    listWithdrawMem,
    getLevelInfo,
    listRedenvelope,
    listBet,
    adminPage5d,
    listOrderOld,
    listOrderOldK3,
    editResult,
    adminPageK3,
    updateLevel,
    CreatedSalaryRecord,
    CreatedSalary,
    getSalary,
    uploadBanner,
    getBanners,
    deleteBanner,
    roiManage,
    RoiCreatePage,
    RoiSetting,
    getRoiLevelInfo,
    updateRoiLevel,
    addUser,
    AddNewUser,
    getSalarySetting,
    updateSalarySetting,
    getSalaryRecord,
    salaryRecordPage,
    salaryRecordHistoryPage,
    SalaryAmountDistributed,
    SalaryStatus,
    getSalaryRecordHistory,
    rechargeCrptoPage,
    withdrawCrptoPage,
    roiHistoryRecodes,
    CreatedManualSalary,
    ManualSalaryCreatePage,
    getManualSalaryRecords,
    listRoiPackage,
    getBannersHome,
    paymentpage,
    AdminToUserLogin,
    rankLevelUpdate,
    getRankLevelInfo,
    RankLevelPage,
    addNotification,
    createNoticePage,
    creatInviteBonusPage,
    addInvitationBonus,
    gameIssueDuyet,
    fetchGameProblam,
    gameIssuePage,
    UpdatePayment,
    reachargeDetails,
    gameToggelStatus,
    adminGameActivity,
    bonusPage,
    bonus,
    rechargeBonusPage,
    attendanceBonusPage,
    betCommissionPage,
    dailySalaryBetting,
    reffralBonus,
    levelIncomeBonus,
    BetCommission,
    updatePositionSubAdmin,
    dashboardView
}