/**
 * Name: Emily Du
 * Date: October 24, 2023
 *
 * This is the app.js file for our final project. It consists the endpoints for our website such
 * as getting makeup products and its data, user information, and allowing users to create an
 * account and log in.
 */

"use strict";

const express = require('express');
const app = express();
const multer = require('multer');
const sqlite3 = require('sqlite3');
const sqlite = require('sqlite');

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(multer().none());

const USER_ERROR = 400;
const SERVER_ERROR = 500;
const USER_PORT = 8000;
const SERVER_ERROR_MSG = 'An error occurred on the server. Try again later.';
const YIKES_USER = 'Yikes. User does not exist.';
const MISSING_PARAMS = 'Missing one or more of the required params.';

// Defines the route to retrieve makeup products based on their category
app.get("/category/:category", async function(req, res) {
  if (!req.params.category) {
    res.status(USER_ERROR).type('text')
      .send(MISSING_PARAMS);
  } else {
    try {
      let validCategories = ["Face", "Cheeks", "Eyes", "Lips"];
      let db = await getDBConnection();
      if (validCategories.includes(req.params.category)) {
        let query = "SELECT * FROM Makeup_Products WHERE Category = ?";
        let result = await db.all(query, req.params.category);
        res.json(result);
      } else if (req.params.category === 'All') {
        let result = await db.all("SELECT * FROM Makeup_Products");
        res.json(result);
      } else if (req.params.category === 'New') {
        let query = "SELECT * FROM Makeup_Products WHERE ReleaseDate >= date('now', '-1 month')";
        let result = await db.all(query);
        res.json(result);
      } else {
        res.status(USER_ERROR).type("text")
          .send('Not a valid category.');
      }
      await db.close();
    } catch (err) {
      res.status(SERVER_ERROR).type("text")
        .send(SERVER_ERROR_MSG);
    }
  }
});

// Defines the search for makeup products based on the search term
app.get("/search/:term", async function(req, res) {
  let searchTerm = req.params['term'];
  if (!searchTerm) {
    res.status(USER_ERROR).type('text')
      .send(MISSING_PARAMS);
  } else {
    try {
      let result;
      let db = await getDBConnection();
      let query = "SELECT * FROM Makeup_Products WHERE Name LIKE ?";
      result = await db.all(query, "%" + searchTerm + "%");
      if (result.length === 0) {
        query = "SELECT * FROM Makeup_Products WHERE Brand LIKE ?";
        result = await db.all(query, "%" + searchTerm + "%");
      }
      await db.close();
      res.json(result);
    } catch (err) {
      res.status(SERVER_ERROR).type("text")
        .send(SERVER_ERROR_MSG);
    }
  }
});

// This defines the route to place an order for the user
app.post("/user/place-order/:userID", async function(req, res) {
  if (!req.params['userID'] || !JSON.parse(req.body.orderItems)) {
    res.status(USER_ERROR).type("text")
      .send(MISSING_PARAMS);
  } else if (!await doesUserExist(req.params['userID'])) {
    res.status(USER_ERROR).type("text")
      .send(YIKES_USER);
  } else if (!await areProductsInStock(JSON.parse(req.body.orderItems))) {
    res.status(USER_ERROR).type("text")
      .send('One or more of the products are out of stock.');
  } else if (await overBalance(JSON.parse(req.body.orderItems), req.params['userID'])) {
    res.status(USER_ERROR).type("text")
      .send('You do not have enough money in your balance to purchase these items.');
  } else {
    try {
      let db = await getDBConnection();
      let totalPrice = await calculateTotal(JSON.parse(req.body.orderItems));
      let newOrderID = await insertOrders(req.params['userID'], JSON.parse(req.body.orderItems));
      let updateUserBalance = "UPDATE Users SET Bank = Bank - ? WHERE UserID = ?";
      await db.run(updateUserBalance, totalPrice, req.params['userID']);
      await db.close();
      res.type("text")
        .send(`Order placed successfully! Confirmation Number: #Order${newOrderID}`);
    } catch (err) {
      res.status(SERVER_ERROR).type("text")
        .send(SERVER_ERROR_MSG);
    }
  }
});

// This defines the route to retrieve detailed information about a specific makeup product
app.get('/product/:product', async function(req, res) {
  let productID = req.params['product'];
  if (!productID) {
    res.status(USER_ERROR).type('text')
      .send(MISSING_PARAMS);
  } else {
    try {
      let qry = 'SELECT Name, Brand, Price, Description, Image ' +
      'FROM Makeup_Products WHERE ProductID = ?';
      let db = await getDBConnection();
      let results = await db.get(qry, productID);
      await db.close();
      if (results) {
        res.json(results);
      } else {
        res.status(USER_ERROR).type('text')
          .send('Product does not exist.');
      }
    } catch (err) {
      res.status(SERVER_ERROR).type('text')
        .send(SERVER_ERROR_MSG);
    }
  }
});

