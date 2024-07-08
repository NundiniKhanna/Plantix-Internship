'use strict';

const mysql = require('mysql');

const connectToDatabase = () => {
    return mysql.createConnection({
        host: process.env.db_host,
        user: process.env.db_username,
        password: process.env.db_password,
        database: process.env.DB_NAME
    });
};

const executeQuery = (connection, query, values) => {
    return new Promise((resolve, reject) => {
        connection.query(query, values, (error, results) => {
            connection.end(); // Close the connection
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
};

exports.handler = async (event) => {
    console.log('Received event:', JSON.stringify(event, null, 2));

    try {
        const connection = connectToDatabase();

        const query = 'SELECT * FROM crm_customers';
        const results = await executeQuery(connection, query);

        console.log('Query executed successfully:', results);

        return {
            statusCode: 200,
            body: JSON.stringify(results)
        };
    } catch (error) {
        console.error('Error executing query:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
