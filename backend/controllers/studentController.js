const mongoose = require('mongoose');
const Student = require('../models/Student');

// :id mein Mongo _id ya studentId (jaise ST101) dono chalega
const findByAnyId = (id) =>
  mongoose.Types.ObjectId.isValid(id)
    ? Student.findOne({ $or: [{ _id: id }, { studentId: id }] })
    : Student.findOne({ studentId: id });

const handleError = (res, err) => {
  if (err.code === 11000)
    return res.status(409).json({ success: false, message: 'Is Student ID ka record pehle se hai' });
  if (err.name === 'ValidationError')
    return res.status(400).json({ success: false, message: Object.values(err.errors).map((e) => e.message).join(', ') });
  console.error(err);
  res.status(500).json({ success: false, message: 'Server error' });
};

// GET /api/students?search=rahul
exports.getStudents = async (req, res) => {
  try {
    const { search } = req.query;
    let filter = {};
    if (search) {
      const rx = new RegExp(String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter = { $or: [{ studentId: rx }, { name: rx }, { email: rx }, { department: rx }] };
    }
    const students = await Student.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: students.length, data: students });
  } catch (err) {
    handleError(res, err);
  }
};

// GET /api/students/:id
exports.getStudent = async (req, res) => {
  try {
    const student = await findByAnyId(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: 'Student nahi mila' });
    res.json({ success: true, data: student });
  } catch (err) {
    handleError(res, err);
  }
};

// POST /api/students
exports.addStudent = async (req, res) => {
  try {
    const student = await Student.create(req.body);
    res.status(201).json({ success: true, message: 'Student added successfully', data: student });
  } catch (err) {
    handleError(res, err);
  }
};

// PUT /api/students/:id
exports.updateStudent = async (req, res) => {
  try {
    const student = await findByAnyId(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: 'Student nahi mila' });
    Object.assign(student, req.body);
    await student.save();
    res.json({ success: true, message: 'Student updated successfully', data: student });
  } catch (err) {
    handleError(res, err);
  }
};

// DELETE /api/students/:id
exports.deleteStudent = async (req, res) => {
  try {
    const student = await findByAnyId(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: 'Student nahi mila' });
    await student.deleteOne();
    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (err) {
    handleError(res, err);
  }
};
