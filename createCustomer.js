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
    const body = JSON.parse(event.body);
    const { first_name, last_name, email, phone, address, city, state, postal_code, country } = body;

    try {
        const connection = connectToDatabase();

        const query = 'INSERT INTO crm_customers (first_name, last_name, email, phone, address, city, state, postal_code, country) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
        const values = [first_name, last_name, email, phone, address, city, state, postal_code, country];

        const results = await executeQuery(connection, query, values);

        console.log('Query executed successfully:', results);

        return {
            statusCode: 201,
            body: JSON.stringify({ customer_id: results.insertId, ...body })
        };
    } catch (error) {
        console.error('Error executing query:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
