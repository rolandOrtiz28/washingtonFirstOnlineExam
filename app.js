const dotenv = require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path')
const app = express();
const ejsMate = require('ejs-mate')
const dbUrl = process.env.DB_URL ||'mongodb://127.0.0.1:27017/wfsOnlineExamination'
const PORT = process.env.PORT || 3000;
const session = require('express-session')
const MongoDBStore = require("connect-mongo");
const passport = require('passport');
const ExpressError = require('./utils/ExpressError')
const flash = require('connect-flash')
const Teacher = require('./model/teacher')
const LocalStrategy = require('passport-local')
const expressLayouts = require('express-ejs-layouts');

// MongoDB connection
mongoose.connect(dbUrl, {});
const db = mongoose.connection;
db.on("error", console.error.bind(console, " connection error:"));
db.once("open", () => {
    console.log("Database Connected");
})

// models




//routes
const teacherRoute = require('./routes/teacher')
const studentRoute = require('./routes/student')

const secret = process.env.SESSION_SECRET


const sessionConfig = {
    secret,
    name: '_washingtonFirst',
    resave: false,
    saveUninitialized: true,
    store: MongoDBStore.create({
        mongoUrl: dbUrl,
        touchAfter: 24 * 3600 // time period in seconds
    }),
    cookie: {
        httpOnly: true,
        // secure:true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}


app.set('view engine', 'ejs');
app.engine('ejs', ejsMate);
app.set('layout', 'layouts/boilerplate');
app.use(expressLayouts);
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'models')));
app.use(session(sessionConfig))

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(Teacher.authenticate()));


passport.serializeUser(function (user, cb) {
    cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
    cb(null, obj);
});
app.use(flash());

app.use((req, res, next) => {

    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})


app.get('/', (req, res)=>{
res.render('home')
})

app.use('/', teacherRoute)
app.use('/student', studentRoute)



app.use(bodyParser.json());

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something went wrong!';
    res.status(statusCode).render('error', { err });
});


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