// This defines the route to create a new account for a new user
app.post('/sign-up', async function(req, res) {
  let username = req.body.username;
  let password = req.body.password;
  let name = req.body.name;
  let email = req.body.email;
  if (!username || !password || !name || !email) {
    res.status(USER_ERROR).type('text')
      .send(MISSING_PARAMS);
  } else if (await isUsernameTaken(username) === null || await isEmailTaken(email) === null) {
    res.status(SERVER_ERROR).type('text')
      .send(SERVER_ERROR_MSG);
  } else if (await isUsernameTaken(username) || await isEmailTaken(email)) {
    res.status(USER_ERROR).type('text')
      .send('Username and/or email is already taken.');
  } else { // Else, create new account
    try {
      let qry = 'INSERT INTO Users (Username, Password, Name, Email) VALUES (?, ?, ?, ?)';
      let db = await getDBConnection();
      await db.run(qry, username, password, name, email);
      await db.close();
      res.type('text')
        .send('Successfully created a new user!');
    } catch (err) {
      res.status(SERVER_ERROR).type('text')
        .send(SERVER_ERROR_MSG);
    }
  }
});

// This defines the route to check if both the username and password are provided
app.post('/log-in', async function(req, res) {
  let username = req.body.username;
  let password = req.body.password;
  if (!username || !password) {
    res.status(USER_ERROR).type('text')
      .send(MISSING_PARAMS);
  } else {
    try {
      let qry = 'SELECT UserID FROM Users WHERE Username = ? AND Password = ?';
      let db = await getDBConnection();
      let results = await db.all(qry, username, password);
      await db.close();
      if (results.length > 0) {
        res.json(results);
      } else {
        res.status(USER_ERROR).type('text')
          .send('Username and/or password is incorrect.');
      }
    } catch (err) {
      res.status(SERVER_ERROR).type('text')
        .send(SERVER_ERROR_MSG);
    }
  }
});

// Get the user account details
app.get("/user/details/:userID", async (req, res) => {
  let userID = req.params.userID;
  if (!userID) {
    res.status(USER_ERROR).type('text')
      .send(MISSING_PARAMS);
  } else if (!await doesUserExist(userID)) {
    res.status(USER_ERROR).type("text")
      .send(YIKES_USER);
  } else {
    try {
      let db = await getDBConnection();
      let query = "SELECT Email, Name, Bank FROM Users WHERE UserID = ?";
      let user = await db.get(query, userID);
      res.json(user);
      await db.close();
    } catch (err) {
      res.status(SERVER_ERROR).type('text')
        .send(SERVER_ERROR_MSG);
    }
  }
});

// This defines the route to retrieve the user's account information based on the provided userID
app.get('/user/past-orders/:userID', async function(req, res) {
  if (!req.params["userID"]) {
    res.status(USER_ERROR).type('text')
      .send(MISSING_PARAMS);
  } else if (!await doesUserExist(req.params["userID"])) {
    res.status(USER_ERROR).type("text")
      .send(YIKES_USER);
  } else {
    try {
      let qryOrders = "SELECT OrderID FROM Orders WHERE UserID = ? ORDER BY OrderID desc";
      let qryProducts = 'SELECT mp.ProductID, mp.Name, mp.Brand, mp.Price, mp.Image FROM ' +
      'Order_Products op JOIN Makeup_Products mp ON op.ProductID = mp.ProductID ' +
      'WHERE op.OrderID = ?';
      let db = await getDBConnection();
      let orders = await db.all(qryOrders, req.params["userID"]);
      for (let i = 0; i < orders.length; i++) {
        let products = await db.all(qryProducts, orders[i].OrderID);
        orders[i].products = products;
      }
      await db.close();
      res.json(orders);
    } catch (err) {
      res.status(SERVER_ERROR).type('text')
        .send(SERVER_ERROR_MSG);
    }
  }
});

/**
 * This helper function checks if the user exists in the database based on the provided userID
 * @param {Integer} userID - The unique identifier of the user to check
 * @returns {Boolean} - returns a promise based on if the user exists or not
 */
async function doesUserExist(userID) {
  try {
    let qry = 'SELECT * FROM Users WHERE UserID = ?';
    let db = await getDBConnection();
    let results = await db.all(qry, userID);
    await db.close();
    return results.length > 0;
  } catch (err) {
    return null;
  }
}

