import mongoose, { Document, Schema } from 'mongoose';

export interface IRoom extends Document {
  roomId: string;
  name: string;
  time: Date;
}

const RoomSchema = new Schema({
  roomId: { type: String, required: true },
  name: { type: String, required: true },
  time: { type: Date, default: Date.now }
});

export const RoomModel = mongoose.model<IRoom>('Room', RoomSchema);
