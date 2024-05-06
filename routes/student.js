const express = require("express");
const router = express.Router();
const catchAsync = require('../utils/CatchAsync')
const Student = require('../model/student')
const Students = require('../model/students')
const Exam = require('../model/examination')
const passport = require('passport')
const {isLoggedIn} = require('../middleware')
const {authMiddleware} = require('../middleware')


router.get('/exam/confirmation/:id', async (req,res)=>{
 try {
         const exam = await Exam.findById(req.params.id);
        res.render('student/exam', { exam });
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
})

//Exam process
router.get('/show', isLoggedIn,async (req, res) => {
    try {

        const studentLevel = req.query.level; // Assuming level is passed as query parameter

        const exams = await Exam.find({ level: studentLevel, isPublished: true });

        res.render('student/exams', { exams });
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
});

router.get('/exam/:id', isLoggedIn,async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);
        res.render('student/exam', { exam });
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
});


router.post('/submit-exam',  catchAsync(async (req, res) => {
    try {
        // Ensure req.user exists and contains user information
        if (!req.user || !req.user._id) {
            return res.status(401).send('Unauthorized'); // User is not authenticated
        }

        const exam = await Exam.findById(req.body.examId);
        if (!exam) {
            return res.status(404).send('Exam not found');
        }

        // Check if req.body.answers is an object
        if (typeof req.body.answers !== 'object') {
            return res.status(400).send('Invalid form data'); // Handle invalid form data
        }

        // Calculate score
        let score = 0;
        for (const contentTitle in req.body.answers) {
            const contentAnswers = req.body.answers[contentTitle];
            const content = exam.contents.find(content => content.title === contentTitle);
            if (!content) {
                continue; // Skip if content not found
            }
            content.questions.forEach((question, index) => {
                if (contentAnswers[index] === question.correctAnswer) {
                    score += question.points;
                }
            });
        }

        // Update student's record with exam score
        const studentId = req.user._id;
        console.log('Student ID:', studentId);
       const updatedStudent = await Students.findOneAndUpdate(
    { _id: studentId },
    { $push: { examScores: { examId: exam._id, score: score } } },
    { new: true } // Return the modified document
);

console.log(updatedStudent)
        // Render the exam result template with the calculated score
        res.redirect('/student/thankyou');
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
}));




router.get('/thankyou', (req, res) => {
    res.render('student/thankyou')
})


//Student auth
router.get('/registration', async (req, res) => {
    res.render('student/form')
})
router.get('/login', async (req, res) => {
    res.render('student/login')
})



router.post('/register', catchAsync(async (req, res) => {
    try {
await Students.deleteMany({})
        const { email, username, password, name, age, gender, level, time } = req.body;

        // Password validation
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
        if (!passwordRegex.test(password)) {
            req.flash('error', 'Password must contain at least one uppercase letter, one digit, and be at least 8 characters long');
            return res.redirect('/student/registration');
        }
        const existingUsername = await Students.findOne({ username })
        if (existingUsername) {
            req.flash('error', 'A user with the given username is already registered')
            return res.redirect('/student/registration');
        }
        const existingEmail = await Students.findOne({ email })
        if (existingEmail) {
            req.flash('error', 'A user with the given email is already registered')
            return res.redirect('/student/registration');
        }
        const confirmPassword = req.body['confirm-password'];
        if (password !== confirmPassword) {
            req.flash('error', 'Passwords do not match');
            return res.redirect('/student/registration');
        } else {
            const student = new Students({ email, username, name, age, gender, level, time });
            const registeredUser = await Students.register(student, password);
            req.login(registeredUser, err => {
                if (err) return next(err);
                req.flash('success', `Welcome ${name}`)
                res.redirect(`/student/show?level=${student.level}`)
            })

        }

    } catch (e) {
        console.log('error', e.message);
        res.redirect('/student/registration');
    }
}))


router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/student/registration', keepSessionInfo: true }), async (req, res) => {
    try {
        const { username } = req.body;


        const user = await Students.findOne({ username });

        if (user) {
            user.isLoggedIn = true; // Set isLoggedIn to true
            await user.save();
        }
        req.flash('success', `Welcome ${username}`);
        res.redirect(`/student/show?level=${user.level}`);
    } catch (err) {
        console.log(err.message);
        res.status(500).send('An error occurred during login.');
    }
});


router.get('/logout', (req, res, next) => {
    req.logout(function (err) {
        if (err) { return next(err); }
        req.flash('success', "Goodbye!");
        res.redirect('/');
    });
})

module.exports = router