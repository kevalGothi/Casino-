

import connection from "../config/connectDB.js";
import md5 from "md5";
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import dotenv from "dotenv";
dotenv.config();

let timeNow = Date.now();

const RoiPage = async (req, res) => {
  return res.render("home/roiFile.ejs");
}
const UserRoiPage = async (req, res) => {
  return res.render("home/userRoi.ejs");
}
const AiDeshboardPage = async (req, res) => {
  return res.render("home/aideshboard.ejs");
}
const AiLevelDeshboardPage = async (req, res) => {
  return res.render("home/aiLevelDeshboard.ejs");
}

// Set up multer storage

const currentDirectory = process.cwd();
const uploadDir = path.join(currentDirectory, 'src', 'public', 'uploads', 'images');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir); // Specify the destination folder for uploads
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname)); // Set the filename
    }
});

const upload = multer({ storage: storage }).single('image');

const CreateROI = async (req, res) => {
    try {
        upload(req, res, async function (err) {
            if (err instanceof multer.MulterError) {
                console.error('Multer error:', err);
                return res.status(400).json({ message: 'File upload error' });
            } else if (err) {
                console.error('Error uploading files:', err);
                return res.status(500).json({ message: 'Internal server error' });
            }

            let auth = req.cookies.auth;
            const { title, totalprice, validity, dgp, roa, firstbonus } = req.body;
            const file = req.file;

            let timeNow = Date.now();

            if (!auth || !title || !totalprice || !validity || !dgp || !roa || !firstbonus || !file) {
                return res.status(400).json({
                    message: 'Please fill the required fields',
                    status: false,
                    timeStamp: timeNow,
                });
            }

            try {
                const sql = `INSERT INTO roi SET 
                    title = ?,
                    totalprice = ?,
                    validity = ?,
                    dgp = ?,
                    roa = ?,
                    firstbonus = ?,
                    image = ?,
                    status = ?`;
                await connection.execute(sql, [title, totalprice, validity, dgp, roa, firstbonus, file.filename, 1]);

                return res.status(200).json({
                    message: 'Successfully created',
                    status: true,
                    timeStamp: timeNow,
                });
            } catch (error) {
                return res.status(500).json({
                    message: 'ERROR: ' + error,
                    status: false,
                    timeStamp: timeNow,
                });
            }
        });
    } catch (error) {
        return res.status(500).json({
            message: 'ERROR: ' + error,
            status: false,
            timeStamp: timeNow,
        });
    }
};     

  const ROIDetail = async (req, res) =>{
  

    try {
      console.log("this is row : " );
      const [rows] = await connection.query('SELECT * FROM roi where status = 1 ORDER BY id DESC');
       console.log("this is row : " + rows);
       if(!rows || rows.length === 0){
        return res.status(200).json({
            message: 'Failed : something went wrong while user fetching withdraw details',
            status: false
        });
    }
    const data = rows;
    return res.status(200).json({
        message: 'success : withdraw Details fetch success',
        status: true,
        data: data
    });
    } catch (error) {
        return res.status(200).json({
            message: 'Failed : something went wrong while fetching detail',
            status: false,
        });
    }
}

const ROIPlanDetails = async (req, res) =>{
  

  try {
    console.log("this is row : " );
    const [rows] = await connection.query('SELECT * FROM roi ORDER BY id DESC');
     console.log("this is row : " + rows);
     if(!rows || rows.length === 0){
      return res.status(200).json({
          message: 'Failed : something went wrong while user fetching withdraw details',
          status: false
      });
  }
  const data = rows;
  return res.status(200).json({
      message: 'success : withdraw Details fetch success',
      status: true,
      data: data
  });
  } catch (error) {
      return res.status(200).json({
          message: 'Failed : something went wrong while fetching detail',
          status: false,
      });
  }
}

