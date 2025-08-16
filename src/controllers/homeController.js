import connection from "../config/connectDB.js";
import jwt from 'jsonwebtoken'
import md5 from "md5";
import e from "express";
import fs from 'fs';
import path from 'path';

const homePage = async(req, res) => {
    try {
    const [settings] = await connection.query('SELECT `app` , `notice` FROM admin');
    let app = settings[0].app;
    let notice = settings[0].notice;

        res.render("home/index.ejs", {app,  notice}); 
    
    } catch (error) {
        return res.status(500).send('Internal server error');
    }
}

const landingPage = async(req, res) => {
    return res.render("home/landingPage.ejs"); 
}

const gameHistory = async(req, res) => {
    return res.render("wallet/gamehistory.ejs"); 
}

const slotjiliPage = async (req, res) => {
    return res.render("home/slots.ejs");
}

const popularPage = async (req, res) => {
    return res.render("home/fishing.ejs");
}

const allGamePage = async (req, res) => {
    return res.render("home/allGame.ejs");
}


const casinoPage = async (req, res) => {
    return res.render("home/casino.ejs");
}

const casinoJDBPage = async (req, res) => {
    return res.render("home/casino_jdb.ejs");
}

const slotsJDBPage = async (req, res) => {
    return res.render("home/slots_jdb.ejs");
}
const rummyJDBPage = async (req, res) => {
    return res.render("home/rummy_jdb.ejs");
}
const originalJDBPage = async (req, res) => {
    return res.render("home/original_jdb.ejs");
}
const popularJDBPage = async (req, res) => {
    return res.render("home/popular_jdb.ejs");
}

const originalPage = async (req, res) => {
    return res.render("home/original.ejs");
}
const loginNotificationPage = async(req, res) => {
    return res.render("member/notification.ejs"); 
}

const invitationRule = async (req, res) => {
    return res.render("checkIn/invition_rule.ejs");
}
const gameStatisticsPage = async(req, res) => {
    return res.render("member/gameStatistics.ejs"); 
}

const AvatarPage = async(req, res) => {
    return res.render("member/changeAvatar.ejs"); 
}

const SupportPage = async(req, res) => {
    return res.render("member/suppot.ejs"); 
}

const invitionHistoryPage = async(req, res) => {
    return res.render("checkIn/invitionRecord.ejs"); 
}

const gameProblamPage = async(req, res) => {
    return res.render("member/gameproblam.ejs"); 
}

const gameProblamRecordPage = async(req, res) => {
    return res.render("member/supportRecord.ejs"); 
}

const FeedbackPage = async(req, res) => {
    return res.render("member/feedback.ejs"); 
}


const FirstDepositPage = async(req, res) => {
    return res.render("checkIn/firstDeposit.ejs"); 
}

const NotificationPage = async(req, res) => {
    return res.render("member/notice.ejs"); 
}

const partnerRewardPage = async(req, res) => {
    return res.render("promotion/partnerReward.ejs"); 
}
const rebateRatio = async(req, res) => {
    return res.render("promotion/rebatelevel.ejs"); 
}
const TransitionHistory = async(req, res) => {
    return res.render("wallet/transitionHistory.ejs"); 
}
const addUpiPage = async(req, res) => {
    return res.render("wallet/addupiaddress.ejs"); 
}
const addBepPage = async(req, res) => {
    return res.render("wallet/addbep.ejs"); 
}
const addTrcPage = async(req, res) => {
    return res.render("wallet/addtrc.ejs"); 
}

const addBkashPage = async(req, res) => {
    return res.render("wallet/addbkash.ejs"); 
}
const addNagadPage = async(req, res) => {
    return res.render("wallet/addnagad.ejs"); 
}
 

const checkInPage = async(req, res) => {
    return res.render("checkIn/checkIn.ejs"); 
}
const activityPage = async(req, res) => {
    return res.render("checkIn/activity.ejs"); 
}
const rebatPage = async(req, res) => {
    return res.render("checkIn/rebat.ejs"); 
}

const receiveHistory = async(req, res) => {
    return res.render("checkIn/dailytaskHistory.ejs"); 
}
const InvitationBonus = async(req, res) => {
    return res.render("checkIn/invitionbonus.ejs"); 
}
const SuperJackpot = async(req, res) => {
    return res.render("checkIn/superJeckpot.ejs"); 
}

