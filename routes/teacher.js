const express = require("express");
const router = express.Router();
const Exam = require('../model/examination');
const Teacher = require('../model/teacher')
const catchAsync = require('../utils/CatchAsync')
const passport = require('passport')
const {isLoggedIn} = require('../middleware')
const { cloudinary } = require('../cloudinary');
const multer = require('multer');

const {storage} = require('../cloudinary'); 
const upload = multer({ storage });



router.get('/teacher/registerteacher', (req, res) => {
    res.render('teacher/registerTeacher')
})

router.get('/teacher/login', (req, res) => {
    res.render('teacher/login')
})

router.post('/teacher/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/', keepSessionInfo: true }), async (req, res) => {
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
        res.redirect('/dashboard');
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
                res.redirect('/')
            })

        }

    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/teacher/registerteacher');
    }
}));


router.get('/builder', async (req, res) => {
    try {
        // Fetch contents from your database or wherever you're storing them
        const contents = []; // Replace this with actual content data

        res.render('teacher/examBuilder', { contents });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

// router.post('/builder', async (req, res) => {

//   try {
//     const { title, term, level, subject, remark, contents } = req.body;

//     const author = req.user._id;
//     const newExam = new Exam({
//       title,
//       term,
//       level,
//       subject,
//       remark,
//       contents,
//       author
//     });
// console.log(newExam)
//     await newExam.save();
//     res.redirect('/examdashboard');
//   } catch (err) {
//     console.error(err);
//     res.redirect('/');
//   }
// });

// router.post('/builder', upload.single("contents[0][audio]"), async (req, res) => {
//   try {
//     const { title, term, level, subject, remark, contents } = req.body;
//     const author = req.user._id;

//     // Cloudinary URL provided by multer
//     const audioUrl = req.file.path;
// console.log(audioUrl)
//     const newExam = new Exam({
//       title,
//       term,
//       level,
//       subject,
//       remark,
//       contents,
//       author,
//       audio: audioUrl  // Use the Cloudinary URL directly
//     });

//     await newExam.save();
//     res.redirect('/examdashboard');
//   } catch (err) {
//     console.error(err);
//     res.redirect('/');
//   }
// });

router.post('/builder', upload.single("contents[0][audio]"), async (req, res) => {
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

    const newExam = new Exam({
      title,
      term,
      level,
      subject,
      remark,
      contents: [{
        ...contents[0], // Copy other content fields
        audio: audioUrl // Include the audio URL in the content object
      }],
      author,
      isPublished: false
    });
console.log(newExam)
    await newExam.save();
    res.redirect('/examdashboard');
  } catch (err) {
    console.error(err);
    res.redirect('/');
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
    const { title, term, level, subject, remark, contents, isPublished } = req.body;
    const exam = await Exam.findByIdAndUpdate(req.params.id, {
      title,
      term,
      level,
      subject,
      remark,
      contents,
      isPublished: isPublished === 'on' ? true : false // Parse the value of isPublished from the form
    });
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
  res.render('teacher/examDash', {exams});
});



module.exports = router;
