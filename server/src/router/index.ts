import express from 'express';

import authentification from './authentification';
import users from './users';
import error from './error';
import messages from './messages';
import rooms from './rooms';

const router = express.Router();

export default (): express.Router => {
    authentification(router);
    users(router);

    messages(router);
    rooms(router);

    error(router);
    
    return router;
};