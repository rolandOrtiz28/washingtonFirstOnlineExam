const express = require("express");
const router = express.Router();
const Exam = require('../model/examination');
const Teacher = require('../model/teacher')
const User = require('../model/user')
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

  try {
      const { title, term, level, subject, remark, contents,time } = req.body;
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

          // const instruction = Array.isArray(content.instruction) ? content.instruction.join(' ') : '';

          return {
              ...content,
              audio: audioUrl,

          };
      });

      const newExam = new Exam({
          title,
          term,
          level,
          subject,
          remark,
          time,
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




router.post('/update/:id', upload.single("contents[0][audio]"), async (req, res) => {
  try {
    const { title, term, level, subject, remark, contents,time, isPublished } = req.body;
    const author = req.user._id;
    const examId = req.params.id;

    // Fetch the existing exam from the database
    const existingExam = await Exam.findById(examId);

    // Ensure content.instruction is an array before calling join
    const newContents = contents.map((content, contentIndex) => {
      // Check if content type is "Listening"
      if (content.type === "Listening") {
        // If a new audio file is uploaded, use it; otherwise, retain the existing audio URL
        if (req.file) {
          // Cloudinary URL provided by multer
          content.audio = req.file.path; // This needs to be adjusted to use the Cloudinary URL
        } else {
          // Retain the existing audio URL
          content.audio = existingExam.contents[contentIndex].audio;
        }
      }



      return {
        ...content,

      };
    });

    await Exam.findByIdAndUpdate(examId, {
      title,
      term,
      level,
      subject,
      remark,
      time,
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
  try {
    const exams = await Exam.find({}).populate('author');

    // Extract unique levels from exams
    const uniqueLevels = [...new Set(exams.map(exam => exam.level))];

    res.render('teacher/examDash', { exams, uniqueLevels, currentUserID: req.user._id });
  } catch (error) {
    console.error(error);
    res.redirect('/');
  }
});

// router.get('/studentDashboard', async (req, res) => {
//     try {
//         const students = await User.find({ role: 'student' }); // Fetch all users with role 'student'
//         res.render('teacher/studentdash', { students }); // Pass the students data to the template
//     } catch (err) {
//         console.error(err);
//         res.status(500).send('Internal Server Error');
//     }
// });



router.get('/studentDashboard', async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).populate({
      path: 'examScores.examId',
      select: 'title' // Select only the title field of the exam
    });
    console.log(students)

    // Group students by level, time, and unique student ID
    const groupedStudents = {};
    students.forEach(student => {
      const key = `${student.level}-${student.time}`;
      if (!groupedStudents[key]) {
        groupedStudents[key] = student;
      }
    });

    res.render('teacher/studentdash', { groupedStudents });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});


router.get('/studentScores/:studentId', async (req, res) => {
  try {
    const student = await User.findById(req.params.studentId).populate({
      path: 'examScores.examId',
      select: 'title contents'
    });

    if (!student || student.role !== 'student') {
      return res.status(404).send('Student not found');
    }

    console.log("Student Object:", student); // Add this line for debugging
    res.render('teacher/studentScores', { student });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});


module.exports = router;
