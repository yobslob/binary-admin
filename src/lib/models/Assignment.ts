import mongoose, { Schema, model, models } from 'mongoose';

const AssignmentSchema = new Schema(
  {
    editorId: { type: Schema.Types.ObjectId, ref: 'Editor', required: true },
    leadId: { type: Schema.Types.ObjectId, ref: 'Lead', required: true },
    status: {
      type: String,
      enum: ['in_progress', 'trailer_delivered', 'warm_approached', 'replied', 'on_call', 'closed', 'declined', 'no_reply'],
      default: 'in_progress',
    },
    trailerDeliveredAt: { type: Date, default: null },
    warmApproachedAt: { type: Date, default: null },
    repliedAt: { type: Date, default: null },
    closedAt: { type: Date, default: null },
    commissionEarned: { type: Number, default: 0 },
    notes: { type: String, default: '' },
    deadline: { type: Date, default: null },
    assignedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export default models.Assignment || model('Assignment', AssignmentSchema);
