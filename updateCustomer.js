'use strict';

const mysql = require('mysql');
const { SecretsManagerClient, GetSecretValueCommand } = require("@aws-sdk/client-secrets-manager");

const secretsManagerClient = new SecretsManagerClient();

const getDbCredentials = async (secretName) => {
    const command = new GetSecretValueCommand({ SecretId: secretName });
    const response = await secretsManagerClient.send(command);
    const secretValue = JSON.parse(response.SecretString);
    return {
        user: secretValue.username,
        password: secretValue.password,
        host: secretValue.host
    };
};

const connectToDatabase = async () => {
    const dbCredentials = await getDbCredentials(process.env.SECRET_NAME);
    return mysql.createConnection({
        host: dbCredentials.host,
        user: dbCredentials.user,
        password: dbCredentials.password,
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
    const { customer_id } = event.pathParameters;

    try {
        const connection = await connectToDatabase();

        const query = 'UPDATE crm_customers SET first_name = ?, last_name = ?, email = ?, phone = ?, address = ?, city = ?, state = ?, postal_code = ?, country = ? WHERE customer_id = ?';
        const values = [first_name, last_name, email, phone, address, city, state, postal_code, country, customer_id];

        const results = await executeQuery(connection, query, values);

        console.log('Query executed successfully:', results);

        return {
            statusCode: 200,
            body: JSON.stringify({ customer_id, ...body })
        };
    } catch (error) {
        console.error('Error executing query:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
