import express from 'express';

import { saveRoom, getRooms, deleteRoom } from '../controllers/rooms';

export default (router: express.Router) => {
  router.post('/rooms', saveRoom);
  router.get('/rooms', getRooms);
  router.delete('/rooms/:roomId', deleteRoom);
};