const newMemberPackage = async(req, res) => {
    return res.render("checkIn/newMemberGift.ejs"); 
}
const aviatorBonus = async(req, res) => {
    return res.render("checkIn/aviatorBonus.ejs"); 
}
const rechargeGateway = async(req, res) => {
    return res.render("wallet/pay.ejs"); 
}
const rechargeGateway1 = async(req, res) => {
    return res.render("wallet/pay1.ejs"); 
}
const checkDes = async(req, res) => {
    return res.render("checkIn/checkDes.ejs"); 
}

const checkRecord = async(req, res) => {
    return res.render("checkIn/checkRecord.ejs"); 
}

const addBank = async(req, res) => {
    return res.render("wallet/addbank.ejs"); 
}

// promotion
const promotionPage = async(req, res) => {
    return res.render("promotion/promotion.ejs"); 
}



const promotionShare = async(req, res) => {
    return res.render("promotion/invitationPage.ejs"); 
}


const promotionmyTeamPage = async(req, res) => {
    return res.render("promotion/myTeam.ejs"); 
}


const promotionmySignUpBonus = async(req, res) => {
    return res.render("promotion/signupbonus.ejs"); 
}

const promotionPlayEarn = async(req, res) => {
    return res.render("promotion/playandearn.ejs"); 
}

const promotionRechargeBonus = async(req, res) => {
    return res.render("promotion/rechargebonus.ejs"); 
}

const promotionDailyAttendanceBonus = async(req, res) => {
    return res.render("promotion/dailyattendancebonus.ejs"); 
}

const promotionReffralBonus = async(req, res) => {
    return res.render("promotion/reffralbonus.ejs"); 
}

const promotionDailySalaryIncomeBetting = async(req, res) => {
    return res.render("promotion/dsibetting.ejs"); 
}

const promotionDailySalaryIncomeRecharge = async(req, res) => {
    return res.render("promotion/dsirecharge.ejs"); 
}

const promotionLevelIncome = async(req, res) => {
    return res.render("promotion/levelincomebetting.ejs"); 
}

const promotionMontlySalaryTeamBetting = async(req, res) => {
    return res.render("promotion/monthlysalaryteambetting.ejs"); 
}

const promotionMontlySalaryRecharge = async(req, res) => {
    return res.render("promotion/monthlyrewardreacharge.ejs"); 
}


const promotionDesPage = async(req, res) => {
    return res.render("promotion/promotionDes.ejs"); 
}

const tutorialPage = async(req, res) => {
    return res.render("promotion/tutorial.ejs"); 
}

const bonusRecordPage = async(req, res) => {
    return res.render("promotion/bonusrecord.ejs"); 
}

// wallet
const walletPage = async(req, res) => {
    return res.render("wallet/index.ejs"); 
}
const winTransterPage = async(req, res) => {
    return res.render("wallet/walletTransfer.ejs"); 
}
const P2PTransterPage = async(req, res) => {
    return res.render("wallet/p2ptransfer.ejs"); 
}

const rechargePage = async(req, res) => {
    return res.render("wallet/recharge.ejs",{ params: req.query }); 
}

const rechargerecordPage = async(req, res) => {
    return res.render("wallet/rechargerecord.ejs"); 
}

const withdrawalPage = async(req, res) => {
    return res.render("wallet/withdrawal.ejs"); 
}

const withdrawalrecordPage = async(req, res) => {
    return res.render("wallet/withdrawalrecord.ejs"); 
}
const transfer = async(req, res) => {
    return res.render("wallet/transfer.ejs"); 
}

const VIPPage = async(req, res) => {
    return res.render("member/vippage.ejs"); 
}




// Function to handle fetching banner files for the admin panel
const getBannerFiles = (req, res) => {
    // Read the contents of the 'uploads/banners' directory
    const bannersDir = path.join(__dirname, '../uploads/banners');
    fs.readdir(bannersDir, (err, files) => {
        if (err) {
            console.error('Error reading banner files:', err);
            return res.status(500).send('Internal server error');
        }
        // Filter out directories and get only file names
        const bannerFiles = files.filter(file => fs.statSync(path.join(bannersDir, file)).isFile());
        res.render('index', { banners: bannerFiles }); // Pass banner files to the homepage template
    });
};



