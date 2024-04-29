import { Request, Response } from 'express';
import { RoomModel, IRoom } from '../models/room';
import moment from 'moment';

export const saveRoom = async (req: Request, res: Response): Promise<void> => {
  try {
    const { roomId, name } = req.body;
    const time = moment();

    const newRoom: IRoom = new RoomModel({ roomId, name, time });

    await newRoom.save();

    res.status(201).json(newRoom);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

export const getRooms = async (_req: Request, res: Response): Promise<void> => {
  try {
    const rooms: IRoom[] = await RoomModel.find().sort({ time: 'asc' });

    res.status(200).json(rooms);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

export const deleteRoom = async (req: Request, res: Response): Promise<void> => {
  try {
    const { roomId } = req.params;

    const room = await RoomModel.findOne({ roomId });
    if (!room) {
      res.status(404).json({ message: 'Room not found' });
      return;
    }

    await RoomModel.deleteOne({ roomId });

    res.status(200).json({ message: 'Room deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};