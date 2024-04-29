import express from 'express';

import { checkValid } from '../controllers/error';

export default (router: express.Router) => {
    router.all('*', checkValid);
};