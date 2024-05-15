// const { campgroundSchema, reviewSchema } = require('./schemas.js');
// const ExpressError = require('./utils/ExpressError');
// const Campground = require('./models/campground');
// const Review = require('./models/review')


module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.gobackTo = req.originalUrl
        req.flash('error', 'Oppps! Restricted');
        return res.redirect('/')
    }
    next();
}

module.exports.authMiddleware = (req, res, next) => {

    if (req.session.user) {
        next(); // User is authenticated, proceed to next middleware
    } else {
        res.status(401).send('Unauthenticated');
    }
};

// Middleware to check if the user is a teacher
module.exports.isTeacher =(req, res, next) => {
    if (req.isAuthenticated() && req.user.role === 'teacher') {
        // User is a teacher, allow access to the route
        return next();
    }
    // User is not a teacher, redirect or show an error
    res.status(403).send('Forbidden');
}

// Middleware to check if the user is a student
module.exports.isStudent =(req, res, next) => {
    if (req.isAuthenticated() && req.user.role === 'student') {
        // User is a student, allow access to the route
        return next();
    }
    // User is not a student, redirect or show an error
    res.status(403).send('Forbidden');
}

module.exports.isAdminOrTeacher = (req, res, next) => {
    if (req.isAuthenticated() && (req.user.isAdmin || req.user.role === 'teacher')) {
        // User is either admin or teacher, allow access to the route
        return next();
    }
    req.flash('error', 'Oppps! Restricted');
    res.redirect('/')
}


module.exports.isAdmin = async (req, res, next) => {
    try {
        const currentUser = req.user;

        if (!currentUser || !currentUser.isAdmin) {
            req.flash('error', 'authorized person only!');
            return res.redirect('/');
        } else {
            next();
        }
    } catch (error) {
        if (error.details && Array.isArray(error.details)) {
            const msg = error.details.map((el) => el.message).join(',');
            throw new ExpressError(msg, 500);
        } else {
            throw error;
        }
    }
};