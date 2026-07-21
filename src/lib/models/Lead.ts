import mongoose, { Schema, model, models } from 'mongoose';

const FileReferenceSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    type: { type: String, enum: ['video', 'document', 'image', 'other'], default: 'other' },
  },
  { _id: false }
);

const LeadSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true, default: '' },
    company: { type: String, trim: true, default: '' },
    files: { type: [FileReferenceSchema], default: [] },
    status: {
      type: String,
      enum: ['unassigned', 'assigned', 'trailer_delivered', 'warm_approached', 'replied', 'on_call', 'closed', 'declined'],
      default: 'unassigned',
    },
    ticketSize: { type: Number, default: 0 },
    notes: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

export default models.Lead || model('Lead', LeadSchema);
