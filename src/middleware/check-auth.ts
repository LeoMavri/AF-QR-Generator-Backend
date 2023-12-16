import { RequestHandler } from 'express';

export function checkAuth(token: string): RequestHandler {
    return async (req, res, next) => {
        if (req.headers.authorization !== token) {
            res.sendStatus(401);
            return;
        }
        next();
    };
}
