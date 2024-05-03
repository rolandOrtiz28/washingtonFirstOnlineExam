const express = require("express");
const router = express.Router();
const Exam = require('../model/examination');
const multer = require('multer');

const Teacher = require('../model/teacher')
const catchAsync = require('../utils/CatchAsync')
const passport = require('passport')
const {isLoggedIn} = require('../middleware')
const fileUpload = require('express-fileupload');
const cloudinary = require('cloudinary').v2;


// Configure multer storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

cloudinary.config({
  cloud_name: 'dalfz3t49',
  api_key: '333337243589348',
  api_secret: '-uqK2puwH-mqXuMBk9l4WhiEFMo'
});


router.use(fileUpload());
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
router.post('/builder', upload.single('audio'), async (req, res) => {
  try {
      console.log(req.body); // Log the req.body object

      // Check if audio file is present
      if (!req.file) {
          return res.status(400).send('No audio file was uploaded.');
      }

      // Handle audio file upload to Cloudinary
      const cloudinaryResponse = await cloudinary.uploader.upload(req.file.path, {
          resource_type: 'raw', // Specify resource type as 'raw' for audio files
          folder: 'audio', // Specify the folder in your Cloudinary account where you want to save the file
          overwrite: true // Overwrite if file with the same name already exists
      });

      // Access the audio URL from the Cloudinary response
      const audioUrl = cloudinaryResponse.secure_url;

      // Extract other form data
      const { title, term, level, subject, remark } = req.body;
      const author = req.user._id;

      // Construct the newContents array
      const newContents = [];
      for (let i = 0; req.body[`contents[${i}][type]`]; i++) {
          const content = {
              type: req.body[`contents[${i}][type]`],
              story: req.body[`contents[${i}][story]`],
              remark: req.body[`contents[${i}][remark]`],
              questions: [{
                  question: req.body[`contents[${i}][questions][0][question]`],
                  choices: [
                      req.body[`contents[${i}][questions][0][choices][0]`],
                      req.body[`contents[${i}][questions][0][choices][1]`],
                      req.body[`contents[${i}][questions][0][choices][2]`]
                  ],
                  correctAnswer: req.body[`contents[${i}][questions][0][correctAnswer]`],
                  points: parseInt(req.body[`contents[${i}][questions][0][points]`])
              }]
          };
          newContents.push(content);
      }

      // Save the new exam
      const newExam = new Exam({
          title,
          term,
          level,
          subject,
          remark,
          contents: newContents,
          author
      });

      await newExam.save();
      res.redirect('/examdashboard');
  } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
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
