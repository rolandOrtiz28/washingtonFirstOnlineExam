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

// module.exports.validateCampground = (req, res, next) => {
//     const { error } = campgroundSchema.validate(req.body);
//     if (error) {
//         const msg = error.details.map(el => el.message).join(',')
//         throw new ExpressError(msg, 400)
//     } else {
//         next();
//     }

// }



// module.exports.isOwner = async (req, res, next) => {
//     const { id } = req.params;
//     const campground = await Campground.findById(id);
//     if (!campground.owner.equals(req.user._id)) {
//         req.flash('error', 'Authorized Person Only');
//         return res.redirect(/campgrounds/${id});
//     }
//     next();
// }


// module.exports.isReviewOwner = async (req, res, next) => {
//     const { id, reviewId } = req.params;
//     const review = await Review.findById(reviewId);
//     if (!review.owner.equals(req.user._id)) {
//         req.flash('error', 'Authorized Person Only');
//         return res.redirect(/campgrounds/${id});
//     }
//     next();
// }

// module.exports.validateReview = (req, res, next) => {
//     const { error } = reviewSchema.validate(req.body);
//     if (error) {
//         const msg = error.details.map(el => el.message).join('.')
//         throw new ExpressError(msg, 400)
//     } else {
//         next();
//     }
// }