const ROIStatus = async (req, res) => {
   let auth = req.cookies.auth;

    const userId = parseInt(req.params.id); 
    const { status } = req.body;   

    if(!userId || !auth){
        return res.status(202).json({
            message: 'Failed : something went wrong while id fetching',
            status: false,
        })
        
    }
    try {
        const [user] = await connection.query('SELECT * FROM roi WHERE id = ?', [userId]);
        
        if (!user) {
          return res.status(404).json({
            message: 'Failed : ROI not found',
            status: false,
          });
        }
    
        await connection.query('UPDATE roi SET status = ? WHERE id = ?', [status, userId]);
    
        return res.status(200).json({
          message: 'success : ROI updated successfully',
          status: true,
        });
      } catch (error) {
        console.error('Failed : Error updating ROI status:'+ error);
        return res.status(500).json({
          message: 'Server error',
          status: false,
        });
      }
}

const purchaseROI = async (req, res) => {
  let auth = req.cookies.auth;
  let password = req.body.password;
  const userId = parseInt(req.params.id);
  
  console.log("this is info : " + auth, userId, password);
  
  if(!userId || !auth || !password){
    return res.status(202).json({
      message: 'Failed: Something went wrong while fetching ID',
      status: false,
    });
  }


try {
  // Fetch user by token
  const [user] = await connection.query('SELECT * FROM users WHERE token = ? AND status = 1', [auth]);
  if (user.length === 0) {
    return res.status(404).json({
      message: 'Failed: User not found',
      status: false,
    });
  }

  // Verify password
  if (user[0].plain_password !== password) {
    return res.status(404).json({
      message: 'Failed: Password does not match',
      status: false,
    });
  }

  // Fetch plan by ID
  const [plan] = await connection.query('SELECT * FROM roi WHERE id = ?', [userId]);
  if (plan.length === 0) {
    return res.status(404).json({
      message: 'Failed: Plan not found',
      status: false,
    });
  }

  const planInfo = plan[0];
  const money = planInfo.totalprice;
  const percentage = planInfo.firstbonus;
  const FirstBonus = Math.round((money * percentage) / 100);

  console.log("First Bonus: " + FirstBonus);

  const userInfo = user[0];
  let total = userInfo.money;

  if (total < money) {
    return res.status(200).json({
      message: 'Insufficient Balance to purchase the plan.',
      status: false,
    });
  } else {
    const purchaseTime = new Date();

    // Check if plan is already purchased 3 times
    const [alreadyPurchasePlan] = await connection.query('SELECT * FROM purchase_plans WHERE user_id = ? AND plan_id = ? AND status = 1', [userInfo.id, planInfo.id]);
    if (alreadyPurchasePlan.length >= 3) {
      return res.status(400).json({
        message: 'Failed: You can only purchase this plan a maximum of 3 times.',
        status: false,
      });
    }

    // Deduct money from user's account
    await connection.query('UPDATE users SET money = money - ? WHERE id = ?', [money, userInfo.id]);
    const totalMoneyofReturn = planInfo.roa - FirstBonus;

    // Insert into purchase_plans
    let sql = 'INSERT INTO purchase_plans SET user_id = ?, plan_id = ?, amount = ?, plan_name = ?, per_day_income = ?, day = ?, totalreturnamount = ?, status = ?, time = ?';
    await connection.query(sql, [userInfo.id, planInfo.id, planInfo.totalprice, planInfo.title, planInfo.dgp, planInfo.validity, totalMoneyofReturn, planInfo.status, purchaseTime]);

    if (alreadyPurchasePlan.length === 0) {
      // First plan purchase
      await connection.query('UPDATE users SET winning = winning + ?, aiwallet = aiwallet + ? WHERE id = ?', [FirstBonus, FirstBonus, userInfo.id]);

      let sql2 = 'INSERT INTO roi_perday_record SET amount = ?, plan_name = ?, plan_id = ?, user_id = ?, status = 4';
      await connection.query(sql2, [FirstBonus, planInfo.title, planInfo.id, userInfo.id]);
    } 

    // Fetch updated user details
    const [updatedUser] = await connection.query('SELECT `phone`, `id`, `id_user` FROM users WHERE `token` = ?', [auth]);
    if (updatedUser.length === 0) {
      return res.status(202).json({
        message: 'Failed: User not found',
        status: false,
      });
    }

    const extra = Math.round((money * 5) / 100);
    const extraMoney = money + extra;
    let currentInviteCode = userInfo.invite;

    // Fetch inviter's information
    const [memberinfo] = await connection.query('SELECT * FROM users WHERE code = ?', [currentInviteCode]);
    if (memberinfo.length > 0) {
      const inviter = memberinfo[0];
      console.log("this is memberinfo: " + JSON.stringify(inviter));
      const [PlanDetails] = await connection.query('SELECT * FROM purchase_plans WHERE user_id = ?', [inviter.id]);
      if (PlanDetails.length > 0) {
      console.log("this is memberinfo: " + JSON.stringify(PlanDetails));
        await connection.query('UPDATE users SET money = money + ? WHERE phone = ?', [extra, inviter.phone]);
      console.log("this is plan : " + JSON.stringify(PlanDetails));

        let sql3 = 'INSERT INTO roi_perday_record SET amount = ?, plan_name = ?, plan_id = ?, user_id = ?, status = 5';
        await connection.query(sql3, [extra, PlanDetails[0].plan_name, PlanDetails[0].plan_id, inviter.id]);
        
        let transtion = 'INSERT INTO transfer_money SET phone = ?, amount = ?, status = 6 ';
        await connection.query(sql, [memberinfo[0].phone, extra]);
        
      }
    }

    return res.status(200).json({
      message: 'Purchase successful',
      status: true,
      money: userInfo.money - money,
    });
  }
} catch (error) {
  console.error('Failed: Error updating ROI status: ' + error);
  return res.status(500).json({
    message: 'Server error',
    status: false,
  });
}

};