// member page
const mianPage = async(req, res) => { 
    let auth = req.cookies.auth;
    const [user] = await connection.query('SELECT `level` FROM users WHERE `token` = ? ', [auth]);
    const [settings] = await connection.query('SELECT `app` FROM admin');
    let app = settings[0].app;
    let level = user[0].level;
    return res.render("member/index.ejs", {level,app}); 
}

const aboutPage = async(req, res) => {
    return res.render("member/about/index.ejs"); 
}

const recordsalary = async(req,res) => {
    return res.render("member/about/recordsalary.ejs");
}

const ActivityAward = async(req,res) => {
    return res.render("checkIn/activityAward.ejs");
}

const privacyPolicy = async(req, res) => {
    return res.render("member/about/privacyPolicy.ejs"); 
}

const newtutorial = async(req, res) => {
    return res.render("member/newtutorial.ejs"); 
}

const forgot = async(req, res) => {
    let auth = req.cookies.auth;
    const [user] = await connection.query('SELECT `time_otp` FROM users WHERE token = ? ', [auth]);
    let time = user[0].time_otp;
    return res.render("member/forgot.ejs", {time}); 
}

const redenvelopes = async(req, res) => {
    return res.render("member/redenvelopes.ejs"); 
}

const riskAgreement = async(req, res) => {
    return res.render("member/about/riskAgreement.ejs"); 
}

const myProfilePage = async(req, res) => {
    return res.render("member/myProfile.ejs"); 
}

const getSalaryRecord = async(req, res)=>{
    const auth = req.cookies.auth;

    const [rows] = await connection.query(`SELECT * FROM users WHERE token = ?`, [auth]);
    let rowstr = rows[0];
    if (!rows) {
      return res.status(200).json({
          message: 'Failed',
          status: false,

      });
  }
const [getPhone] = await connection.query(
  `SELECT * FROM salary WHERE phone = ? ORDER BY time DESC`,
  [rowstr.phone]
);


  console.log("asdasdasd : " +[ rows.phone])
  return res.status(200).json({
      message: 'Success',
      status: true,
      data: {

      },
      rows: getPhone,
})
}



export default {
    promotionmySignUpBonus,
    promotionPlayEarn,
    promotionRechargeBonus,
    promotionDailyAttendanceBonus,
    promotionReffralBonus,
    promotionDailySalaryIncomeBetting,
    promotionDailySalaryIncomeRecharge,
    promotionLevelIncome,
    promotionMontlySalaryTeamBetting,
    promotionMontlySalaryRecharge,
    homePage,
    checkInPage,
    promotionPage,
    walletPage,
    mianPage,
    myProfilePage,
    promotionmyTeamPage,
    promotionDesPage,
    tutorialPage,
    bonusRecordPage,
    rechargeGateway,
    rechargeGateway1,
    rechargePage,
    rechargerecordPage,
    withdrawalPage,
    withdrawalrecordPage,
    aboutPage,
    privacyPolicy,
    riskAgreement,
    newtutorial,
    redenvelopes,
    forgot,
    checkDes,
    checkRecord,
    addBank,
    transfer,
    recordsalary,
    getSalaryRecord,
    landingPage,
    getBannerFiles,
    gameHistory,
    winTransterPage,
    P2PTransterPage,
    TransitionHistory,
    activityPage,
    rebatPage,
    addUpiPage,
    addBepPage,
    addTrcPage,
    rebateRatio,
    partnerRewardPage,
    ActivityAward,
    receiveHistory,
    InvitationBonus,
    SuperJackpot,
    newMemberPackage,
    aviatorBonus,
    promotionShare,
    VIPPage,
    loginNotificationPage,
    gameStatisticsPage,
    AvatarPage,
    FeedbackPage,
    NotificationPage,
    slotjiliPage,
    originalPage,
    casinoPage,
    popularPage,
    SupportPage,
    gameProblamPage,
    gameProblamRecordPage,
    FirstDepositPage,
    casinoJDBPage,
    slotsJDBPage,
    rummyJDBPage,
    originalJDBPage,
    popularJDBPage,
    invitationRule,
    invitionHistoryPage,
    allGamePage,
    addBkashPage,
    addNagadPage
}