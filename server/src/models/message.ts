import mongoose, { Document, Schema } from 'mongoose';
import moment from 'moment';

export interface IMessage extends Document {
  roomId: string;
  message: string;
  username: string;
  time: Object;
}

const MessageSchema = new Schema({
  roomId: { type: String, required: true },
  message: { type: String, required: true },
  username: { type: String, required: true },
  time: { type: Object, required: true }
});

export const MessageModel = mongoose.model<IMessage>('Message', MessageSchema);
