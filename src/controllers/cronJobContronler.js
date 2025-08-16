import connection from "../config/connectDB.js";
import winGoController from "./winGoController.js";
import k5Controller from "./k5Controller.js";
import userController from './userController.js';
import k3Controller from "./k3Controller.js";
import trxController from "./trxController.js";
import RoiController from "./RoiController.js";
import cron from 'node-cron';
import adminController from "./adminController.js";
const date = new Date(); 
const cronJobGame1p = (io) => {
    cron.schedule('*/30 * * * * *', async () => {
        // console.log(date);
        await winGoController.addWinGo(1);
        // await winGoController.WalletResult(1);
        console.log("this is sagar")
        await winGoController.handlingWinGo1P(1);
        const [winGo1] = await connection.execute('SELECT * FROM `wingo` WHERE `game` = "wingo" ORDER BY `id` DESC LIMIT 2', []);
        const data = winGo1; // Cầu mới chưa có kết quả
        io.emit('data-server', { data: data });
    
        // await k5Controller.add5D(1);
        // await k5Controller.handling5D(1);
        // const [k5D] = await connection.execute('SELECT * FROM 5d WHERE `game` = 1 ORDER BY `id` DESC LIMIT 2', []);
        // const data2 = k5D; // Cầu mới chưa có kết quả
        // io.emit('data-server-5d', { data: data2, 'game': 1 });
    
        // await k3Controller.addK3(1);
        // await k3Controller.handlingK3(1);
        // const [k3] = await connection.execute('SELECT * FROM k3 WHERE `game` = 1 ORDER BY `id` DESC LIMIT 2', []);
        // const data3 = k3; // Cầu mới chưa có kết quả
        // io.emit('data-server-k3', { data: data3, 'game': '1' });
    
        // await trxController.addTrx(1);
        // await trxController.handlingTrx1P(1);
        // const [trx1] = await connection.execute('SELECT * FROM `trx` WHERE `game` = "trx1" ORDER BY `id` DESC LIMIT 2', []);
        // const data4 = trx1; // Cầu mới chưa có kết quả
        // io.emit('data-server-trx', { data: data4, 'game': '1' });
    });
    
    cron.schedule('*/1 * * * *', async() => {
        // console.log(date);
        await winGoController.addWinGo(3);
        await winGoController.handlingWinGo1P(3);
        const [winGo1] = await connection.execute('SELECT * FROM `wingo` WHERE `game` = "wingo3" ORDER BY `id` DESC LIMIT 2 ', []);
        const data = winGo1; // Cầu mới chưa có kết quả
        io.emit('data-server', { data: data });

        await k5Controller.add5D(1);
        await k5Controller.handling5D(1);
        const [k5D] = await connection.execute('SELECT * FROM 5d WHERE `game` = 1 ORDER BY `id` DESC LIMIT 2 ', []);
        const data2 = k5D; // Cầu mới chưa có kết quả
        io.emit('data-server-5d', { data: data2, 'game': 1 });

        await k3Controller.addK3(1);
        await k3Controller.handlingK3(1);
        const [k3] = await connection.execute('SELECT * FROM k3 WHERE `game` = 1 ORDER BY `id` DESC LIMIT 2 ', []);
        const data3 = k3; // Cầu mới chưa có kết quả
        io.emit('data-server-k3', { data: data3, 'game': '1' });

        await trxController.addTrx(1);
        await trxController.handlingTrx1P(1);
        const [trx1] = await connection.execute('SELECT * FROM `trx` WHERE `game` = "trx1" ORDER BY `id` DESC LIMIT 2 ', []);
        const data4 = trx1; // Cầu mới chưa có kết quả
        io.emit('data-server-trx', { data: data4, 'game': '1' });
        
    });
    cron.schedule('*/3 * * * *', async() => {
        await winGoController.addWinGo(5);
        // await winGoController.WalletResult(5);
        await winGoController.handlingWinGo1P(5);
        const [winGo1] = await connection.execute('SELECT * FROM `wingo` WHERE `game` = "wingo5" ORDER BY `id` DESC LIMIT 2 ', []);
        const data = winGo1; // Cầu mới chưa có kết quả
        io.emit('data-server', { data: data });

        await k5Controller.add5D(3);
        await k5Controller.handling5D(3);
        const [k5D] = await connection.execute('SELECT * FROM 5d WHERE `game` = 3 ORDER BY `id` DESC LIMIT 2 ', []);
        const data2 = k5D; // Cầu mới chưa có kết quả
        io.emit('data-server-5d', { data: data2, 'game': '3' });

        await k3Controller.addK3(3);
        await k3Controller.handlingK3(3);
        const [k3] = await connection.execute('SELECT * FROM k3 WHERE `game` = 3 ORDER BY `id` DESC LIMIT 2 ', []);
        const data3 = k3; // Cầu mới chưa có kết quả
        io.emit('data-server-k3', { data: data3, 'game': '3' });

        await trxController.addTrx(3);
        await trxController.handlingTrx1P(3);
        const [trx1] = await connection.execute('SELECT * FROM `trx` WHERE `game` = "trx3" ORDER BY `id` DESC LIMIT 2 ', []);
        const data4 = trx1; // Cầu mới chưa có kết quả
        io.emit('data-server-trx', { data: data4 , 'game': '2' });
    });
    cron.schedule('*/5 * * * *', async() => {
        await winGoController.addWinGo(10);
        // await winGoController.WalletResult(10);
        await winGoController.handlingWinGo1P(10);
        const [winGo1] = await connection.execute('SELECT * FROM `wingo` WHERE `game` = "wingo10" ORDER BY `id` DESC LIMIT 2 ', []);
        const data = winGo1; // Cầu mới chưa có kết quả
        io.emit('data-server', { data: data });

        await k5Controller.add5D(5);
        await k5Controller.handling5D(5);
        const [k5D] = await connection.execute('SELECT * FROM 5d WHERE `game` = 5 ORDER BY `id` DESC LIMIT 2 ', []);
        const data2 = k5D; // Cầu mới chưa có kết quả
        io.emit('data-server-5d', { data: data2, 'game': '5' });

        await k3Controller.addK3(5);
        await k3Controller.handlingK3(5);
        const [k3] = await connection.execute('SELECT * FROM k3 WHERE `game` = 5 ORDER BY `id` DESC LIMIT 2 ', []);
        const data3 = k3; // Cầu mới chưa có kết quả
        io.emit('data-server-k3', { data: data3, 'game': '5' });

        await trxController.addTrx(5);
        await trxController.handlingTrx1P(5);
        const [trx1] = await connection.execute('SELECT * FROM `trx` WHERE `game` = "trx5" ORDER BY `id` DESC LIMIT 2 ', []);
        const data4 = trx1; // Cầu mới chưa có kết quả
        io.emit('data-server-trx', { data: data4 , 'game': '3' });
    });
    cron.schedule('*/10 * * * *', async() => {
        // await winGoController.addWinGo(10);
        // await winGoController.handlingWinGo1P(10);
        // const [winGo1] = await connection.execute('SELECT * FROM `wingo` WHERE `game` = "wingo10" ORDER BY `id` DESC LIMIT 2 ', []);
        // const data = winGo1; // Cầu mới chưa có kết quả
        // io.emit('data-server', { data: data });

        
        await k5Controller.add5D(10);
        
        await k5Controller.handling5D(10);
        const [k5D] = await connection.execute('SELECT * FROM 5d WHERE `game` = 10 ORDER BY `id` DESC LIMIT 2 ', []);
        const data2 = k5D; // Cầu mới chưa có kết quả
        io.emit('data-server-5d', { data: data2, 'game': '10' });

        await k3Controller.addK3(10);
        await k3Controller.handlingK3(10);
        const [k3] = await connection.execute('SELECT * FROM k3 WHERE `game` = 10 ORDER BY `id` DESC LIMIT 2 ', []);
        const data3 = k3; // Cầu mới chưa có kết quả
        io.emit('data-server-k3', { data: data3, 'game': '10' });

        await trxController.addTrx(10);
        await trxController.handlingTrx1P(10);
        const [trx1] = await connection.execute('SELECT * FROM `trx` WHERE `game` = "trx10" ORDER BY `id` DESC LIMIT 2 ', []);
        const data4 = trx1; // Cầu mới chưa có kết quả
        io.emit('data-server-trx', { data: data4 , 'game': '4' });
    });

    cron.schedule('* * 0 * * *', async() => {
        await connection.execute('UPDATE users SET roses_today = ?', [0]);
        await connection.execute('UPDATE point_list SET money = ?', [0]);
    });
    cron.schedule('*/1 * * * *', async () => {
        try {
            // Fetch newly added users from the 'users' table
            const [newUsers] = await connection.execute('SELECT id, phone FROM users ');
    
            // Iterate over each new user
            for (const user of newUsers) {
                const { id, phone } = user;
                
                // Check if the user already exists in the 'withdrawl_money' table
                const [existingUser] = await connection.execute('SELECT id FROM withdrawl_money WHERE phone = ?', [phone]);
                
                // If the user doesn't exist in the 'withdrawl_money' table, insert them
                if (existingUser.length === 0) {
                    await connection.execute('INSERT INTO withdrawl_money (id, phone) VALUES (?, ?)', [id, phone]);
                    // console.log(`New user (${phone}) added to the withdraw table successfully`);
                } else {
                    // console.error(`User (${phone}) already exists in the withdraw table`);
                }
            }
        } catch (error) {
            console.error('Error adding new users to the withdraw table:', error);
        }
    });
   function isWeekend() {
        const today = new Date().getDay(); 
        return today === 0 || today === 6; // 0: Sunday, 6: Saturday
      }
      
      // Schedule the cron job for every day at midnight
      cron.schedule('0 0 * * *', async () => {
        // cron.schedule('*/1 * * * *', async () => {
        if (!isWeekend()) {
          // Run only if it's not Saturday or Sunday
          await RoiController.checkPlanValidity();
        //   console.log("Job executed.");
        } else {
          console.log("Job skipped as it's the weekend.");
        }
    
    }); 
    
    cron.schedule('0 23 * * *', async () => {
        // cron.schedule('*/1 * * * *', async () => {
        await userController.rebateBonus();
      }); 
      
      cron.schedule('0 23 * * *', async () => {
        // cron.schedule('*/3 * * * *', async () => {
        await adminController.SalaryAmountDistributed();
      });  
  
}

export default {
    cronJobGame1p
};