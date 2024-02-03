const { faker } = require('@faker-js/faker');
const mysql = require('mysql2');
const express = require("express");
const app = express();

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'Bytee',
    password: '1302'
  });

// NOTE: EDITABLE CODE YAHA SE

let getRandomUser = () => {
    return [
      faker.internet.email(),
      faker.person.firstName(),
      faker.person.lastName(),
      faker.internet.password(),
    ];
};
console.log(getRandomUser());

//Saving user info from sign up

app.post("/signup", (req, res) => {
    const { email_id, first_name, last_name, password_, tags_id, description, price, avatar } = req.body;

    if (!email_id || !first_name || !last_name || !password_) {
        return res.status(400).send("All fields are required");
    }
    const qMainDB = 'INSERT INTO maindatabase (email_id, first_name, last_name, password_) VALUES (?, ?, ?, ?)';
    const qUserDB = 'INSERT INTO userdatabase (email_id, first_name, last_name, tags_id, description, price, avatar) VALUES (?, ?, ?, ?, ?, ?, ?)';
    
    try {
        connection.beginTransaction(function(err) {
            if (err) throw err;
            
            // Insert into maindatabase
            connection.query(qMainDB, [email_id, first_name, last_name, password_], function(err, result) {
                if (err) {
                    connection.rollback(function() {
                        throw err;
                    });
                }
                
                const mainUserId = result.insertId; // ID of the inserted user in maindatabase
                
                // Insert into userdatabase
                connection.query(qUserDB, [email_id, first_name, last_name, tags_id, description, price, avatar], function(err, result) {
                    if (err) {
                        connection.rollback(function() {
                            throw err;
                        });
                    }
                    
                    connection.commit(function(err) {
                        if (err) {
                            connection.rollback(function() {
                                throw err;
                            });
                        }
                        console.log("Transaction Complete.");
                        res.send("User registered successfully");
                    });
                });
            });
        });
    } catch (err) {
        console.log(err);
        res.status(500).send("Error in user registration");
    }
});


//Log in query

app.post("/login", (req, res) => {
    const { email_id , password_ } = req.body;
    // Query the database to check if the user exists with the provided credentials
    const q = 'SELECT * FROM maindatabase WHERE email = ? AND password = ?';
    try {
        connection.query(q, [email_id, password_], (err, result) => {
            if (err) throw err;
            if (result.length > 0) {
                console.log("Login successful");
                res.send("Login successful");
            } else {
                console.log("Invalid email or password");
                res.status(401).send("Invalid email or password");
            }
        });
    } catch (err) {
        console.log(err);
        res.status(500).send("Error in login");
    }
});


//Fetch User based on tags/first name/ last name in the userdatabase
app.get("/user", (req, res) => {
    let searchQuery = req.query.q; // Assuming the search query is passed as a query parameter
    let q = 'SELECT * FROM userdatabase WHERE tags LIKE ? OR first_name LIKE ? OR last_name LIKE ?';
    let searchParam = `%${searchQuery}%`; // Adding '%' to perform a partial match
    
    try {
        connection.query(q, [searchParam, searchParam, searchParam], (err, result) => {
            if (err) throw err;
            console.log(result);
            res.send(result);
        });
    } catch (err) {
        console.log(err);
        res.status(500).send("Error in fetching users");
    }
});



app.listen("8080", () => {
    console.log("server is listening to port 8080");
});