'use strict';

const mysql = require('mysql');
const { SecretsManagerClient, GetSecretValueCommand } = require("@aws-sdk/client-secrets-manager");

const secretsManagerClient = new SecretsManagerClient();

const getDbCredentials = async (secretName) => {
    const command = new GetSecretValueCommand({ SecretId: secretName });
    const response = await secretsManagerClient.send(command);
    const secretValue = JSON.parse(response.SecretString);
    return {
        host: secretValue.host,
        user: secretValue.username,
        password: secretValue.password,
        database: secretValue.dbname
    };
};

const connectToDatabase = async () => {
    const dbCredentials = await getDbCredentials(process.env.SECRET_NAME);
    return mysql.createConnection({
        host: dbCredentials.host,
        user: dbCredentials.user,
        password: dbCredentials.password,
        database: dbCredentials.database
    });
};

module.exports.createCustomer = async (event) => {
    console.log('Received event:', JSON.stringify(event, null, 2));
    const body = JSON.parse(event.body);
    const { first_name, last_name, email, phone, address, city, state, postal_code, country } = body;

    const connection = await connectToDatabase();

    const query = 'INSERT INTO crm_customers (first_name, last_name, email, phone, address, city, state, postal_code, country) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const values = [first_name, last_name, email, phone, address, city, state, postal_code, country];

    return new Promise((resolve, reject) => {
        connection.query(query, values, (error, results) => {
            connection.end(); // Close the connection
            if (error) {
                console.error('Error executing query:', error);
                reject({
                    statusCode: 500,
                    body: JSON.stringify({ error: error.message })
                });
            } else {
                console.log('Query executed successfully:', results);
                resolve({
                    statusCode: 201,
                    body: JSON.stringify({ customer_id: results.insertId, ...body })
                });
            }
        });
    });
};

module.exports.getCustomers = async (event) => {
    console.log('Received event:', JSON.stringify(event, null, 2));
    const connection = await connectToDatabase();

    const query = 'SELECT * FROM crm_customers';

    return new Promise((resolve, reject) => {
        connection.query(query, (error, results) => {
            connection.end(); // Close the connection
            if (error) {
                console.error('Error executing query:', error);
                reject({
                    statusCode: 500,
                    body: JSON.stringify({ error: error.message })
                });
            } else {
                console.log('Query executed successfully:', results);
                resolve({
                    statusCode: 200,
                    body: JSON.stringify(results)
                });
            }
        });
    });
};

module.exports.updateCustomer = async (event) => {
    console.log('Received event:', JSON.stringify(event, null, 2));
    const body = JSON.parse(event.body);
    const { first_name, last_name, email, phone, address, city, state, postal_code, country } = body;
    const { customer_id } = event.pathParameters;

    const connection = await connectToDatabase();

    const query = 'UPDATE crm_customers SET first_name = ?, last_name = ?, email = ?, phone = ?, address = ?, city = ?, state = ?, postal_code = ?, country = ? WHERE customer_id = ?';
    const values = [first_name, last_name, email, phone, address, city, state, postal_code, country, customer_id];

    return new Promise((resolve, reject) => {
        connection.query(query, values, (error, results) => {
            connection.end(); // Close the connection
            if (error) {
                console.error('Error executing query:', error);
                reject({
                    statusCode: 500,
                    body: JSON.stringify({ error: error.message })
                });
            } else {
                console.log('Query executed successfully:', results);
                resolve({
                    statusCode: 200,
                    body: JSON.stringify({ customer_id, ...body })
                });
            }
        });
    });
};
