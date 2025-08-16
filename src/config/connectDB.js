// import mysql from 'mysql2/promise';

// const connection = mysql.createPool({
//     host: 'localhost',
//     user: 'lucky',
//     password: 'lucky',
//     database: 'lucky'
// });

// export default connection;


import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

console.log(process.env.DB_HOST)

const connection = mysql.createPool({
    host: process.env.DB_HOST,      // Hostname from the .env file
    user: process.env.DB_USER,      // Username from the .env file
    password: process.env.DB_PASSWORD,  // Password from the .env file
    database: process.env.DB_NAME,  // Database name from the .env file
    waitForConnections: true,       // Recommended for production
    connectionLimit: 10,            // Limit the number of simultaneous connections
    queueLimit: 0                  // No limit on the connection queue
});

export default connection;
