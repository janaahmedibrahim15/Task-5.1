import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Instructor Portal account.
// Passwords are hashed with bcrypt. Secret fields are hidden from queries by default.
const instructorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true, trim: true },

    // Private: hashed, and never returned unless explicitly requested with .select('+password')
    password: { type: String, required: true, select: false },

    department: { type: String },
    role: { type: String, default: 'instructor' }, // 'instructor' | 'superadmin'

    // Private fields: hidden by default
    apiKey: { type: String, select: false },
    privateEmail: { type: String, select: false },
    privatePhone: { type: String, select: false }
  },
  { timestamps: true }
);

// Hash the password before saving (only when it is new or changed)
instructorSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Extra safety net: strip secrets if a document is ever serialized to JSON
instructorSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.apiKey;
    delete ret.privateEmail;
    delete ret.privatePhone;
    delete ret.__v;
    return ret;
  }
});

export const Instructor = mongoose.model('Instructor', instructorSchema);