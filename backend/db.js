// backend/db.js
const { Pool } = require('pg');

// Configure your PostgreSQL connection
const pool = new Pool({
    user: 'postgres',    // <--- REPLACE with your PostgreSQL username
    host: 'localhost',
    database: 'mytaskdb',        // <--- REPLACE with your database name
    password: '123',// <--- REPLACE with your PostgreSQL password
    port: 5432,                  // Default PostgreSQL port
});

// Optional: Log connection errors
pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1); // Exit the process if a critical error occurs
});

module.exports = {
    // A wrapper function to execute queries
    query: (text, params) => {
        console.log('EXECUTING QUERY:', text, params || '');
        return pool.query(text, params);
    },
};