const checkPlanValidity = async (req, res) => {
  try {
    const [purchasedPlans] = await connection.query('SELECT * FROM purchase_plans WHERE status = 1');
    
    if (purchasedPlans.length === 0) {
      return res.status(200).json({
        message: 'Failed: Plans not found',
        status: false,
        timeStamp: new Date(),
      });
    }

    for (let plan of purchasedPlans) {
      const userId = plan.user_id;

      await connection.query('UPDATE purchase_plans SET day = day - ? WHERE id = ?', [1, plan.id]);

      if (plan.day === 1) {
        // Last day logic
        await connection.query('UPDATE purchase_plans SET status = ? WHERE id = ?', [0, plan.id]);
        await connection.query('UPDATE users SET winning = winning + ?, aiwallet = aiwallet + ? WHERE id = ?', [plan.per_day_income, plan.totalreturnamount, userId]);

        let sql = 'INSERT INTO roi_perday_record SET amount = ?, plan_name = ?, plan_id = ?, user_id = ?, status = 2';
        await connection.query(sql, [plan.totalreturnamount, plan.plan_name, plan.plan_id, plan.user_id]);
      } else {
        // Normal day logic
        await connection.query('UPDATE users SET winning = winning + ?, aiwallet = aiwallet + ? WHERE id = ?', [plan.per_day_income, plan.per_day_income, userId]);
        await connection.query('UPDATE purchase_plans SET totalreturnamount = totalreturnamount - ? WHERE id = ?', [plan.per_day_income, plan.id]);

        let sql = 'INSERT INTO roi_perday_record SET amount = ?, plan_name = ?, plan_id = ?, user_id = ?, status = 2';
        await connection.query(sql, [plan.per_day_income, plan.plan_name, plan.plan_id, plan.user_id]);
      }

      await levelBonusDistributed(userId, plan.per_day_income);
    }

  } catch (error) {
    console.error('Failed: Error checking plan validity: ' + error);
  }
};

// levelBonusDistributed function remains the same, ensure correct asynchronous flow and logging.


