const express = require("express");
const router = express.Router();
const Exam = require('../model/examination');
const Teacher = require('../model/teacher')
const catchAsync = require('../utils/CatchAsync')
const passport = require('passport')
const {isLoggedIn} = require('../middleware')
const { cloudinary } = require('../cloudinary');
const multer = require('multer');
const {isTeacher} = require('../middleware')
const {storage} = require('../cloudinary');
const upload = multer({ storage });

//Authentication
router.get('/teacher/registerteacher', (req, res) => {
    res.render('teacher/registerTeacher')
})

router.get('/teacher/login', (req, res) => {
    res.render('teacher/login')
})


router.post('/teacher/register', catchAsync(async (req, res) => {
await Teacher.deleteMany({})
    try {
        const { email, username, password } = req.body;

        // Password validation
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
        if (!passwordRegex.test(password)) {
            req.flash('error', 'Password must contain at least one uppercase letter, one digit, and be at least 8 characters long');
            res.redirect('/teacher/registerteacher');
            return;
        }
        const existingUsername = await Teacher.findOne({ username })
        if (existingUsername) {
            req.flash('error', 'A user with the given username is already registered')
            return res.redirect('/teacher/registerteacher')
        }
        const existingEmail = await Teacher.findOne({ email })
        if (existingEmail) {
            req.flash('error', 'A user with the given email is already registered')
            return res.redirect('/teacher/registerteacher')
        }
        const confirmPassword = req.body['confirm-password'];
        if (password !== confirmPassword) {
            req.flash('error', 'Password do not match');
            return res.redirect('/teacher/registerteacher');
        } else {
            const teacher = new Teacher({ email, username });
            const registeredUser = await Teacher.register(teacher, password);
            req.login(registeredUser, err => {
                if (err) return next(err);
                req.flash('success', `Welcome Teacher ${username}`)
                res.redirect('/dashboard')
            })

        }

    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/teacher/registerteacher');
    }
}));

router.post('/login', (req, res, next) => {
    console.log("Login route accessed."); // Log that the login route is accessed

    passport.authenticate('local', { failureFlash: true, failureRedirect: '/teacher/login', keepSessionInfo: true })(req, res, (err, user, info) => {
        if (err) {
            console.error("Passport authentication error:", err); // Log any passport authentication errors
            return next(err);
        }

        if (!user) {
            console.log("User not found or authentication failed."); // Log if user is not found or authentication fails
            return res.redirect('/teacher/login');
        }

        console.log("User authenticated successfully:", user); // Log the authenticated user

        // Assuming you have a `teacher` property on your user object
        if (user.role !== 'teacher') {
            console.log("User is not a teacher."); // Log if user is not a teacher
            return res.redirect('/teacher/login');
        }

        // If user is a teacher, set isLoggedIn to true and save
        user.isLoggedIn = true;
        user.save((err) => {
            if (err) {
                console.error("Error saving user:", err); // Log any errors in saving the user
                return next(err);
            }

            console.log("User login status updated successfully."); // Log successful update of user login status
            req.flash('success', `Welcome ${user.username}`);
            res.redirect(`/teacher/dashboard`);
        });
    });
});


router.get('/teacher/logout', (req, res, next) => {
   req.logout(function (err) {
        if (err) { return next(err); }
        req.flash('success', "Goodbye!");
        res.redirect('/teacher/login');
    });
});

//Examination Proccess
router.get('/builder', isLoggedIn,isTeacher,async (req, res) => {
    try {
        const contents = [];

        res.render('teacher/examBuilder', { contents });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});


router.post('/builder', upload.single("contents[0][audio]"), async (req, res) => {
  await Exam.deleteMany({})
  try {
      const { title, term, level, subject, remark, contents } = req.body;
      const author = req.user._id;

      // Initialize audioUrl to null
      let audioUrl = null;

      // Check if content type is "Listening" and audio file is uploaded
      if (contents[0].type === "Listening" && req.file) {
          // Cloudinary URL provided by multer
          audioUrl = req.file.path; // This needs to be adjusted to use the Cloudinary URL
      }

      // Ensure content.instruction is an array before calling join
      const newContents = contents.map(content => {
          let audioUrl = null;

          if (content.type === "Listening" && req.file) {
              audioUrl = req.file.path; // This needs to be adjusted to use the Cloudinary URL
          }

          const instruction = Array.isArray(content.instruction) ? content.instruction.join(' ') : '';

          return {
              ...content,
              audio: audioUrl,
              instruction: instruction
          };
      });

      const newExam = new Exam({
          title,
          term,
          level,
          subject,
          remark,
          contents: newContents,
          author,
          isPublished: false
      });

      await newExam.save();
      res.redirect('/examdashboard');
  } catch (err) {
      console.error(err);
      res.redirect('/');
  }
});



// Creating exam process
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


router.post('/update/:id', upload.single("contents[0][audio]"), async (req, res) => {
  try {
    const { title, term, level, subject, remark, contents, isPublished } = req.body;
    const author = req.user._id;

    // Initialize audioUrl to null
    let audioUrl = null;

    // Check if content type is "Listening" and audio file is uploaded
    if (contents[0].type === "Listening" && req.file) {
      // Cloudinary URL provided by multer
      audioUrl = req.file.path; // This needs to be adjusted to use the Cloudinary URL
    }

    const updatedExam = {
      title,
      term,
      level,
      subject,
      remark,
      contents: [{
        ...contents[0], // Copy other content fields
        audio: audioUrl // Include the audio URL in the content object
      }],
      isPublished: isPublished === 'on' ? true : false // Parse the value of isPublished from the form
    };

    const exam = await Exam.findByIdAndUpdate(req.params.id, updatedExam);
    if (!exam) {
      return res.status(404).send('Exam not found');
    }
    res.redirect('/examdashboard');
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


//dashboard routes
router.get('/dashboard', isLoggedIn,async(req,res)=>{
  res.render('teacher/dashboard');
});

router.get('/examdashboard', isLoggedIn,async(req,res)=>{

  const exams = await Exam.find({}).populate('author')
  res.render('teacher/examDash', {exams, currentUserID: req.user._id });
});






module.exports = router;
