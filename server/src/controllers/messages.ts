import { Request, Response } from 'express';
import { MessageModel, IMessage } from '../models/message';

export const saveMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { roomId, message, username, time } = req.body;
    const newMessage: IMessage = new MessageModel({ roomId, message, username, time });

    await newMessage.save();

    res.status(201).json(newMessage);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

export const getMessages = async (_req: Request, res: Response): Promise<void> => {
  try {
    const messages: IMessage[] = await MessageModel.find().sort({ date: 'asc' });

    res.status(200).json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

export const deleteMessagesFromRoom = async (req: Request, res: Response): Promise<void> => {
  try {
    const { roomId } = req.params;
    await MessageModel.deleteMany({ roomId });
    res.status(200).send('Messages deleted successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};
