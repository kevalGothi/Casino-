import express from 'express';
import accountController from '../controllers/accountController.js';
import homeController from '../controllers/homeController.js';
import winGoController from '../controllers/winGoController.js';
import userController from '../controllers/userController.js';
import middlewareController from '../controllers/middlewareController.js';
import adminController from '../controllers/adminController.js';
import dailyController from '../controllers/dailyController.js';
import k5Controller from '../controllers/k5Controller.js';
import k3Controller from '../controllers/k3Controller.js';
import trxController from '../controllers/trxController.js';
import RoiController from "../controllers/RoiController.js";
import subAdminController from "../controllers/subadminController.js";



let router = express.Router();

const initWebRouter = (app) => {
    // page account
    router.get('/keFuMenu', accountController.keFuMenu);
    router.get('/login', accountController.loginPage);
    router.get('/register', accountController.registerPage);
    router.get('/forgot', accountController.forgotPage);
    router.post('/api/sent/otp/verify', accountController.verifyCode);
    router.post('/api/sent/otp/verify/reset', accountController.verifyCodePass);
    router.post('/api/resetPasword', accountController.forGotPassword);
    
    //ROI routes
    router.get('/roi',middlewareController,  RoiController.RoiPage);
    router.get('/ai-deshboard',middlewareController,  RoiController.AiDeshboardPage);
    router.get('/ai-level-deshboard',middlewareController,  RoiController.AiLevelDeshboardPage);
    router.get('/user-roi', middlewareController, RoiController.UserRoiPage);
    router.get("/api/webapi/roi-detail",middlewareController, RoiController.ROIDetail);
    router.get("/api/webapi/users-plans", middlewareController, RoiController.userPlans);
    router.get("/api/webapi/users-income-list", middlewareController, RoiController.userRoiList);
    router.post("/api/webapi/purchase-plan/:id", middlewareController, RoiController.purchaseROI);
    router.post("/api/webapi/create-roi", middlewareController, RoiController.CreateROI);
     router.get("/api/webapi/roi-plan-details",middlewareController, RoiController.ROIPlanDetails);
     router.post("/api/webapi/update-roi-status/:id", middlewareController, RoiController.ROIStatus);
    // router.post("/api/webapi/update-roi-status/:id", middlewareController, RoiController.ROIStatus);
    

    // page home
    router.get('/', (req, res) => {
      return res.redirect('/home');
  });
    router.get('/ai-deshboard', (req, res) => {
      return res.redirect('/home');
  });
    router.get('/ai-level-deshboard', (req, res) => {
      return res.redirect('/home');
  });
    router.get('/user-roi', (req, res) => {
      return res.redirect('/home');
  });
  
    router.post(
    "/api/webapi/update-avator",
    middlewareController,
    userController.updateAvatar
  );

  router.get("/api/webapi/slot-result",middlewareController, RoiController.ROIPlanDetails)
 
  
  router.get('/home', homeController.homePage);
  router.post('/api/team-data', middlewareController, userController.listTeamData);

   router.get('/support-page', middlewareController, homeController.SupportPage);
   router.get('/support-record-page', middlewareController, homeController.gameProblamRecordPage);
   router.get('/game-problam-page', middlewareController, homeController.gameProblamPage);
   router.get('/slotjili', middlewareController, homeController.slotjiliPage);
    router.get('/casino-jdb', middlewareController, homeController.casinoJDBPage);
    router.get('/slots-jdb', middlewareController, homeController.slotsJDBPage);
    router.get('/rummy-jdb', middlewareController, homeController.rummyJDBPage);
    router.get('/original-jdb', middlewareController, homeController.originalJDBPage);
    router.get('/popular-jdb', middlewareController, homeController.popularJDBPage);
   router.get('/popular', middlewareController, homeController.popularPage);
   router.get('/casino', middlewareController, homeController.casinoPage);
   router.get('/original', middlewareController, homeController.originalPage);
   router.get('/all-games', middlewareController, homeController.allGamePage);
    router.get('/checkIn/super-jackpot', middlewareController, homeController.SuperJackpot);
    router.get('/checkIn/aviator-bonus', middlewareController, homeController.aviatorBonus);
    router.get('/checkIn/new_member-package', middlewareController, homeController.newMemberPackage);
    router.get('/checkIn/invitation-bonus', middlewareController, homeController.InvitationBonus);
    router.get('/checkIn/activity-award', middlewareController, homeController.ActivityAward);
    router.get('/checkIn/receive-history', middlewareController, homeController.receiveHistory);
    router.get('/checkIn/first-deposit', middlewareController, homeController.FirstDepositPage);
    router.get('/checkIn/invition-rule', middlewareController, homeController.invitationRule);
    router.get('/checkIn/invition-History-page', middlewareController, homeController.invitionHistoryPage);
    router.get('/promotion/partner-reward', middlewareController, homeController.partnerRewardPage);
    router.get('/promotion/rebate-ratio', middlewareController, homeController.rebateRatio);
    router.get('/transition-history', middlewareController, homeController.TransitionHistory);
    router.get('/game-history', middlewareController, homeController.gameHistory);
    router.get('/activity', middlewareController, homeController.activityPage);
    router.get('/rebatePage', middlewareController, homeController.rebatPage);
    router.get('/checkIn', middlewareController, homeController.checkInPage);
    router.get('/checkDes', middlewareController, homeController.checkDes);
    router.get('/checkRecord', middlewareController, homeController.checkRecord);
    router.get('/wallet/transfer', middlewareController, homeController.transfer);
    router.get('/wallet/wallet_transfer', middlewareController, homeController.winTransterPage);
    router.get('/wallet/user_money_transfer', middlewareController, homeController.P2PTransterPage);
     router.get('/wallet/user_money_transfer', (req, res) => {
      return res.redirect('/wallet');
  });
    router.get('/wallet/add_upi', middlewareController, homeController.addUpiPage);
    router.get('/wallet/add_bep', middlewareController, homeController.addBepPage);
    router.get('/wallet/add_trc', middlewareController, homeController.addTrcPage);
        router.get('/wallet/add_bkash', middlewareController, homeController.addBkashPage);
    router.get('/wallet/add_nagad', middlewareController, homeController.addNagadPage);
    
    router.get('/promotion', middlewareController, homeController.promotionPage);
    router.get('/promotion/myTeam', middlewareController, homeController.promotionmyTeamPage);
    
        // edit by sagar
    router.get('/promotion/signupbonus', middlewareController, homeController.promotionmySignUpBonus);
    router.get('/promotion/playearn', middlewareController, homeController.promotionPlayEarn);
    router.get('/promotion/rechargebonus', middlewareController, homeController.promotionRechargeBonus);
    router.get('/promotion/dailyattendancebouns', middlewareController, homeController.promotionDailyAttendanceBonus);
    router.get('/promotion/reffralbonus', middlewareController, homeController.promotionReffralBonus);
    router.get('/promotion/dailysalaryincomebetting', middlewareController, homeController.promotionDailySalaryIncomeBetting);
    router.get('/promotion/dailysalaryincomerecharge', middlewareController, homeController.promotionDailySalaryIncomeRecharge);
    router.get('/promotion/levelincome', middlewareController, homeController.promotionLevelIncome);
    router.get('/promotion/montlysalaryteambetting', middlewareController, homeController.promotionMontlySalaryTeamBetting);
    router.get('/promotion/montlysalaryrecharge', middlewareController, homeController.promotionMontlySalaryRecharge);
    
    
    
    
    router.get('/promotion/promotionDes', middlewareController, homeController.promotionDesPage);
    router.get('/promotion/tutorial', middlewareController, homeController.tutorialPage);
    router.get('/promotion/bonusrecord', middlewareController, homeController.bonusRecordPage);
    router.get('/promotion/invite', middlewareController, homeController.promotionShare);

    router.get('/wallet', middlewareController, homeController.walletPage);
    router.get('/wallet/recharge', middlewareController, homeController.rechargePage);
    router.get('/wallet/withdrawal', middlewareController, homeController.withdrawalPage);
    router.get('/wallet/rechargerecord', middlewareController, homeController.rechargerecordPage);
    router.get('/wallet/withdrawalrecord', middlewareController, homeController.withdrawalrecordPage);
    router.get('/wallet/addBank', middlewareController, homeController.addBank);

    router.get('/mian', middlewareController, homeController.mianPage);
    
    router.get('/recordsalary', middlewareController, homeController.recordsalary);
    router.get('/getrecord', middlewareController, homeController.getSalaryRecord);
    router.get('/about', middlewareController, homeController.aboutPage);
    router.get('/redenvelopes', middlewareController, homeController.redenvelopes);
    router.get('/mian/forgot', middlewareController, homeController.forgot);
    router.get('/mian/vip', middlewareController, homeController.VIPPage);
    router.get('/mian/avatar', middlewareController, homeController.AvatarPage);
    router.get('/mian/feedback', middlewareController, homeController.FeedbackPage);
    router.get('/mian/notification', middlewareController, homeController.loginNotificationPage);
    router.get('/mian/game-statistics', middlewareController, homeController.gameStatisticsPage);
    router.get('/mian/notice', middlewareController, homeController.NotificationPage);
    router.get('/newtutorial', homeController.newtutorial);
    router.get('/about/privacyPolicy', middlewareController, homeController.privacyPolicy);
    router.get('/about/riskAgreement', middlewareController, homeController.riskAgreement);

    router.get('/myProfile', middlewareController, homeController.myProfilePage);
    router.get('/wallet/recharge/pay', middlewareController, homeController.rechargeGateway);
    router.get('/wallet/recharge/pay1', middlewareController, homeController.rechargeGateway1);
    router.get('/api/webapi/problam-status-details', middlewareController, userController.fetchGameProblamDetails); 
    router.post('/api/webapi/receive-vip-bonus', middlewareController, userController.collectVipBonus); 
    router.post('/api/webapi/checkBonus', middlewareController, userController.CheckVipCollect);
    router.post('/api/webapi/makePayment', middlewareController, userController.makePayment); 
    router.get('/api/webapi/verifyPayment/:id', userController.veriFyPayment); 
    router.get('/api/webapi/payment-verify/:id', userController.veriFyPayment2); 
    router.post('/api/webapi/update', middlewareController, userController.upd); 
    router.post('/api/webapi/issue-send', middlewareController, userController.gameProblam); 
    router.post('/api/webapi/yesterday-bonus', middlewareController, userController.BonusGet); 
    router.post('/api/webapi/rebate-collect',middlewareController, userController.collectRebateBonus);




    // BET wingo
    router.get('/win', middlewareController, winGoController.winGoPage);
    router.get('/win/3', middlewareController, winGoController.winGoPage3);
    router.get('/win/5', middlewareController, winGoController.winGoPage5);
    router.get('/win/10', middlewareController, winGoController.winGoPage10);

    // BET Trx
    router.get('/trx', middlewareController, trxController.trxPage);
    router.get('/trx/3', middlewareController, trxController.trxPage3);
    router.get('/trx/5', middlewareController, trxController.trxPage5);
    router.get('/trx/10', middlewareController, trxController.trxPage10);

    // BET K5D
    router.get('/5d', middlewareController, k5Controller.K5DPage);
    router.post('/api/webapi/action/5d/join', middlewareController, k5Controller.betK5D); 
    router.post('/api/webapi/5d/GetNoaverageEmerdList', middlewareController, k5Controller.listOrderOld); 
    router.post('/api/webapi/5d/GetMyEmerdList', middlewareController, k5Controller.GetMyEmerdList); 

    // BET K3
    router.get('/k3', middlewareController, k3Controller.K3Page);
    
    
    router.post('/api/webapi/action/k3/join', middlewareController, k3Controller.betK3); 
    router.post('/api/webapi/k3/GetNoaverageEmerdList', middlewareController, k3Controller.listOrderOld); 
    router.post('/api/webapi/k3/GetMyEmerdList', middlewareController, k3Controller.GetMyEmerdList); 


    // login | register 
    router.post('/api/webapi/login', accountController.login); 
    router.post('/api/webapi/register', accountController.register); 
    router.get('/aviator', middlewareController, userController.aviator);
    router.get('/api/webapi/GetUserInfo', middlewareController, userController.userInfo); 
    router.put('/api/webapi/change/userInfo', middlewareController, userController.changeUser); 
    router.put('/api/webapi/change/pass', middlewareController, userController.changePassword); 
    router.get('/api/webapi/check-recharge', middlewareController, userController.CheckFirstRecharge);
    // bet wingo
    router.post('/api/webapi/action/join', middlewareController, winGoController.betWinGo); 
    router.post('/api/webapi/GetNoaverageEmerdList', middlewareController, winGoController.listOrderOld); 
    router.post('/api/webapi/GetMyEmerdList', middlewareController, winGoController.GetMyEmerdList); 
    
    // bet Trx
    router.post('/api/webapi/action/trx/join', middlewareController, trxController.betTrx); 
    router.post('/api/webapi/trx/GetNoaverageEmerdList', middlewareController, trxController.listOrderOld); 
    router.post('/api/webapi/trx/GetMyEmerdList', middlewareController, trxController.GetMyEmerdList); 
    // promotion
    router.post('/api/webapi/promotion', middlewareController, userController.promotion); 
    router.post('/api/webapi/checkIn', middlewareController, userController.checkInHandling); 
    router.post('/api/webapi/check/Info', middlewareController, userController.infoUserBank); 
    router.post('/api/webapi/addBank', middlewareController, userController.addBank); 
    router.post('/api/webapi/otp', middlewareController, userController.verifyCode); 
    router.post('/api/webapi/use/redenvelope', middlewareController, userController.useRedenvelope); 

    // wallet
    router.post('/api/webapi/recharge', middlewareController, userController.recharge);
    router.get('/api/webapi/gift-details', middlewareController, userController.getGiftCodeHistory); 
    router.get('/api/webapi/invition-history', middlewareController, userController.fetchInvitionHistory); 
    
    router.post('/wowpay/create', middlewareController, userController.wowpay);
    router.post('/api/webapi/confirm_recharge', middlewareController, userController.confirmRecharge);
    router.get('/api/webapi/myTeam', middlewareController, userController.listMyTeam); 
    router.get('/api/webapi/recharge/list', middlewareController, userController.listRecharge); 
    router.get('/api/webapi/withdraw/list', middlewareController, userController.listWithdraw); 
    router.post('/api/webapi/recharge/check', middlewareController, userController.recharge2); 
    router.post('/api/webapi/withdrawal', middlewareController, userController.withdrawal3); 
    router.post('/api/webapi/callback_bank', middlewareController, userController.callback_bank); 
    router.post('/api/webapi/recharge/update', middlewareController, userController.updateRecharge); 
    router.post('/api/webapi/transfer', middlewareController, userController.transfer); 
    router.get('/api/webapi/transfer_history', middlewareController, userController.transferHistory);
    router.get('/api/webapi/payment-details', middlewareController, userController.fetchPaymentDetails);
    router.get('/api/webapi/users-bets', middlewareController, userController.listBet);
    router.get('/api/webapi/transtion_details', middlewareController, userController.TranstionDetails);
    router.get('/api/webapi/transtion_info', middlewareController, userController.TranstionInfoHistory);
    router.get('/api/webapi/rebate-fetch', middlewareController, userController.fetchRebateBonus);
    router.get('/api/webapi/total_recharge_calculate', middlewareController, userController.RechargeCalculate); 
    router.post('/api/webapi/total_ref', middlewareController, userController.TotalReferrals); 
    router.get('/api/webapi/login_notice', middlewareController, userController.loginNotice); 
    router.get('/api/webapi/game-statistics-details',middlewareController, userController.GameStatistics); 
    router.get('/api/webapi/fetch-notice',middlewareController, userController.fetchNotice); 
    router.get('/api/webapi/fetch-vip-level',middlewareController, userController.fetchVIPLevelDetails); 
    router.get('/api/webapi/fetch-Invitation-details',middlewareController, userController.fetchInvitationDetails); 
    router.get('/api/webapi/fetch-vip-level-details',middlewareController, userController.fetchVIPConditionData); 
    router.get('/api/webapi/fetch-transition-details',middlewareController, userController.fetchTransitionDetialsHistory); 
    
    router.post('/api/webapi/fetch-Invition-Details', middlewareController, userController.CheckInvitionBonus); 
    router.post('/api/webapi/Invition-checkin', middlewareController, userController.CheckInvitionBonusCollect); 
    router.post('/api/webapi/fetch-vip-level', middlewareController, userController.VIPLevelAsseing); 
    router.post('/api/webapi/fetch-notice/:id',middlewareController, userController.loginNoticeDelete); 
    router.post('/api/webapi/win-transfer', middlewareController, userController.TransferMoney);
    router.post('/api/webapi/p2p_transfer', middlewareController, userController.TransferP2PMoney);
    router.post('/api/webapi/feedback-details', middlewareController, userController.Feedback);

    router.post('/api/webapi/search', middlewareController, userController.search); 


    // daily
    router.get('/manager/index', dailyController.middlewareDailyController, dailyController.dailyPage);
    router.get('/manager/listRecharge', dailyController.middlewareDailyController, dailyController.listRecharge);
    router.get('/manager/listWithdraw', dailyController.middlewareDailyController, dailyController.listWithdraw);
    router.get('/manager/members', dailyController.middlewareDailyController, dailyController.listMeber);
    router.get('/manager/profileMember', dailyController.middlewareDailyController, dailyController.profileMember);
    router.get('/manager/settings', dailyController.middlewareDailyController, dailyController.settingPage);
    router.get('/manager/gifts', dailyController.middlewareDailyController, dailyController.giftPage);
    router.get(
    "/admin/manager/getGiftCodeHistory",
    adminController.middlewareAdminController,
    adminController.giftCodeHistoryPage
  );
    router.get('/manager/support', dailyController.middlewareDailyController, dailyController.support);
    router.get('/manager/member/info/:phone', dailyController.middlewareDailyController, dailyController.pageInfo);

    router.post('/manager/member/info/:phone', dailyController.middlewareDailyController, dailyController.userInfo);
    router.post('/manager/member/listRecharge/:phone', dailyController.middlewareDailyController, dailyController.listRechargeMem);
    router.post('/manager/member/listWithdraw/:phone', dailyController.middlewareDailyController, dailyController.listWithdrawMem);
    router.post('/manager/member/redenvelope/:phone', dailyController.middlewareDailyController, dailyController.listRedenvelope);
    router.post('/manager/member/bet/:phone', dailyController.middlewareDailyController, dailyController.listBet);
        router.post('/admin/manager/settings/buff', adminController.middlewareAdminController, adminController.settingbuff);


    router.post('/manager/settings/list', dailyController.middlewareDailyController, dailyController.settings);
    router.post('/manager/createBonus', dailyController.middlewareDailyController, dailyController.createBonus);
    router.get('/admin/manager/bonus', adminController.middlewareAdminController, adminController.bonusPage); 
    router.get('/admin/manager/recharge-bonus', adminController.middlewareAdminController, adminController.rechargeBonusPage);
      router.get('/admin/manager/attendance-bonus', adminController.middlewareAdminController, adminController.attendanceBonusPage);
      router.get('/admin/manager/bet-commission', adminController.middlewareAdminController, adminController.betCommissionPage);
      router.get('/admin/manager/daily-salary-betting', adminController.middlewareAdminController, adminController.dailySalaryBetting);
      router.get('/admin/manager/reffral_bonus', adminController.middlewareAdminController, adminController.reffralBonus);
      router.get('/admin/manager/level-income-bonus', adminController.middlewareAdminController, adminController.levelIncomeBonus);
      router.get('/admin/manager/montly-salary-income-recharge-bonus', adminController.middlewareAdminController, adminController.levelIncomeBonus);
      router.get('/admin/manager/montly-salary-team-recharge-bonus', adminController.middlewareAdminController, adminController.levelIncomeBonus);
       
    router.post('/manager/listRedenvelops', dailyController.middlewareDailyController, dailyController.listRedenvelops);

    router.post('/manager/listRecharge', dailyController.middlewareDailyController, dailyController.listRechargeP);
    router.post('/manager/listWithdraw', dailyController.middlewareDailyController, dailyController.listWithdrawP);

    router.post('/api/webapi/statistical', dailyController.middlewareDailyController, dailyController.statistical);
    router.post('/manager/infoCtv', dailyController.middlewareDailyController, dailyController.infoCtv); 
    router.post('/manager/infoCtv/select', dailyController.middlewareDailyController, dailyController.infoCtv2); 
    router.post('/api/webapi/manager/listMember', dailyController.middlewareDailyController, dailyController.listMember); 

    router.post('/api/webapi/manager/buff', dailyController.middlewareDailyController, dailyController.buffMoney); 


    // admin
    router.get('/admin/manager/getBannerHome',  adminController.getBannersHome); 
    router.get('/admin/manager/index', adminController.middlewareAdminController, adminController.adminPage); 
    router.get('/admin/manager/index/3', adminController.middlewareAdminController, adminController.adminPage3); 
    router.get('/admin/manager/index/5', adminController.middlewareAdminController, adminController.adminPage5); 
    router.get('/admin/manager/index/10', adminController.middlewareAdminController, adminController.adminPage10); 
   
    router.get('/admin/manager/trx', adminController.middlewareAdminController, adminController.trxPage); 
    router.get('/admin/manager/trx/3', adminController.middlewareAdminController, adminController.trxPage3); 
    router.get('/admin/manager/trx/5', adminController.middlewareAdminController, adminController.trxPage5); 
    router.get('/admin/manager/trx/10', adminController.middlewareAdminController, adminController.trxPage10); 

    router.get('/admin/manager/5d', adminController.middlewareAdminController, adminController.adminPage5d); 
    router.get('/admin/manager/k3', adminController.middlewareAdminController, adminController.adminPageK3); 
    
     router.post('/admin/manager/settings/buff', adminController.middlewareAdminController, adminController.settingbuff);

 router.get('/admin/manager/payment_details', adminController.middlewareAdminController, adminController.paymentpage); 
    router.get('/admin/manager/members', adminController.middlewareAdminController, adminController.membersPage); 
    router.get('/admin/manager/createBonus', adminController.middlewareAdminController, adminController.giftPage); 
    router.get('/admin/manager/ctv', adminController.middlewareAdminController, adminController.ctvPage); 
    router.get('/admin/manager/ctv/profile/:phone', adminController.middlewareAdminController, adminController.ctvProfilePage); 
    
    router.post('/admin/manager/payment-update', adminController.middlewareAdminController,  adminController.UpdatePayment); 

    router.get('/admin/manager/settings', adminController.middlewareAdminController, adminController.settings); 
    router.get('/admin/manager/game-issue', adminController.middlewareAdminController, adminController.gameIssuePage); 
    router.get('/admin/manager/listRedenvelops', adminController.middlewareAdminController, adminController.listRedenvelops); 
    router.get('/admin/manager/ranking-setting', adminController.middlewareAdminController, adminController.RankLevelPage); 
    router.post('/admin/manager/infoCtv', adminController.middlewareAdminController, adminController.infoCtv); 
    router.post('/admin/manager/infoCtv/select', adminController.middlewareAdminController, adminController.infoCtv2); 
    router.post('/admin/manager/settings/bank', adminController.middlewareAdminController, adminController.settingBank); 
    router.post('/admin/manager/settings/cskh', adminController.middlewareAdminController, adminController.settingCskh); 
    router.post('/admin/manager/settings/cskh', adminController.middlewareAdminController, adminController.settingCskh); 
    router.post('/admin/manager/settings/notice', adminController.middlewareAdminController, adminController.settingNotice); 
    router.post('/admin/manager/create/ctv', adminController.middlewareAdminController, adminController.register); 
    router.post('/admin/manager/settings/get', adminController.middlewareAdminController, adminController.settingGet); 
    router.post('/admin/manager/createBonus', adminController.middlewareAdminController, adminController.createBonus); 
      router.get(
    "/admin/manager/get-gift-code-history",
    adminController.middlewareAdminController,
    adminController.getGiftCodeHistory
  );
  
   router.get('/admin/manager/dashboard', adminController.middlewareAdminController, adminController.dashboardView); 
  
  
    router.post(
    "/admin/update-bank-details/:phone",
    adminController.middlewareAdminController,
    adminController.updateBankDetails
  );
  
    router.post(
    "/admin/update-withdrawal-setting",
    adminController.middlewareAdminController,
    adminController.updateUserAvatarWithdrawal
  );


    
      router.post('/admin/manager/bonus', adminController.middlewareAdminController, adminController.bonus);
      
    router.post('/admin/manager/settings/welcomeBonus', adminController.middlewareAdminController, adminController.settingRegistrationBonus);
    router.post('/admin/manager/settings/status-update', adminController.middlewareAdminController, adminController.gameToggelStatus);
    router.get('/admin/manager/settings/status-details', adminController.middlewareAdminController, adminController.adminGameActivity);

    router.post('/admin/member/listRecharge/:phone', adminController.middlewareAdminController, adminController.listRechargeMem);
      router.post(
    "/sub-admin/update-position",
    adminController.middlewareAdminController,
    adminController.updatePositionSubAdmin
  );
    router.post('/admin/member/listWithdraw/:phone', adminController.middlewareAdminController, adminController.listWithdrawMem);
    router.post('/admin/member/redenvelope/:phone', adminController.middlewareAdminController, adminController.listRedenvelope);
    router.post('/admin/member/bet/:phone', adminController.middlewareAdminController, adminController.listBet);
    router.post('/admin/member/roi/:phone', adminController.middlewareAdminController, adminController.listRoiPackage);


    router.get('/admin/manager/recharge', adminController.middlewareAdminController, adminController.rechargePage); 
    router.get('/admin/manager/create-invitation-bonus', adminController.middlewareAdminController, adminController.creatInviteBonusPage); 
    router.get('/admin/manager/crpto-recharge-details', adminController.middlewareAdminController, adminController.rechargeCrptoPage); 
    router.get('/admin/manager/crpto-withdraw-details', adminController.middlewareAdminController, adminController.withdrawCrptoPage); 
    router.get('/admin/manager/withdraw', adminController.middlewareAdminController, adminController.withdraw); 
    router.get('/admin/manager/roimanagment', adminController.middlewareAdminController, adminController.roiManage); 
    router.get('/admin/manager/create-roi-page', adminController.middlewareAdminController, adminController.RoiCreatePage); 
    router.get('/admin/manager/roi-setting', adminController.middlewareAdminController, adminController.RoiSetting); 
    router.get('/admin/manager/levelSetting', adminController.middlewareAdminController, adminController.levelSetting);
    router.get('/admin/manager/CreatedSalaryRecord', adminController.middlewareAdminController, adminController.CreatedSalaryRecord);
    router.post('/api/admin/specific-login', adminController.middlewareAdminController, adminController.AdminToUserLogin);
    router.get('/admin/manager/rechargeRecord', adminController.middlewareAdminController, adminController.rechargeRecord); 
    router.get('/admin/manager/withdrawRecord', adminController.middlewareAdminController, adminController.withdrawRecord); 
    router.get('/admin/manager/statistical', adminController.middlewareAdminController, adminController.statistical); 
    router.get('/admin/member/info/:id', adminController.middlewareAdminController, adminController.infoMember);
    router.get('/api/webapi/admin/getLevelInfo', adminController.middlewareAdminController, adminController.getLevelInfo);
    router.get('/api/webapi/admin/getRankLevelInfo', adminController.middlewareAdminController, adminController.getRankLevelInfo);
    router.get('/api/webapi/admin/getSalary', adminController.middlewareAdminController, adminController.getSalary);
    router.get('/api/webapi/admin/getRoiLevelInfo', adminController.middlewareAdminController, adminController.getRoiLevelInfo);
    router.get('/api/webapi/admin/add-user', adminController.middlewareAdminController, adminController.addUser);
    router.get('/api/webapi/admin/getSalaryInfo', adminController.middlewareAdminController, adminController.getSalarySetting);
    router.get('/api/webapi/admin/getSalaryRecord', adminController.middlewareAdminController, adminController.getSalaryRecord);
    router.get('/api/webapi/admin/getSalaryRecordHistory', adminController.middlewareAdminController, adminController.getSalaryRecordHistory);
    router.get('/api/webapi/admin/salary-record', adminController.middlewareAdminController, adminController.salaryRecordPage);
    router.get('/api/webapi/admin/salary-amt',  adminController.SalaryAmountDistributed);
    router.get('/api/webapi/admin/salary-recode-history',  adminController.salaryRecordHistoryPage);
    router.get('/admin/manager/roi-recode-history',  adminController.roiHistoryRecodes);
    router.get('/admin/manager/manual-salary', adminController.middlewareAdminController,  adminController.ManualSalaryCreatePage);
    router.get('/admin/manager/create-notice', adminController.middlewareAdminController,  adminController.createNoticePage);
    router.get('/api/webapi/admin/recharge-details', adminController.middlewareAdminController,  adminController.reachargeDetails);
    router.get('/api/webapi/admin/manual-salary-records', adminController.getManualSalaryRecords);

    router.post('/api/webapi/admin/create-notice',adminController.middlewareAdminController,  adminController.addNotification);
    router.post('/api/webapi/admin/manual-salary-created',adminController.middlewareAdminController,  adminController.CreatedManualSalary);
    router.post('/api/webapi/admin/update-salary-settings', adminController.middlewareAdminController, adminController.updateSalarySetting); 
    router.post('/api/webapi/admin/update-roi-levels', adminController.middlewareAdminController, adminController.updateRoiLevel); 
    router.post('/api/webapi/admin/update-levels', adminController.middlewareAdminController, adminController.updateLevel); 
    router.post('/api/webapi/admin/rank-levels-update', adminController.middlewareAdminController, adminController.rankLevelUpdate); 
    router.post('/api/webapi/admin/CreatedSalary', adminController.middlewareAdminController, adminController.CreatedSalary); 
    router.post('/api/webapi/admin/listMember', adminController.middlewareAdminController, adminController.listMember); 
    router.post('/api/webapi/admin/listctv', adminController.middlewareAdminController, adminController.listCTV); 
    router.post('/api/webapi/admin/withdraw', adminController.middlewareAdminController, adminController.handlWithdraw); 
    router.post('/api/webapi/admin/recharge', adminController.middlewareAdminController, adminController.recharge); 
    router.post('/api/webapi/admin/rechargeDuyet', adminController.middlewareAdminController, adminController.rechargeDuyet); 
    router.post('/api/webapi/admin/game-issue-Duyet', adminController.middlewareAdminController, adminController.gameIssueDuyet); 
    router.post('/api/webapi/admin/salary-status', adminController.middlewareAdminController, adminController.SalaryStatus); 
    router.post('/api/webapi/admin/member/info', adminController.middlewareAdminController, adminController.userInfo); 
    router.post('/api/webapi/admin/statistical', adminController.middlewareAdminController, adminController.statistical2); 
    router.post('/api/webapi/admin/addNewUser', adminController.middlewareAdminController, adminController.AddNewUser); 
    router.post('/api/webapi/admin/invitation-bonus', adminController.middlewareAdminController, adminController.addInvitationBonus); 
    router.post('/api/webapi/admin/game-problam-info', adminController.middlewareAdminController, adminController.fetchGameProblam); 
    
    

    router.post('/api/webapi/admin/banned', adminController.middlewareAdminController, adminController.banned); 


    router.post('/api/webapi/admin/totalJoin', adminController.middlewareAdminController, adminController.totalJoin); 
    router.post('/api/webapi/admin/change', adminController.middlewareAdminController, adminController.changeAdmin); 
    router.post('/api/webapi/admin/profileUser', adminController.middlewareAdminController, adminController.profileUser); 

    router.post('/api/webapi/admin/trxJoin', adminController.middlewareAdminController, adminController.totalJoin1); 
    router.post('/api/webapi/admin/trxchange', adminController.middlewareAdminController, adminController.changeAdmin1); 
    router.post('/api/webapi/admin/trxprofileUser', adminController.middlewareAdminController, adminController.profileUser1); 

    // admin 5d 
    router.post('/api/webapi/admin/5d/listOrders', adminController.middlewareAdminController, adminController.listOrderOld); 
    router.post('/api/webapi/admin/k3/listOrders', adminController.middlewareAdminController, adminController.listOrderOldK3); 
    router.post('/api/webapi/admin/5d/editResult', adminController.middlewareAdminController, adminController.editResult); 
    router.post('/api/webapi/admin/k3/editResult', adminController.middlewareAdminController, adminController.editResult2); 
    router.post('/admin/manager/uploadBbanner', adminController.middlewareAdminController, adminController.uploadBanner);
    router.get('/admin/manager/getBanner', adminController.getBanners);
    router.post('/admin/manager/deleteBanner', adminController.middlewareAdminController, adminController.deleteBanner);


// admin
    router.post('/api/webapi/admin/bet-commission', adminController.middlewareAdminController, adminController.BetCommission); 
    
    
        // user contoller
    router.get('/admin/manager/withdrawable-money', middlewareController, userController.withdrawableMoney); 
    
    
    // subAdminController
  router.get(
    "/sub-admin/index",
    subAdminController.middlewareSubAdminController,
    subAdminController.subAdminPage
  );
  
  
    router.post(
    "/api/webapi/sub-admin/listMember",
    subAdminController.middlewareSubAdminController,
    subAdminController.listMember
  );

 router.get('/sub-admin/member/info/:id', subAdminController.middlewareSubAdminController, subAdminController.infoMember);
  router.post('/sub-admin/member/listWithdraw/:phone', subAdminController.middlewareSubAdminController, subAdminController.listWithdrawMem);
  router.post('/sub-admin/member/listRecharge/:phone', subAdminController.middlewareSubAdminController, subAdminController.listRechargeMem);
      router.post('/sub-admin/member/redenvelope/:phone', subAdminController.middlewareSubAdminController, subAdminController.listRedenvelope);
    router.post('/sub-admin/member/bet/:phone', subAdminController.middlewareSubAdminController, subAdminController.listBet);
    router.post('/sub-admin/member/roi/:phone', subAdminController.middlewareSubAdminController, subAdminController.listRoiPackage);
    router.post('/api/webapi/sub-admin/member/info', subAdminController.middlewareSubAdminController, subAdminController.userInfo); 

  router.get(
    "/sub-admin/add-user",
    subAdminController.middlewareSubAdminController,
    subAdminController.subAdminAddUser
  );
  
  router.post('/api/webapi/sub-admin/addNewUser',     subAdminController.middlewareSubAdminController, subAdminController.AddNewUser); 
  router.get(
    "/sub-admin/recharge",
    subAdminController.middlewareSubAdminController,
    subAdminController.subAdminRecharge
  );

  router.post('/api/webapi/sub-admin/recharge', subAdminController.middlewareSubAdminController, subAdminController.recharge); 
  router.get('/api/webapi/sub-admin/recharge-details', subAdminController.middlewareSubAdminController,  subAdminController.reachargeDetails);

  router.get(
    "/sub-admin/crpto-recharge-details",
    subAdminController.middlewareSubAdminController,
    subAdminController.subAdminCrptoRechageDetails
  );

  router.get(
    "/sub-admin/withdraw",
    subAdminController.middlewareSubAdminController,
    subAdminController.subAdminWithdraw
  );
  
  router.post('/api/webapi/sub-admin/withdraw',  subAdminController.middlewareSubAdminController, subAdminController.handlWithdraw); 

  router.get(
    "/sub-admin/crpto-withdraw-details",
    subAdminController.middlewareSubAdminController,
    subAdminController.subAdminCrptoWithdrawDetails
  );

  router.get(
    "/sub-admin/rechargeRecord",
    subAdminController.middlewareSubAdminController,
    subAdminController.subAdminRechargeRecords
  );

  router.get(
    "/sub-admin/withdrawRecord",
    subAdminController.middlewareSubAdminController,
    subAdminController.subAdminWithdrawRecords
  );
  
  
    router.post(
    "/api/webapi/sub-admin/rechargeDuyet",
    subAdminController.middlewareSubAdminController,
    subAdminController.rechargeDuyet
  );



    return app.use('/', router);
}

export default {
    initWebRouter,
};