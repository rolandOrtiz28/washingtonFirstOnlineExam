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


// router.post('/update/:id', upload.single("contents[0][audio]"), async (req, res) => {
//   try {
//     const { title, term, level, subject, remark, contents, isPublished } = req.body;
//     const author = req.user._id;

//     // Initialize audioUrl to null
//     let audioUrl = null;

//     // Check if content type is "Listening" and audio file is uploaded
//     if (contents[0].type === "Listening" && req.file) {
//       // Cloudinary URL provided by multer
//       audioUrl = req.file.path; // This needs to be adjusted to use the Cloudinary URL
//     }

//     const updatedExam = {
//       title,
//       term,
//       level,
//       subject,
//       remark,
//       contents: [{
//         ...contents[0], // Copy other content fields
//         audio: audioUrl // Include the audio URL in the content object
//       }],
//       isPublished: isPublished === 'on' ? true : false // Parse the value of isPublished from the form
//     };

//     const exam = await Exam.findByIdAndUpdate(req.params.id, updatedExam);
//     if (!exam) {
//       return res.status(404).send('Exam not found');
//     }
//     res.redirect('/examdashboard');
//   } catch (err) {
//     console.error(err);
//     res.status(500).send('Internal Server Error');
//   }
// });

// Update exam route
// router.post('/update/:id', upload.single("contents[0][audio]"), async (req, res) => {
//   try {
//     const { title, term, level, subject, remark, contents, isPublished } = req.body;
//     const author = req.user._id;
//     const examId = req.params.id;

//     // Initialize audioUrl to null
//     let audioUrl = null;

//     // Check if content type is "Listening" and audio file is uploaded
//     if (contents[0].type === "Listening" && req.file) {
//       // Cloudinary URL provided by multer
//       audioUrl = req.file.path; // This needs to be adjusted to use the Cloudinary URL
//     }

//     // Ensure content.instruction is an array before calling join
//     const newContents = contents.map(content => {
//       let audioUrl = null;

//       if (content.type === "Listening" && req.file) {
//         audioUrl = req.file.path; // This needs to be adjusted to use the Cloudinary URL
//       }

//       const instruction = Array.isArray(content.instruction) ? content.instruction.join(' ') : '';

//       return {
//         ...content,
//         audio: audioUrl,
//         instruction: instruction
//       };
//     });

//     await Exam.findByIdAndUpdate(examId, {
//       title,
//       term,
//       level,
//       subject,
//       remark,
//       contents: newContents,
//       author,
//       isPublished: isPublished === 'on' ? true : false
//     });
//     res.redirect('/examdashboard');
//   } catch (err) {
//     console.error(err);
//     res.redirect('/');
//   }
// });

router.post('/update/:id', upload.single("contents[0][audio]"), async (req, res) => {
  try {
    const { title, term, level, subject, remark, contents, isPublished } = req.body;
    const author = req.user._id;
    const examId = req.params.id;

    // Ensure content.instruction is an array before calling join
    const newContents = contents.map(content => {
      // Check if content type is "Listening"
      if (content.type === "Listening") {
        // If a new audio file is uploaded, use it; otherwise, retain the existing audio URL
        if (req.file) {
    // Cloudinary URL provided by multer
          content.audio = req.file.path; // This needs to be adjusted to use the Cloudinary URL
        }
      }

      const instruction = Array.isArray(content.instruction) ? content.instruction.join(' ') : '';

      return {
        ...content,
        instruction: instruction
      };
    });

    await Exam.findByIdAndUpdate(examId, {
      title,
      term,
      level,
      subject,
      remark,
      contents: newContents,
      author,
      isPublished: isPublished === 'on' ? true : false
    });
    res.redirect('/examdashboard');
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});


// Get exam details route for updating
router.get('/update/:id', isLoggedIn, isTeacher, async (req, res) => {
  try {
    const examId = req.params.id;
    const exam = await Exam.findById(examId);
    res.render('teacher/examUpdate', { exam });
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
router.get('/dashboard', isTeacher, isLoggedIn, async (req, res) => {
  res.render('teacher/dashboard');
});

router.get('/examdashboard', isTeacher, isLoggedIn, async (req, res) => {

  const exams = await Exam.find({}).populate('author')
  res.render('teacher/examDash', {exams, currentUserID: req.user._id });
});






module.exports = router;
