import Joi from 'joi';
import bcrypt from 'bcryptjs';
import { Instructor } from '../models/Instructor.js';

// Whitelist: username and password must be plain strings
const loginSchema = Joi.object({
  username: Joi.string().trim().min(1).max(50).required(),
  password: Joi.string().min(1).max(128).required()
});

const nameSchema = Joi.string().trim().min(1).max(50);

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Only PUBLIC fields ever leave the server
function publicProfile(doc) {
  return {
    id: doc._id.toString(),
    name: doc.name,
    username: doc.username,
    department: doc.department,
    role: doc.role
  };
}

// POST /api/instructors/login
export async function loginInstructor(req, res, next) {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: 'username and password must be strings' });
    }

    // Query by username only; the password is never part of the query
    const instructor = await Instructor
      .findOne({ username: value.username })
      .select('+password');

    const ok = instructor && (await bcrypt.compare(value.password, instructor.password));
    if (!ok) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    return res.json({ instructor: publicProfile(instructor) });
  } catch (err) {
    next(err);
  }
}

// GET /api/instructors
export async function getDirectory(req, res, next) {
  try {
    const instructors = await Instructor.find()
      .select('name department role')
      .sort({ name: 1 })
      .lean();
    res.json({ instructors });
  } catch (err) {
    next(err);
  }
}

// GET /api/instructors/search?name=Smith
export async function searchInstructors(req, res, next) {
  try {
    // Only a plain-string "name" is used. Any other key ($where, role[$ne], ...)
    // or a non-string value is ignored. req.query is never passed to find().
    const { error, value } = nameSchema.validate(req.query.name);
    if (error || value === undefined) {
      return res.json({ count: 0, instructors: [] });
    }

    const instructors = await Instructor
      .find({ name: { $regex: escapeRegex(value), $options: 'i' } })
      .select('name department role') // whitelist public fields only
      .lean();

    res.json({ count: instructors.length, instructors });
  } catch (err) {
    next(err);
  }
}