const Student = require('../models/Student');
const mongoose = require('mongoose');

/**
 * Helper to build a lookup query supporting either Mongo ObjectId or custom studentId (e.g. "ST101")
 */
const buildLookupQuery = (id) => {
  if (mongoose.Types.ObjectId.isValid(id)) {
    return { $or: [{ _id: id }, { studentId: id.toUpperCase() }] };
  }
  return { studentId: id.toUpperCase() };
};

// @desc    Create a new student
// @route   POST /api/students
// @access  Public
exports.createStudent = async (req, res) => {
  try {
    const { studentId, name, email, department, semester, contact } = req.body;

    // Validate required fields
    if (!studentId || !name || !email || !department || semester === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: studentId, name, email, department, and semester.',
      });
    }

    // Check if studentId already exists
    const existingId = await Student.findOne({ studentId: studentId.trim().toUpperCase() });
    if (existingId) {
      return res.status(409).json({
        success: false,
        message: `Student with ID "${studentId.trim().toUpperCase()}" already exists.`,
      });
    }

    // Check if email already exists
    const existingEmail = await Student.findOne({ email: email.trim().toLowerCase() });
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: `Student with email "${email.trim().toLowerCase()}" already exists.`,
      });
    }

    const student = await Student.create({
      studentId: studentId.trim().toUpperCase(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      department: department.trim(),
      semester: Number(semester),
      contact: contact ? contact.trim() : '',
    });

    return res.status(201).json({
      success: true,
      message: 'Student added successfully',
      data: student,
    });
  } catch (error) {
    console.error('Error in createStudent:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error while creating student',
    });
  }
};

// @desc    Get all students (with optional search and department filter)
// @route   GET /api/students
// @access  Public
exports.getAllStudents = async (req, res) => {
  try {
    const { search, department } = req.query;
    const filter = {};

    if (department && department !== 'All') {
      filter.department = department;
    }

    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { name: regex },
        { studentId: regex },
        { email: regex },
        { department: regex },
      ];
    }

    const students = await Student.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error) {
    console.error('Error in getAllStudents:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error while fetching students',
    });
  }
};

// @desc    Get a single student by Mongo ID or Student ID
// @route   GET /api/students/:id
// @access  Public
exports.getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = buildLookupQuery(id);

    const student = await Student.findOne(query);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: `Student with ID "${id}" was not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    console.error('Error in getStudentById:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error while retrieving student',
    });
  }
};

// @desc    Update a student's information
// @route   PUT /api/students/:id
// @access  Public
exports.updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, department, semester, contact } = req.body;
    const query = buildLookupQuery(id);

    const student = await Student.findOne(query);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: `Student with ID "${id}" was not found.`,
      });
    }

    // If updating email, ensure no conflict with another student
    if (email && email.trim().toLowerCase() !== student.email) {
      const emailExists = await Student.findOne({
        email: email.trim().toLowerCase(),
        _id: { $ne: student._id },
      });
      if (emailExists) {
        return res.status(409).json({
          success: false,
          message: `Email "${email}" is already used by another student.`,
        });
      }
      student.email = email.trim().toLowerCase();
    }

    if (name) student.name = name.trim();
    if (department) student.department = department.trim();
    if (semester !== undefined) student.semester = Number(semester);
    if (contact !== undefined) student.contact = contact.trim();

    const updatedStudent = await student.save();

    return res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      data: updatedStudent,
    });
  } catch (error) {
    console.error('Error in updateStudent:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error while updating student',
    });
  }
};

// @desc    Delete a student record
// @route   DELETE /api/students/:id
// @access  Public
exports.deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const query = buildLookupQuery(id);

    const deletedStudent = await Student.findOneAndDelete(query);

    if (!deletedStudent) {
      return res.status(404).json({
        success: false,
        message: `Student with ID "${id}" was not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Student with ID "${deletedStudent.studentId}" deleted successfully`,
      data: {
        id: deletedStudent._id,
        studentId: deletedStudent.studentId,
        name: deletedStudent.name,
      },
    });
  } catch (error) {
    console.error('Error in deleteStudent:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error while deleting student',
    });
  }
};
