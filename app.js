// Load environment variables in development
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// Express & Core Modules
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

// Models & Routes
const User = require("./models/user");
const listingRouter = require("./routes/listing");
const reviewRouter = require("./routes/review");
const userRouter = require("./routes/user");
const ExpressError = require("./utils/ExpressError");

const app = express();

// Database connection
const dbUrl = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/wanderlust";

mongoose.connect(dbUrl)
  .then(() => console.log("Connected to DB"))
  .catch(err => console.log("DB connection error:", err));

// EJS setup
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// Session & Flash
const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: { secret: process.env.SECRET || "thisshouldbeabettersecret" },
  touchAfter: 24 * 3600
});

store.on("error", (err) => console.log("Mongo Session Store Error:", err));

const sessionOptions = {
  store,
  secret: process.env.SECRET || "thisshouldbeabettersecret",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000
  }
};

app.use(session(sessionOptions));
app.use(flash());

// Passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Make variables available to all templates
app.use((req, res, next) => {
  res.locals.currUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.MAP_TOKEN = process.env.MAP_TOKEN; // MapTiler token
  next();
});

// Routes
app.use("/", userRouter);
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);

// Home route
app.get("/", (req, res) => {
  res.redirect("/listings");
});

// 404 handler
app.all((req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

// Error handler
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).send(message);
});

// Start server
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

