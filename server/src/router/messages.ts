import express from 'express';

import { saveMessage, getMessages, deleteMessagesFromRoom } from '../controllers/messages';

export default (router: express.Router) => {
  router.post('/messages', saveMessage);
  router.get('/messages', getMessages);
  router.delete('/messages/:roomId', deleteMessagesFromRoom);
};