/**
 * This helper function checks if the given username is already taken by a different user
 * @param {String} username - The username that needs to be checked
 * @returns {Boolean} - Returns a promise based on if the username is taken or not
 */
async function isUsernameTaken(username) {
  try {
    let qry = 'SELECT * FROM Users WHERE Username = ?';
    let db = await getDBConnection();
    let results = await db.all(qry, username);
    await db.close();
    return results.length > 0;
  } catch (err) {
    return null;
  }
}

/**
 * This helper function checks if the email has already been taken by a different user
 * @param {String} email - The email that needs to be check
 * @returns {Boolean} - returns a promise based on if the email is taken or not
 */
async function isEmailTaken(email) {
  try {
    let qry = 'SELECT * FROM Users WHERE Email = ?';
    let db = await getDBConnection();
    let results = await db.all(qry, email);
    await db.close();
    return results.length > 0;
  } catch (err) {
    return null;
  }
}

/**
 * This helper function retrieves the bank balance of a user
 * @param {Integer} userID - The specified user ID whose bank balance is to be retrieved
 * @returns {Integer} - Returns the bank balance of the user
 */
async function getUserBalance(userID) {
  try {
    let db = await getDBConnection();
    let userBalanceQuery = "SELECT Bank FROM Users WHERE UserID = ?";
    let balance = await db.get(userBalanceQuery, userID);
    await db.close();
    return balance.Bank;
  } catch (err) {
    return null;
  }
}

/**
 * This helper function checks if the current product is in stock or not
 * @param {Array} orderItems - an array of productIDs
 */
async function areProductsInStock(orderItems) {
  try {
    for (let item of orderItems) {
      let db = await getDBConnection();
      let productQuery = "SELECT Quantity FROM Makeup_Products WHERE ProductID = ?";
      let product = await db.get(productQuery, item);
      await db.close();
      return product.Quantity > 0;
    }
  } catch (err) {
    return null;
  }
}

/**
 * This helper function checks if the total amount of the products is over the balance
 * @param {Array} orderItems - an array of productIDs
 * @param {String} userID - The unique identifier of the user
 */
async function overBalance(orderItems, userID) {
  let totalPrice = 0;
  let userBalance = await getUserBalance(userID);
  try {
    for (let item of orderItems) {
      let db = await getDBConnection();
      let productQuery = "SELECT Price FROM Makeup_Products WHERE ProductID = ?";
      let product = await db.get(productQuery, item);
      totalPrice += product.Price;
      await db.close();
      return totalPrice > userBalance;
    }
  } catch (err) {
    return null;
  }
}

/**
 * This helper function calculates the total price of an order
 * @param {Array} orderItems - an array of productIDs
 * @returns {Integer} - Returns a promise that resolves to be the total price of the order items
 */
async function calculateTotal(orderItems) {
  let totalPrice = 0;
  let db = await getDBConnection();
  for (let item of orderItems) {
    let productQuery = "SELECT Price FROM Makeup_Products WHERE ProductID = ?";
    let product = await db.get(productQuery, item);
    totalPrice += product.Price;
  }
  await db.close();
  return totalPrice;
}

/**
 * This helper function inserts a new order into the database and updates the products
 * @param {String} userID - The unique identifier of the user placing the order
 * @param {Array} orderItems - An array of productIDs in the order
 * @returns {Integer} - Returns the ID of the newly created order
 */
async function insertOrders(userID, orderItems) {
  let insertOrder = "INSERT INTO Orders (UserID) VALUES (?)";
  let db = await getDBConnection();
  let orderResult = await db.run(insertOrder, userID);
  let newOrderID = orderResult.lastID;
  for (let item of orderItems) {
    let insertProducts = "INSERT INTO Order_Products (OrderID, ProductID) VALUES (?, ?)";
    await db.run(insertProducts, newOrderID, item);
    let updateProducts = "UPDATE Makeup_Products SET Quantity = Quantity - 1 WHERE ProductID = ?";
    await db.run(updateProducts, item);
  }
  await db.close();
  return newOrderID;
}

/**
 * Establishes a database connection to a database and returns the database object.
 * Any errors that occur during connection should be caught in the function
 * that calls this one.
 * @returns {Object} - The database object for the connection.
 */
async function getDBConnection() {
  const db = await sqlite.open({
    filename: 'Makeup-Products.db',
    driver: sqlite3.Database
  });
  return db;
}

app.use(express.static("public"));
const PORT = process.env.PORT || USER_PORT;
app.listen(PORT);
