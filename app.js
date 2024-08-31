// require("dotenv").config();
// require("./config/connection");
// require("./config/authStrategy");

const express = require("express");
const path = require("node:path");

// const cors = require("cors");
const morgan = require("morgan");
// const helmet = require("helmet");

// const session = require("express-session");
// const passport = require("passport");

// Create an express app
const app = express();
const PORT = process.env.PORT || 8080;

// Morgan Functionality 
app.use(morgan('dev'));

// Adding Path module and EJS to app.js 
app.set('view engine','ejs');
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

//stage routing traffic
//const userRoutes = require('./routes/userRoutes');
//app.use('/', userRoutes);

// Error handling middleware
// Error handling functions have four arguments instead of three: (err, req, res, next)
// This is an example of an "catch-all" error handler
// This has to be the after all the other app.use and routes calls
app.use((err, req, res, next) => {
    if (err) {
        console.log(err)
    }
  
    // Any other error that is not caught anywhere else will be handled here
    return res.status(err.status || 500).json({
      error: { message: err.message || "Internal server error." },
      statusCode: err.status || 500,
    });
  });
 
  app.get("/", (req, res, next) => {
    res.status(200).json({
      success: { message: "Index page works after deployment" },
      statusCode: 200,
    });
  });

  app.get("/users/home", (req, res, next) => {
    res.render('pages/user-home')
  });
  
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}. Use http://localhost:${PORT}/`);
});