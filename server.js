const express = require("express");
const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.resolve(__dirname, "public")));

// Set Cookie Parser, sessions and flash
app.use(cookieParser('NotSoSecret'));
app.use(session({
  secret : 'CrozTeK',
  cookie: { maxAge: 60000 },
  resave: true,
  saveUninitialized: true
}));
app.use(flash());

const mailConfig = {
  service: "gmail",
  port: 587,
  secure: false,
  auth: {
    user: "shreelearning.tech@gmail.com",
    pass: "psijctsbpfropysj",
  },
};

const transporter = nodemailer.createTransport(mailConfig);

//render index page
app.get("/", (req, res) => {
  const fullname = req.flash('user');
  res.render("index", {fullname});
});

//send query to mail api
app.post("/sendmail", async (req, res) => {
  //get query from form
  let query = {
    fullname: req.body.fullname,
    number: req.body.number,
    email: req.body.email,
    message: req.body.message,
  };
  if (!query) {
    return res.status(400).send("Query can't be empty!");
  } else {
    try {
      let data = await ejs.renderFile('mail.ejs', {
        query,
      });

      let emailIds = ['pallishreebehera01@gmail.com' ]
      const mailOption = {
        to: emailIds,
        from: "shreelearning.tech@gmail.com",
        subject: "Query from CrozTek",
        html: data,
      };

      transporter.sendMail(mailOption, (err, info) => {
        if (err) {
          console.log("Error in sending mail", err);
        } else {
          console.log("Successfully sent query to mail", info);
        }
      });
      req.flash('user', req.body.fullname);

      res.redirect("/");
    } catch (error) {
      console.log(error)
      res.status(500).json({
        msg: "Oops!!Could not send your query Try again Later.",
        success: false,
      });
    }
  }
});

app.listen(5000, () => {
  console.log("Server is running on port 5000.");
});
