import mongoose from 'mongoose';

const ChatSessionSchema = new mongoose.Schema({
    sessionId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['active', 'completed', 'archived'], default: 'active' }
});

export const ChatSession = mongoose.model('ChatSession', ChatSessionSchema);
