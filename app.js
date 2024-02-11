// Import required modules
const path = require('path');
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const app = express();
const jwt = require('jsonwebtoken');
// Create a MySQL connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'node_crud'
});

// Connect to the MySQL database
connection.connect(function (error) {
    if (!!error) console.log(error);
    else console.log('Database Connected!');
});

// Set the views directory
app.set('views', path.join(__dirname, 'views'));

// Set the view engine to EJS (Embedded JavaScript)
app.set('view engine', 'ejs');

// Middleware to parse JSON and URL-encoded bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

function verifyToken(req, res, next) {
    const token = req.header('Authorization');
    let keyValue = "secret-key";
    if (!token) {
        return res.status(401).json({error: 'Access denied. No token provided'});
    }

    jwt.verify(token, keyValue, (err, decoded) => {
        if (err) {
            return res.status(401).json({error: 'Invalid token'});
        }
        req.user = decoded;
        next();
    })
}

// Login API
app.post('/generate-token', (req, res) => {
    const {key} = req.body;
    let keyValue = "secret-key";

    // Replace this with your authentication logic (e.g., checking email and password)
    if (key === keyValue) {
        const user = {key}; // You can customize the user object

        // Create a JWT token with a secret key (replace 'your-secret-key' with a strong secret)
        const token = jwt.sign(user, keyValue, {expiresIn: '1h'});

        res.status(200).json({token});
    } else {
        res.status(401).json({error: 'Invalid credentials'});
    }
});


// Handle requests to the root path
app.get('/', (req, res) => {
    let sql = "SELECT * FROM users";
    let query = connection.query(sql, (err, rows) => {
        if (err) throw err;
        // Render the 'user_index' view with data from the 'users' table
        res.render('user_index', {
            title: 'CRUD Operation using NodeJS / ExpressJS / MySQL',
            users: rows
        });
    });
});

// Handle requests to the '/add' path
app.get('/add', (req, res) => {
    // Render the 'user_add' view
    res.render('user_add', {
        title: 'CRUD Operation using NodeJS / ExpressJS / MySQL'
    });
});

// Handle POST requests to the '/save' path
app.post('/save', verifyToken, (req, res) => {
    let data = {name: req.body.name, email_id: req.body.email, phone_no: req.body.phone_no};
    let sql = "INSERT INTO users SET ?";
    let query = connection.query(sql, data, (err, results) => {
        if (err) throw err;
        // Redirect to the root path after saving data
        res.redirect('/');
    });
});

// Handle requests to the '/edit/:userId' path
app.get('/edit/:userId', verifyToken, (req, res) => {
    const userId = req.params.userId;
    let sql = `Select *
               from users
               where id = ${userId}`;
    let query = connection.query(sql, (err, result) => {
        if (err) throw err;
        // Render the 'user_edit' view with data of the specified user
        res.render('user_edit', {
            title: 'CRUD Operation using NodeJS / ExpressJS / MySQL',
            user: result[0]
        });
    });
});

// Handle POST requests to the '/update' path
app.post('/update', verifyToken, (req, res) => {
    const userId = req.body.id;
    let sql = "update users SET name='" + req.body.name + "',  email='" + req.body.email + "',  phone_no='" + req.body.phone_no + "' where id =" + userId;
    let query = connection.query(sql, (err, results) => {
        if (err) throw err;
        // Redirect to the root path after updating data
        res.redirect('/');
    });
});

// Handle requests to the '/delete/:userId' path
app.get('/delete/:userId', verifyToken, (req, res) => {
    const userId = req.params.userId;
    let sql = `DELETE
               from users
               where id = ${userId}`;
    let query = connection.query(sql, (err, result) => {
        if (err) throw err;
        // Redirect to the root path after deleting data
        res.redirect('/');
    });
});

// Start the server and listen on port 3000
app.listen(3000, () => {
    console.log('Server is running at port 3000');
});