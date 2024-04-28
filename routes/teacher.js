const express = require("express");
const router = express.Router();
const Exam = require('../model/examination');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });
const { cloudinary } = require('../cloudinary');
const Teacher = require('../model/teacher')
const catchAsync = require('../utils/CatchAsync')
const passport = require('passport')


router.get('/teacher/registerteacher', (req, res) => {
    res.render('teacher/registerTeacher')
})

router.get('/teacher/login', (req, res) => {
    res.render('teacher/login')
})

router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login', keepSessionInfo: true }), async (req, res) => {
    try {
        const { username } = req.body;


        const user = await Teacher.findOne({ username });
        if (user.isAdmin == false) {
            user.interactions += 1;
            await user.save();
        }
        if (user) {
            user.isLoggedIn = true; // Set isLoggedIn to true
            await user.save();
        }
        req.flash('success', `Welcome Teacher ${username}`);
        res.redirect('/');
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


router.post('/register', catchAsync(async (req, res) => {

    try {
        const { email, username, password } = req.body;

        // Password validation
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
        if (!passwordRegex.test(password)) {
            req.flash('error', 'Password must contain at least one uppercase letter, one digit, and be at least 8 characters long');
            res.redirect('/register');
            return;
        }
        const existingUsername = await Teacher.findOne({ username })
        if (existingUsername) {
            req.flash('error', 'A user with the given username is already registered')
            return res.redirect('/register')
        }
        const existingEmail = await Teacher.findOne({ email })
        if (existingEmail) {
            req.flash('error', 'A user with the given email is already registered')
            return res.redirect('/register')
        }
        const confirmPassword = req.body['confirm-password'];
        if (password !== confirmPassword) {
            req.flash('error', 'Password do not match');
            return res.redirect('/register');
        } else {
            const teacher = new Teacher({ email, username });
            const registeredUser = await Teacher.register(teacher, password);
            req.login(registeredUser, err => {
                if (err) return next(err);
                req.flash('success', `Welcome Teacher ${username}`)
                res.redirect('/')
            })

        }

    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/register');
    }
}));

router.get('/dashboard', (req,res)=>{
    res.render('teacher/dashboard');
});

router.get('/exams', async(req,res)=>{
const exams = await Exam.find({})

res.render('teacher/exams', {exams})
})

router.get('/builder', (req, res) => {
  res.render('teacher/examBuilder');
});

router.post('/builder', async (req, res) => {
  try {
    const { title, term, level, subject, remark, contents } = req.body;
    const newExam = new Exam({
      title,
      term,
      level,
      subject,
      remark,
      contents
    });
console.log(newExam)
    await newExam.save();
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.redirect('/dashboard');
  }
});


// GET route to render the update form
router.get('/exam/update/:id', async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).send('Exam not found');
    }
    res.render('teacher/updateExam', { exam });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});


router.post('/update/:id', async (req, res) => {
  try {
    const { title, term, level, subject, remark, contents } = req.body;
    const exam = await Exam.findByIdAndUpdate(req.params.id, {
      title,
      term,
      level,
      subject,
      remark,
      contents
    });
    if (!exam) {
      return res.status(404).send('Exam not found');
    }
    res.redirect('/exams');
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});




router.get('/exams/start/:id', async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).send('Exam not found');
    }
    res.render('teacher/exam', { exam });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/exams/submit/:id', async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).send('Exam not found');
    }

    // Calculate score
    let score = 0;
    req.body.answers.forEach((answer, index) => {
      if (answer === exam.contents[index].correctAnswer) {
        score += exam.contents[index].points;
      }
    });

    // Update student's record with exam score
    const studentId = req.user.id; // Assuming you have authentication and can access the student's ID
    await Student.findByIdAndUpdate(studentId, { $push: { examScores: { examId: exam._id, score: score } } });

    // You can customize this part based on your requirements
    // Here, we're rendering the exam result template with the calculated score
    res.render('student/examResult', { score });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});



module.exports = router;
