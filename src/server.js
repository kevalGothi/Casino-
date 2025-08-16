import express from 'express';
import configViewEngine from './config/configEngine.js';
import routes from './routes/web.js';
import cronJobContronler from './controllers/cronJobContronler.js';
import socketIoController from './controllers/socketIoController.js';
import dotenv from "dotenv";
dotenv.config();
import cookieParser from 'cookie-parser';

const app = express();
import http from 'http';
import { Server as SocketIoServer } from 'socket.io';

const server = http.createServer(app);
const io = new SocketIoServer(server);


const port = process.env.PORT || 6262;

app.use(cookieParser());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// setup viewEngine
configViewEngine(app);
// init Web Routes
routes.initWebRouter(app);

// Cron game 1 Phut 
cronJobContronler.cronJobGame1p(io);

// Check xem ai connect vào sever 
socketIoController.sendMessageAdmin(io);

// app.all('*', (req, res) => {
//     return res.render("404.ejs"); 
// });


process.on('uncaughtException', (err) => {
  console.error('There was an uncaught error', err);
  process.exit(1); // Exit with failure code after logging the error
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Optional: Add logic to exit or handle error
});

server.listen(port, () => {
    console.log("Connected success port: " + port);
});

