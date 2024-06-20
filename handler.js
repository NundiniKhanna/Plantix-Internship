'use strict';

const mysql = require('mysql');

const connectToDatabase = () => {
  return mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });
};

module.exports.createCustomer = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));
  const body = JSON.parse(event.body);
  const { first_name, last_name, email, phone, address, city, state, postal_code, country } = body;

  const connection = connectToDatabase();

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
  const connection = connectToDatabase();

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

  const connection = connectToDatabase();

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
