const express = require('express');
const router = express.Router();
const {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
} = require('../controllers/studentController');

// /api/students
router.route('/')
  .get(getAllStudents)
  .post(createStudent);

// /api/students/:id (supports both MongoDB _id or custom studentId)
router.route('/:id')
  .get(getStudentById)
  .put(updateStudent)
  .delete(deleteStudent);

module.exports = router;