const levelBonusDistributed = async (id, money) => {
  try {
    // Step 1: Fetch User Information
    const [user] = await connection.query('SELECT * FROM users WHERE id = ? AND status = 1', [id]);
    if (user.length === 0) {
      console.error('Failed: User not found for id', id);
      return;
    }

    let currentInviteCode = user[0].invite;
    console.log("Starting Level Bonus Distribution for User ID:", id);

    // Step 2: Fetch Level Details
    const [levelsDetail] = await connection.query('SELECT * FROM roi_profit WHERE status = 1');
    if (levelsDetail.length === 0) {
      console.error('Failed: No levels found');
      return;
    }

    // Step 3: Loop through Levels
    for (let level = 1; level <= levelsDetail.length; level++) {
      if (!currentInviteCode) break; // Exit if no invite code

      const nextUser = await getUserInfo(currentInviteCode);
      if (!nextUser) break; // Exit if no next user

      const nextUserPlan = await getUserPlan(nextUser.id);
      if (!nextUserPlan) break; // Exit if no active plan

      const plan_id = nextUserPlan.id;
      const planName = nextUserPlan.plan_name;

      const levelBonus = calculateBonus(money, level, levelsDetail);
      console.log(`Level ${level}: Calculated bonus ${levelBonus} for user ${nextUser.id} (Plan ID: ${plan_id})`);

      await updateUserMoney(nextUser.id, levelBonus, level, plan_id, planName);

      currentInviteCode = nextUser.invite;
    }

    console.log("Completed Level Bonus Distribution for User ID:", id);
  } catch (error) {
    console.error('Failed: Error in levelBonusDistributed:', error);
  }
};

// Helper Functions
const getUserInfo = async (inviteCode) => {
  const [userInfo] = await connection.query('SELECT * FROM users WHERE code = ?', [inviteCode]);
  if (userInfo.length === 0) {
    console.log(`No user found with invite code ${inviteCode}`);
    return null;
  }
  console.log("Fetched User Info:", userInfo[0]);
  return userInfo[0];
};

const getUserPlan = async (userId) => {
  const [planInfo] = await connection.query('SELECT * FROM purchase_plans WHERE user_id = ? AND status = 1 ORDER BY time DESC LIMIT 1', [userId]);
  if (planInfo.length === 0) {
    console.log(`No active plan found for user ${userId}`);
    return null;
  }
  console.log("Fetched Plan Info:", planInfo[0]);
  return planInfo[0];
};

const calculateBonus = (money, level, levelsDetail) => {
  const levelInfo = levelsDetail.find(l => l.level === level);
  if (!levelInfo) {
    throw new Error(`Level ${level} not found`);
  }
  const bonusPercentage = parseFloat(levelInfo.profit);
  const bonus = money * (bonusPercentage / 100);
  console.log(`Calculated Bonus for Level ${level}: ${bonus}`);
  return bonus;
};

const updateUserMoney = async (userId, bonus, level, plan_id, plan_name) => {
  console.log(`Updating User Money: UserID=${userId}, Bonus=${bonus}, Level=${level}, PlanID=${plan_id}`);
  await connection.query('UPDATE users SET winning = winning + ? WHERE id = ?', [bonus, userId]);
  await connection.query('UPDATE purchase_plans SET totalreturnamount = totalreturnamount - ? WHERE id = ?', [bonus, plan_id]);
  let sql = 'INSERT INTO roi_perday_record SET amount = ?, plan_name = ?, plan_id = ?, user_id = ?, status = 3, level = ?';
  await connection.query(sql, [bonus, plan_name, plan_id, userId, level]);
};




const userPlans = async (req, res) => {
  let auth = req.cookies.auth;
  // let auth = 7878979700;

  if (!auth) {
    return res.status(202).json({
      message: 'Failed: something went wrong while id fetching',
      status: false,
    });
  }

  const [user] = await connection.query('SELECT `phone`, `id`, `id_user` FROM users WHERE `token` = ?', [auth]);

  if (user.length === 0) {
    return res.status(202).json({
      message: 'Failed: user not found',
      status: false,
    });
  }

  const userInfo = user[0];

  const [plans] = await connection.query('SELECT * FROM purchase_plans WHERE user_id = ? AND status = 1 ORDER BY id DESC', [userInfo.id]);
 
  const [Totalplans] = await connection.query('SELECT * FROM purchase_plans WHERE user_id = ? ORDER BY id DESC', [userInfo.id]);
  if(Totalplans.length === 0) return null;
  const totalLength = Totalplans.length ;

  if (plans.length === 0) {
    return res.status(202).json({
      message: 'Failed: plans not found',
      status: false,
    });
  }

 plans[0].totalPlan = totalLength;
 console.log("User Info before setting totalPlan:", plans[0]);
  return res.status(200).json({
    message: 'Success: plans fetch success',
    status: true,
    data: plans,
  });
};

