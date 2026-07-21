import mongoose, { Schema, model, models } from 'mongoose';

const EditorSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true, default: '' },
    discordUsername: { type: String, trim: true, default: '' },
    stage: {
      type: String,
      enum: ['qualified', 'call_scheduled', 'denied', 'onboarded', 'contract_signed', 'active', 'completed'],
      default: 'qualified',
    },
    meetLink: { type: String, trim: true, default: '' },
    commissionRate: { type: Number, default: 5 },
    notes: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

export default models.Editor || model('Editor', EditorSchema);
