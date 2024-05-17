const express = require("express");
const router = express.Router();
const catchAsync = require('../utils/CatchAsync')
const User = require('../model/user')
const Exam = require('../model/examination')
const passport = require('passport')
const {isLoggedIn} = require('../middleware')




router.get('/exam/confirmation/:id', isLoggedIn,async (req,res)=>{
 try {
         const exam = await Exam.findById(req.params.id);
        res.render('student/confirmation', { exam });
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
})

//Exam process
router.get('/show', isLoggedIn,async (req, res) => {
    try {

        const studentLevel = req.query.level; // Assuming level is passed as query parameter

        console.log(studentLevel)

        const exams = await Exam.find({ level: studentLevel, isPublished: true });

        res.render('student/exams', { exams });
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
});

router.get('/exam/:id', isLoggedIn, async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);
        res.render('student/exam', { exam, currentPage: 0 }); // Pass currentPage with value 0
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
});


router.post('/submit-exam', catchAsync(async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).send('Unauthorized');
        }

        const exam = await Exam.findById(req.body.examId);
        if (!exam) {
            return res.status(404).send('Exam not found');
        }

        if (typeof req.body.answers !== 'object') {
            return res.status(400).send('Invalid form data');
        }

        const contentScores = {};

        let overallScore = 0;
        for (const contentAnswersKey in req.body.answers) {
            const [contentIndex, questionIndex] = contentAnswersKey.split('_').map(Number);
            const content = exam.contents[contentIndex];

            if (!content) {
                continue;
            }

            const question = content.questions[questionIndex];
            if (!question) {
                continue;
            }

            const submittedAnswer = req.body.answers[contentAnswersKey];
            const correctAnswer = question.correctAnswer;

            if (!contentScores[content._id]) {
                contentScores[content._id] = {
                    totalScore: 0,
                    questions: []
                };
            }

            const questionResult = {
                question: question.question,
                submittedAnswer,
                correctAnswer,
                isCorrect: submittedAnswer === correctAnswer
            };

            contentScores[content._id].questions.push(questionResult);

            if (submittedAnswer === correctAnswer) {
                const contentScore = question.points;
                overallScore += contentScore;
                contentScores[content._id].totalScore += contentScore;
            }
        }

        const studentId = req.user._id;

        const updatedStudent = await User.findOneAndUpdate(
            { _id: studentId },
            {
                $push: { examScores: { examId: exam._id, score: overallScore } },
                $set: { contentScores: contentScores }
            },
            { new: true }
        );

        console.log('Updated Student:', updatedStudent);

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
        const {  email ,username, password, name, level, time, role } = req.body;

        // Your validation code

        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
        if (!passwordRegex.test(password)) {
            req.flash('error', 'Password must contain at least one uppercase letter, one digit, and be at least 8 characters long');
            return res.redirect('/');
        }

        const existingUsername = await User.findOne({ username })
        if (existingUsername) {
            req.flash('error', 'A user with the given username is already registered')
            return res.redirect('/');
        }


        // Create a new user object without passing the password directly
        const user = new User({ email ,username, password, name, level, time, role });
        const registeredUser = await User.register(user, password);

        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', `Welcome ${username}`);
            if (role === 'student') {
                res.redirect(`/student/show?level=${user.level}`);
            } else {
                res.redirect('/examdashboard');
            }
        });
    } catch (e) {
        console.log('error', e.message);
        res.redirect('/');
    }
}));


router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/' }), async (req, res) => {
    try {
        const { username } = req.body;
        const user = await User.findOne({ username });

        if (!user) {
            req.flash('error', 'User not found');
            return res.redirect('/login');
        }

        req.flash('success', `Welcome ${username}`);
        if (user.role === 'student') {
            res.redirect(`/student/show?level=${user.level}`);
        } else {
            res.redirect('/examdashboard');
        }
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