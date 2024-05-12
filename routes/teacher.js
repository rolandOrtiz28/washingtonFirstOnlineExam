const express = require("express");
const router = express.Router();
const Exam = require('../model/examination');
const Teacher = require('../model/teacher')
const User = require('../model/user')
const catchAsync = require('../utils/CatchAsync')
const passport = require('passport')
const {isLoggedIn} = require('../middleware')
const {isAdminOrTeacher} = require('../middleware')
const { cloudinary } = require('../cloudinary');
const multer = require('multer');
const {isTeacher} = require('../middleware')
const {storage} = require('../cloudinary');
const upload = multer({ storage });
const Excel = require('exceljs');
//Authentication
router.get('/teacher/registerteacher', (req, res) => {
    res.render('teacher/registerTeacher')
})

router.get('/teacher/login', (req, res) => {
    res.render('teacher/login')
})


router.get('/logout', (req, res, next) => {
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
router.get('/dashboard', isTeacher,isAdminOrTeacher, isLoggedIn, async (req, res) => {
  res.render('teacher/dashboard');
});

router.get('/examdashboard', isTeacher,isAdminOrTeacher, isLoggedIn, async (req, res) => {
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


function groupStudentsByLevelAndTime(students) {
    const groupedStudents = {};
    students.forEach(student => {
        const { level, time } = student;
        if (!groupedStudents[level]) {
            groupedStudents[level] = {};
        }
        if (!groupedStudents[level][time]) {
            groupedStudents[level][time] = [];
        }
        groupedStudents[level][time].push(student);
    });
    return groupedStudents;
}

router.get('/studentDashboard', async (req, res) => {
    try {
        // Fetch students from the database
        const students = await User.find({ role: 'student' });

        // Group students by level and time
        const groupedStudents = groupStudentsByLevelAndTime(students);

        res.render('teacher/studentdash', { groupedStudents });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/teacher/adminregistration',(req,res)=>{

  res.render('teacher/adminRegister')
}
)

router.post('/teacher/adminregister', catchAsync(async (req, res) => {

  try {
      const {  email,username, password, isAdmin, role } = req.body;

      // Password validation
      const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
      if (!passwordRegex.test(password)) {
          req.flash('error', 'Password must contain at least one uppercase letter, one digit, and be at least 8 characters long');
          res.redirect('/registration/:url');
          return;
      }
      const isAdminBool = isAdmin === 'true';
      const user = new User({ email, username, isAdmin: isAdminBool,role });
      const registeredUser = await User.register(user, password);
      req.login(registeredUser, err => {
          if (err) return next(err);
          req.flash('success', `Welcome to ${username}`)
          res.redirect('/examdashboard')
      })
  } catch (e) {
      req.flash('error', e.message);
      res.redirect('/teacher/adminregistration');
  }
}));





router.get('/student/:id/score', isLoggedIn, async (req, res) => {
    try {
        // Fetch the user information by ID
        const student = await User.findById(req.params.id);

        // Ensure the user is a student
        if (!student || student.role !== 'student') {
            return res.status(404).send('Student not found');
        }

        // Fetch all exam scores for the student
        const examScores = student.examScores;

        // Prepare an array to store detailed score information
        const detailedScores = [];
        // Iterate through each exam score
        for (const score of examScores) {
            const exam = await Exam.findById(score.examId);
            if (!exam) {
                console.log('Exam not found for score:', score);
                continue;
            }

            // Prepare content information for each exam
            const contentInfo = [];
            for (const content of exam.contents) {
                // Calculate the score for each content
                const contentScore = student.contentScores[content._id.toString()] || 0;
                // Convert content ID to string and use it as the key to access the content score

                // Add content information to the array
                contentInfo.push({
                    type: content.type,
                    remark: content.remark,
                    score: contentScore
                });
            }

            // Add detailed score information to the array, including overall score
            detailedScores.push({
                examTitle: exam.title,
                overallScore: score.score, // Include overall score
                scores: contentInfo
            });
        }

        // Generate Excel file
        const workbook = new Excel.Workbook();
        const worksheet = workbook.addWorksheet('Scores');
        worksheet.addRow(['Exam', 'Number of Contents', 'Content Type', 'Remark', 'Score', 'Total']);
        detailedScores.forEach(exam => {
            const numberOfContents = exam.scores.length;
            let contentCount = 0;
            exam.scores.forEach(content => {
                if (contentCount === 0) {
                    worksheet.addRow([exam.examTitle, numberOfContents, content.type, content.remark, content.score, exam.overallScore]);
                } else {
                    worksheet.addRow(['', '', content.type, content.remark, content.score, '']);
                }
                contentCount++;
            });
        });

        // Set response headers for downloading the Excel file
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=student_scores.xlsx');

        // Write workbook data to response
        workbook.xlsx.write(res)
            .then(() => {
                res.end();
            })
            .catch(err => {
                console.log(err);
                res.status(500).send('Error generating Excel file');
            });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});


router.get('/student/:id/scores', isLoggedIn, async (req, res) => {
    try {
        // Fetch the user information by ID
        const student = await User.findById(req.params.id);

        // Ensure the user is a student
        if (!student || student.role !== 'student') {
            return res.status(404).send('Student not found');
        }

        // Fetch all exam scores for the student
        const examScores = student.examScores;

        // Prepare an array to store detailed score information
        const detailedScores = [];
        // Iterate through each exam score
        for (const score of examScores) {
            const exam = await Exam.findById(score.examId);
            if (!exam) {
                console.log('Exam not found for score:', score);
                continue;
            }

            // Prepare content information for each exam
            const contentInfo = [];
            for (const content of exam.contents) {
                // Calculate the score for each content
                const contentScore = student.contentScores[content._id.toString()] || 0;
                // Convert content ID to string and use it as the key to access the content score

                // Add content information to the array
                contentInfo.push({
                    type: content.type,
                    remark: content.remark,
                    score: contentScore
                });
            }

            // Add detailed score information to the array, including overall score
            detailedScores.push({
                examTitle: exam.title,
                overallScore: score.score, // Include overall score
                scores: contentInfo
            });
        }

        // Pass detailedScores to the template
        res.render('teacher/studentScores', { student, detailedScores }); // Render the template

    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});


router.delete('/exam/:id', catchAsync(async (req, res) => {
  const { id } = req.params;
  await Exam.findByIdAndDelete(id);
  res.redirect('/examdashboard');
}))

module.exports = router;