const userRoiList = async (req, res) => {
  let auth = req.cookies.auth;

  if (!auth) {
    return res.status(202).json({
      message: 'Failed: Something went wrong while fetching ID',
      status: false,
    });
  }

  try {
    const [user] = await connection.query('SELECT `phone`, `id`, `id_user` FROM users WHERE `token` = ?', [auth]);

    if (user.length === 0) {
      return res.status(202).json({
        message: 'Failed: User not found',
        status: false,
      });
    }

    const userInfo = user[0];
    console.log(userInfo);

    const [plans] = await connection.query('SELECT * FROM purchase_plans WHERE user_id = ? AND status = 1', [userInfo.id]);
    let totalAmount = plans.reduce((acc, plan) => acc + parseFloat(plan.amount), 0);

    // Fetch all lists based on `user_id` and different statuses
    const [lists] = await connection.query('SELECT * FROM roi_perday_record WHERE user_id = ? AND status = 1 ORDER BY id DESC', [userInfo.id]);
    const [lists2] = await connection.query('SELECT * FROM roi_perday_record WHERE user_id = ? AND status = 2 ORDER BY id DESC', [userInfo.id]);
    const [sumMoney2] = await connection.query('SELECT SUM(amount) AS sumMoney2 FROM roi_perday_record WHERE user_id = ? AND status = 2', [userInfo.id]);
    const [lists3] = await connection.query('SELECT * FROM roi_perday_record WHERE user_id = ? AND status = 3 ORDER BY id DESC', [userInfo.id]);
    const [sumMoney3] = await connection.query('SELECT SUM(amount) AS sumMoney3 FROM roi_perday_record WHERE user_id = ? AND status = 3', [userInfo.id]);

    // Pagination for lists4
    const limit = 10; // Number of records per page
    const page = req.query.page || 1; // Current page, default is 1
    const offset = (page - 1) * limit;

    // Fetch the total number of records for pagination
    const [totalRecords] = await connection.query('SELECT COUNT(*) as total FROM roi_perday_record');
    const totalLists4 = totalRecords[0].total;

    // Fetch paginated results for lists4
    const [lists4] = await connection.query('SELECT * FROM roi_perday_record ORDER BY id DESC LIMIT ? OFFSET ?', [limit, offset]);

    if (lists.length === 0 && lists2.length === 0 && lists3.length === 0 && lists4.length === 0) {
      return res.status(202).json({
        message: 'Failed: No lists found',
        status: false,
      });
    }

    return res.status(200).json({
      message: 'Success: Plans fetched successfully',
      status: true,
      data: {
        list1: lists,
        list2: lists2,
        sumMoney2: sumMoney2[0].sumMoney2 || 0, // sumMoney2 ka value ya default 0
        list3: lists3,
        sumMoney3: sumMoney3[0].sumMoney3 || 0, // sumMoney3 ka value ya default 0
        lists4: lists4,
        total: totalAmount || 0,
        totalLists4, // Total number of records in lists4
        currentPage: page, // Current page
        totalPages: Math.ceil(totalLists4 / limit), // Total pages for lists4
      },
    });

  } catch (error) {
    console.error('Failed: Error fetching ROI lists: ', error);
    return res.status(500).json({
      message: 'Server error',
      status: false,
    });
  }
};






export default {
    CreateROI,
    UserRoiPage,
    RoiPage,
    ROIDetail,
    purchaseROI,
    checkPlanValidity,
    userPlans,
    AiDeshboardPage,
    AiLevelDeshboardPage,
    userRoiList,
    ROIStatus,
    ROIPlanDetails
}