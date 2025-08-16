import connection from "../config/connectDB.js";
import jwt from 'jsonwebtoken'
import md5 from "md5";
import e from "express";
import dotenv from "dotenv";
dotenv.config();


const winGoPage = async (req, res) => {
    return res.render("bet/wingo/win.ejs");
}

const winGoPage3 = async (req, res) => {
    return res.render("bet/wingo/win3.ejs");
}

const winGoPage5 = async (req, res) => {
    return res.render("bet/wingo/win5.ejs");
}

const winGoPage10 = async (req, res) => {
    return res.render("bet/wingo/win10.ejs");
}


const isNumber = (params) => {
    let pattern = /^[0-9]*\d$/;
    return pattern.test(params);
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

const betWinGo = async (req, res) => {
    let { typeid, join, x, money } = req.body;
    let auth = req.cookies.auth;
    
    console.log("this 1 : " + auth, typeid, join, x, money)

    if (typeid != 1 && typeid != 3 && typeid != 5 && typeid != 10) {
        return res.status(200).json({
            message: 'Error!',
            status: true
        });
    }


    let gameJoin = '';
    if (typeid == 1) gameJoin = 'wingo';
    if (typeid == 3) gameJoin = 'wingo3';
    if (typeid == 5) gameJoin = 'wingo5';
    if (typeid == 10) gameJoin = 'wingo10';
    console.log("this 2 : " + gameJoin)
    const [winGoNow] = await connection.query(`SELECT period FROM wingo WHERE status = 0 AND game = '${gameJoin}' ORDER BY id DESC LIMIT 1 `);
    const [user] = await connection.query('SELECT `phone`, `code`, `invite`, `level`, `money`, `winning` FROM users WHERE token = ? AND veri = 1  LIMIT 1 ', [auth]);
    console.log("this 3 : " + winGoNow[0] +" user : " + user[0])
    if (!winGoNow[0] || !user[0] || !isNumber(x) || !isNumber(money)) {
        return res.status(200).json({
            message: 'Error!',
            status: true
        });
    }

    let userInfo = user[0];
    
     const [recharge] = await connection.query(
        "SELECT * FROM recharge WHERE phone = ? AND status = 1 ",
        [userInfo.phone]
     );

     if (recharge.length === 0) {
      return res.status(200).json({
       message: "Recharge required: Please add funds to your account before placing a bet.",
        status: false,
      });
     }
    
    let period = winGoNow[0].period;
    let fee = (x * money) * 0.02;
    let total = (x * money) - fee;
    let timeNow = Date.now();
    // let check = userInfo.money - total;
    let check = Number(userInfo.winning) - total;

    let date = new Date();
    let years = formateT(date.getFullYear());
    let months = formateT(date.getMonth() + 1);
    let days = formateT(date.getDate());
    let id_product = years + months + days + Math.floor(Math.random() * 1000000000000000);

    let formatTime = timerJoin();

    let color = '';
    if (join == 'l') {
        color = 'big';
    } else if (join == 'n') {
        color = 'small';
    } else if (join == 't') {
        color = 'violet';
    } else if (join == 'd') {
        color = 'red';
    } else if (join == 'x') {
        color = 'green';
    } else if (join == '0') {
        color = 'red-violet';
    } else if (join == '5') {
        color = 'green-violet';
    } else if (join % 2 == 0) {
        color = 'red';
    } else if (join % 2 != 0) {
        color = 'green';
    }

    let checkJoin = '';
    console.log("this 4 : " + color)
    

    if (!isNumber(join) && join == 'l' || join == 'n') {
        checkJoin = `
        <div data-v-a9660e98="" class="van-image" style="width: 30px; height: 30px;">
            <img src="/images/${(join == 'n') ? 'small' : 'big'}.png" class="van-image__img">
        </div>
        `
    } else {
        checkJoin =
            `
        <span data-v-a9660e98="">${(isNumber(join)) ? join : ''}</span>
        `
    }


    let result = `
    <div data-v-a9660e98="" issuenumber="${period}" addtime="${formatTime}" rowid="1" class="hb">
        <div data-v-a9660e98="" class="item c-row">
            <div data-v-a9660e98="" class="result">
                <div data-v-a9660e98="" class="select select-${(color)}">
                    ${checkJoin}
                </div>
            </div>
            <div data-v-a9660e98="" class="c-row c-row-between info">
                <div data-v-a9660e98="">
                    <div data-v-a9660e98="" class="issueName">
                        ${period}
                    </div>
                    <div data-v-a9660e98="" class="tiem">${formatTime}</div>
                </div>
            </div>
        </div>
        
    </div>
    `;

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
    let checkTime = timerJoin(date.getTime());
    const [users_details] = await connection.query('SELECT * FROM users WHERE token = ? AND veri = 1  LIMIT 1 ', [auth]);
      const userDetails = users_details[0];

    if (check >= 0) {
        const sql = `INSERT INTO minutes_1 SET 
        id_product = ?,
        phone = ?,
        code = ?,
        invite = ?,
        stage = ?,
        level = ?,
        money = ?,
        amount = ?,
        fee = ?,
        \`get\` = ?,
        game = ?,
        bet = ?,
        status = ?,
        today = ?,
        time = ?`;
        await connection.execute(sql, [id_product, userDetails.phone, userDetails.code, userDetails.invite, period, userDetails.level, total, (x * money), fee, 0, gameJoin, join, 0, checkTime, timeNow]);
        await connection.execute(
            `UPDATE users 
             SET 
               winning = winning - ?, 
               money = GREATEST(money - ?, 0)  
             WHERE token = ?`,
            [money * x, money * x, auth]
          );
        //     const [userBalance] = await connection.execute('SELECT `money`, `winning` FROM `users` WHERE `token` = ?', [auth]);
        //     const currentMoney = userBalance[0].money;
        //     const currentWinning = userBalance[0].winning;
        //     const deductionAmount = money * x;

        // if (currentMoney >= deductionAmount) {
        //     await connection.execute('UPDATE `users` SET `money` = `money` - ? WHERE `token` = ?', [deductionAmount, auth]);
        // } else {
        //     const remainingAmount = deductionAmount - currentMoney;
        //     await connection.execute(
        //         'UPDATE `users` SET `money` = 0, `winning` = `winning` - ? WHERE `token` = ?',
        //         [remainingAmount, auth]
        //     );
        // }
      

            let currentInviteCode = userDetails.invite;

            const getUserInfo = async (userId) => {
                const [userInfo] = await connection.query('SELECT * FROM users WHERE code = ?', [userId]);
                if (!userInfo.length) {
                    console.log(`No user found with code ${userId}`);
                    return null;
                }
                console.log("User Info for invite code:", userInfo[0]);
                return userInfo[0];
            };

            // Fetch available levels
            let levelLenght = 0;
            const getLevels = async () => {
                const [levels] = await connection.query('SELECT * FROM level WHERE status = 1');
                if (!levels.length) {
                    console.log('No levels found');
                    return [];
                }
                levelLenght = levels.length; 
                console.log("Level Info: ", levels);  
                return levels;
            };

            const levelsDetail = await getLevels();
            if (!levelsDetail.length) {
                return res.status(400).json({ message: 'No active levels found', status: false });
            }

            const calculateBonus = (money, level) => {
                const levelInfo = levelsDetail.find(l => l.level === level);
                if (!levelInfo) {
                    console.log(`Level ${level} not found`);
                    return 0; 
                }
                const bonusPercentage = parseFloat(levelInfo.f2);
                if (isNaN(bonusPercentage)) {
                    console.log('Invalid bonus percentage for level:', level);
                    return 0;
                }
                const bonus = money * (bonusPercentage / 100);
                console.log(`Bonus for level ${level}: ${bonus}`);
                return bonus;
            };

            const updateUserMoney = async (userId, bonus, level) => {
                try {
                    if (level === 1) {

                        console.log("this is level = 1")
                        await connection.query('UPDATE users SET winning = winning + ?, roses_f = roses_f + ?, roses_today = roses_today + ?, roses_f1 = roses_f1 + ? WHERE phone = ?', [bonus, bonus, bonus, bonus, userId]);
                        let trans =
            "INSERT INTO betting_commission SET phone = ?, amount = ?,sender_phone=?,type=?, status = ?";
          await connection.query(trans, [
            userId,
            bonus,
            userDetails.phone,
            "bet win",
            1,
          ]);

                    } else {

                        console.log("this is level = other")

                        await connection.query('UPDATE users SET winning = winning + ?, roses_f = roses_f + ?, roses_today = roses_today + ? WHERE phone = ?', [bonus, bonus, bonus, userId]);
                       let trans =
            "INSERT INTO betting_commission SET phone = ?, amount = ?,sender_phone=?,type=?, status = ?";
          await connection.query(trans, [
            userId,
            bonus,
            userDetails.phone,
            "bet win",
            1,
          ]);
                    }
                
                } catch (error) {
                    console.log('Error updating user money:', error);
                }
            };


            for (let level = 1; level <= levelLenght; level++) {
                if (!currentInviteCode) {
                    console.log('No invite code, stopping loop');
                    break;  
                }

                const nextUser = await getUserInfo(currentInviteCode);
                if (!nextUser) {
                    console.log('No user found for the current invite code, stopping loop');
                    break;  
                }

                const levelBonus = calculateBonus((x * money), level);

                await updateUserMoney(nextUser.phone, levelBonus, level);

                currentInviteCode = nextUser.invite;
            }

            const [Balance] = await connection.execute('SELECT `money`, `winning` FROM `users` WHERE `token` = ?', [auth]);

            const userTotalMoney = await Number(Balance[0].winning);
            console.log(userTotalMoney);

            return res.status(200).json({
                message: 'Successful bet',
                status: true,
                data: result,
                money: userTotalMoney,
            });

    } else {
        return res.status(200).json({
            message: 'The amount is not enough',
            status: false
        });
    }
}

const listOrderOld = async (req, res) => {
    let { typeid, pageno, pageto } = req.body;

    if (typeid != 1 && typeid != 3 && typeid != 5 && typeid != 10) {
        return res.status(200).json({
            message: 'Error!',
            status: true
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
    let auth = req.cookies.auth;
    const [user] = await connection.query('SELECT `phone`, `code`, `invite`, `level`, `money` FROM users WHERE token = ? AND veri = 1  LIMIT 1 ', [auth]);

    let game = '';
    if (typeid == 1) game = 'wingo';
    if (typeid == 3) game = 'wingo3';
    if (typeid == 5) game = 'wingo5';
    if (typeid == 10) game = 'wingo10';

    const [wingo] = await connection.query(`SELECT * FROM wingo WHERE status != 0 AND game = '${game}' ORDER BY id DESC LIMIT ${pageno}, ${pageto} `);
    const [wingoAll] = await connection.query(`SELECT * FROM wingo WHERE status != 0 AND game = '${game}' `);
    const [period] = await connection.query(`SELECT period FROM wingo WHERE status = 0 AND game = '${game}' ORDER BY id DESC LIMIT 1 `);
    if (!wingo[0]) {
        return res.status(200).json({
            code: 0,
            msg: "No more data",
            data: {
                gameslist: [],
            },
            status: false
        });
    }
    if (!pageno || !pageto || !user[0] || !wingo[0] || !period[0]) {
        return res.status(200).json({
            message: 'Error!',
            status: true
        });
    }
    let page = Math.ceil(wingoAll.length / 10);
    return res.status(200).json({
        code: 0,
        msg: "Receive success",
        data: {
            gameslist: wingo,
        },
        period: period[0].period,
        page: page,
        status: true
    });
}

const GetMyEmerdList = async (req, res) => {
    let { typeid, pageno, pageto } = req.body;

    // if (!pageno || !pageto) {
    //     pageno = 0;
    //     pageto = 10;
    // }

    if (typeid != 1 && typeid != 3 && typeid != 5 && typeid != 10) {
        return res.status(200).json({
            message: 'Error!',
            status: true
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
    let auth = req.cookies.auth;

    let game = '';
    if (typeid == 1) game = 'wingo';
    if (typeid == 3) game = 'wingo3';
    if (typeid == 5) game = 'wingo5';
    if (typeid == 10) game = 'wingo10';

    const [user] = await connection.query('SELECT `phone`, `code`, `invite`, `level`, `money` FROM users WHERE token = ? AND veri = 1 LIMIT 1 ', [auth]);
    const [minutes_1] = await connection.query(`SELECT * FROM minutes_1 WHERE phone = ? AND game = '${game}' ORDER BY id DESC LIMIT ${Number(pageno) + ',' + Number(pageto)}`, [user[0].phone]);
    const [minutes_1All] = await connection.query(`SELECT * FROM minutes_1 WHERE phone = ? AND game = '${game}' ORDER BY id DESC `, [user[0].phone]);

    if (!minutes_1[0]) {
        return res.status(200).json({
            code: 0,
            msg: "No more data",
            data: {
                gameslist: [],
            },
            status: false
        });
    }
    if (!pageno || !pageto || !user[0] || !minutes_1[0]) {
        return res.status(200).json({
            message: 'Error!',
            status: true
        });
    }
    let page = Math.ceil(minutes_1All.length / 10);

    let datas = minutes_1.map((data) => {
        let { id, phone, code, invite, level, game, ...others } = data;
        return others;
    });

    return res.status(200).json({
        code: 0,
        msg: "Receive success",
        data: {
            gameslist: datas,
        },
        page: page,
        status: true
    });
}

const addWinGo = async (game) => {
    console.log("477")
    try {
        const gameTypes = {
            1: 'wingo',
            3: 'wingo3',
            5: 'wingo5',
            10: 'wingo10'
        };
        const join = gameTypes[game];
        if (!join) throw new Error("Invalid game type");

        const [winGoNow] = await connection.query(`SELECT period FROM wingo WHERE status = 0 AND game = ? ORDER BY id DESC LIMIT 1`, [join]);
        const [setting] = await connection.query('SELECT * FROM admin');
        if (!winGoNow.length || !setting.length) throw new Error("Required data not found");

        let period = winGoNow[0].period;
        let amount = Math.floor(Math.random() * 10);
        const [minPlayers] = await connection.query(`SELECT * FROM minutes_1 WHERE status = 0 AND game = ?`, [join]);

        if (minPlayers.length >= 2) {
            const betColumns = [
                { name: 'red_0', bets: ['0', 't', 'd', 'n'] },
                { name: 'red_2', bets: ['2', 'd', 'n'] },
                { name: 'red_4', bets: ['4', 'd', 'n'] },
                { name: 'green_1', bets: ['1', 'x', 'n'] },
                { name: 'green_3', bets: ['3', 'x', 'n'] },
                { name: 'green_5', bets: ['5', 'x', 't', 'l'] },
                { name: 'green_7', bets: ['7', 'x', 'l'] },
                { name: 'green_9', bets: ['9', 'x', 'l'] },
                { name: 'red_6', bets: ['6', 'd', 'l'] },
                { name: 'red_8', bets: ['8', 'd', 'l'] }
            ];

            const totalMoneyPromises = betColumns.map(async column => {
                const [result] = await connection.query(`
                    SELECT SUM(money) AS total_money
                    FROM minutes_1
                    WHERE game = ? AND status = 0 AND bet IN (${column.bets.map(() => '?').join(',')})
                `, [join, ...column.bets]);
                return { name: column.name, total_money: result[0].total_money ? parseInt(result[0].total_money) : 0 };
            });

            const categories = await Promise.all(totalMoneyPromises);
            const smallestCategory = categories.reduce((smallest, category) =>
                (smallest === null || category.total_money < smallest.total_money) ? category : smallest, null);

            const colorBets = {
                red_6: [6],
                red_8: [8],
                red_2: [2],
                red_4: [4],
                green_3: [3],
                green_7: [7],
                green_9: [9],
                green_1: [1],
                green_5: [5],
                red_0: [0]
            };

            const betsForCategory = colorBets[smallestCategory.name] || [];
            const availableBets = betsForCategory.filter(bet =>
                !categories.find(category => category.name === smallestCategory.name && category.total_money < smallestCategory.total_money)
            );
            amount = availableBets.length > 0 ? availableBets[0] : Math.min(...betsForCategory);
        } else if (minPlayers.length === 1 && parseFloat(minPlayers[0].money) >= 20) {
            const betColumns = [
                { name: 'red_small', bets: ['0', '2', '4', 'd', 'n'] },
                { name: 'red_big', bets: ['6', '8', 'd', 'l'] },
                { name: 'green_big', bets: ['5', '7', '9', 'x', 'l'] },
                { name: 'green_small', bets: ['1', '3', 'x', 'n'] },
                { name: 'violet_small', bets: ['0', 't', 'n'] },
                { name: 'violet_big', bets: ['5', 't', 'l'] }
            ];

            const categories = await Promise.all(betColumns.map(async column => {
                const [result] = await connection.query(`
                    SELECT SUM(money) AS total_money
                    FROM minutes_1
                    WHERE game = ? AND status = 0 AND bet IN (${column.bets.map(() => '?').join(',')})
                `, [join, ...column.bets]);
                return { name: column.name, total_money: parseInt(result[0]?.total_money) || 0 };
            }));

            const colorBets = {
                red_big: [6, 8],
                red_small: [2, 4],
                green_big: [7, 9],
                green_small: [1, 3],
                violet_big: [5],
                violet_small: [0]
            };

            const smallestCategory = categories.reduce((smallest, category) =>
                (!smallest || category.total_money < smallest.total_money) ? category : smallest);

            const betsForCategory = colorBets[smallestCategory.name] || [];
            const availableBets = betsForCategory.filter(bet =>
                !categories.find(category => category.name === smallestCategory.name && category.total_money < smallestCategory.total_money)
            );

            amount = availableBets.length > 0 ? availableBets[0] : Math.min(...betsForCategory);
        }

        let timeNow = Date.now();
        let nextResult = setting[0][`wingo${game}`];
        let newArr = '';

        if (nextResult === '-1') {
            await connection.execute(`UPDATE wingo SET amount = ?, status = ? WHERE period = ? AND game = ?`, [amount, 1, period, join]);
            newArr = '-1';
        } else {
            let arr = nextResult.split('|');
            newArr = arr.slice(1).join('|') || '-1';
            await connection.execute(`UPDATE wingo SET amount = ?, status = ? WHERE period = ? AND game = ?`, [arr[0], 1, period, join]);
        }

        await connection.execute(`INSERT INTO wingo (period, amount, game, status, time) VALUES (?, ?, ?, ?, ?)`, [Number(period) + 1, 0, join, 0, timeNow]);
        await connection.execute(`UPDATE admin SET wingo${game} = ?`, [newArr]);
    } catch (error) {
        console.error("Error in addWinGo function:", error.message);
    }
}


const WalletResult = async (game) => {
 
        console.error("Error in WalletResult function:", error);
   
};



const handlingWinGo1P = async (typeid) => {
    let game = '';
    if (typeid == 1) game = 'wingo';
    if (typeid == 3) game = 'wingo3';
    if (typeid == 5) game = 'wingo5';
    if (typeid == 10) game = 'wingo10';
    const [winGoNow] = await connection.query(`SELECT * FROM wingo WHERE status != 0 AND game = '${game}' ORDER BY id DESC LIMIT 1 `);
    await connection.execute(`UPDATE minutes_1 SET result = ? WHERE status = 0 AND game = '${game}'`, [winGoNow[0].amount]);
    let result = Number(winGoNow[0].amount);
    switch (result) {
        case 0:
            await connection.execute(`UPDATE minutes_1 SET status = 2 WHERE status = 0 AND game = "${game}" AND bet != "l" AND bet != "n" AND bet != "d" AND bet != "0" AND bet != "t" `, []);
            break;
        case 1:
            await connection.execute(`UPDATE minutes_1 SET status = 2 WHERE status = 0 AND game = "${game}" AND bet != "l" AND bet != "n" AND bet != "x" AND bet != "1" `, []);
            break;
        case 2:
            await connection.execute(`UPDATE minutes_1 SET status = 2 WHERE status = 0 AND game = "${game}" AND bet != "l" AND bet != "n" AND bet != "d" AND bet != "2" `, []);
            break;
        case 3:
            await connection.execute(`UPDATE minutes_1 SET status = 2 WHERE status = 0 AND game = "${game}" AND bet != "l" AND bet != "n" AND bet != "x" AND bet != "3" `, []);
            break;
        case 4:
            await connection.execute(`UPDATE minutes_1 SET status = 2 WHERE status = 0 AND game = "${game}" AND bet != "l" AND bet != "n" AND bet != "d" AND bet != "4" `, []);
            break;
        case 5:
            await connection.execute(`UPDATE minutes_1 SET status = 2 WHERE status = 0 AND game = "${game}" AND bet != "l" AND bet != "n" AND bet != "x" AND bet != "5" AND bet != "t" `, []);
            break;
        case 6:
            await connection.execute(`UPDATE minutes_1 SET status = 2 WHERE status = 0 AND game = "${game}" AND bet != "l" AND bet != "n" AND bet != "d" AND bet != "6" `, []);
            break;
        case 7:
            await connection.execute(`UPDATE minutes_1 SET status = 2 WHERE status = 0 AND game = "${game}" AND bet != "l" AND bet != "n" AND bet != "x" AND bet != "7" `, []);
            break;
        case 8:
            await connection.execute(`UPDATE minutes_1 SET status = 2 WHERE status = 0 AND game = "${game}" AND bet != "l" AND bet != "n" AND bet != "d" AND bet != "8" `, []);
            break;
        case 9:
            await connection.execute(`UPDATE minutes_1 SET status = 2 WHERE status = 0 AND game = "${game}" AND bet != "l" AND bet != "n" AND bet != "x" AND bet != "9" `, []);
            break;
        default:
            break;
    }

    if (result < 5) {
        await connection.execute(`UPDATE minutes_1 SET status = 2 WHERE status = 0 AND game = "${game}" AND bet = "l" `, []);
    } else {
        await connection.execute(`UPDATE minutes_1 SET status = 2 WHERE status = 0 AND game = "${game}" AND bet = "n" `, []);
    }

    // lấy ra danh sách đặt cược chưa xử lý
    const [order] = await connection.execute(`SELECT * FROM minutes_1 WHERE status = 0 AND game = '${game}' `);
    for (let i = 0; i < order.length; i++) {
        let orders = order[i];
        let result = orders.result;
        let bet = orders.bet;
        let total = orders.money;
        let id = orders.id;
        let phone = orders.phone;
        var nhan_duoc = 0;
        // x - green
        // t - Violet
        // d - red 

        // Sirf 1-4 aur 6-9 tk hi *9 aana chahiye
        // Aur 0 aur 5 pe *4.5
        // Aur red aur green pe *2
        // 1,2,3,4,6,7,8,9


        if (bet == 'l' || bet == 'n') {
            nhan_duoc = total * 2;
        } else {
            if (result == 0 || result == 5) {
                if (bet == 'd' || bet == 'x') {
                    nhan_duoc = total * 1.5;
                } else if (bet == 't') {
                    nhan_duoc = total * 4.5;
                } else if (bet == "0" || bet == "5") {
                    nhan_duoc = total * 4.5;
                }
            } else {
                if (result == 1 && bet == "1") {
                    nhan_duoc = total * 9;
                } else {
                    if (result == 1 && bet == 'x') {
                        nhan_duoc = total * 2;
                    }
                }
                if (result == 2 && bet == "2") {
                    nhan_duoc = total * 9;
                } else {
                    if (result == 2 && bet == 'd') {
                        nhan_duoc = total * 2;
                    }
                }
                if (result == 3 && bet == "3") {
                    nhan_duoc = total * 9;
                } else {
                    if (result == 3 && bet == 'x') {
                        nhan_duoc = total * 2;
                    }
                }
                if (result == 4 && bet == "4") {
                    nhan_duoc = total * 9;
                } else {
                    if (result == 4 && bet == 'd') {
                        nhan_duoc = total * 2;
                    }
                }
                if (result == 6 && bet == "6") {
                    nhan_duoc = total * 9;
                } else {
                    if (result == 6 && bet == 'd') {
                        nhan_duoc = total * 2;
                    }
                }
                if (result == 7 && bet == "7") {
                    nhan_duoc = total * 9;
                } else {
                    if (result == 7 && bet == 'x') {
                        nhan_duoc = total * 2;
                    }
                }
                if (result == 8 && bet == "8") {
                    nhan_duoc = total * 9;
                } else {
                    if (result == 8 && bet == 'd') {
                        nhan_duoc = total * 2;
                    }
                }
                if (result == 9 && bet == "9") {
                    nhan_duoc = total * 9;
                } else {
                    if (result == 9 && bet == 'x') {
                        nhan_duoc = total * 2;
                    }
                }
            }
        }
        const [users] = await connection.execute('SELECT `money`, `winning` FROM `users` WHERE `phone` = ?', [phone]);
        let totals = parseFloat(users[0].winning) + parseFloat(nhan_duoc);
        await connection.execute('UPDATE `minutes_1` SET `get` = ?, `status` = 1 WHERE `id` = ? ', [parseFloat(nhan_duoc), id]);
        await connection.execute('UPDATE `withdrawl_money` SET `amount` = `amount` + ? WHERE `phone` = ? ', [parseFloat(nhan_duoc), phone]);
        const sql = 'UPDATE `users` SET `winning` = ? WHERE `phone` = ? ';
        await connection.execute(sql, [totals, phone]);
    }
}

export default {
    winGoPage,
    betWinGo,
    listOrderOld,
    GetMyEmerdList,
    handlingWinGo1P,
    addWinGo,
    winGoPage3,
    winGoPage5,
    winGoPage10,
    WalletResult
}