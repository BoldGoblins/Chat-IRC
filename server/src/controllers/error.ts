import express from 'express';

export const checkValid = async (req: express.Request, res: express.Response) => {
    try {

    return res.status(404).send("404 error: Page not found.");
    } catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
}