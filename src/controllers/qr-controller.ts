import { Request, Response, Router } from 'express';
import router from 'express-promise-router';
import { z } from 'zod';

import { Controller } from './controller.js';
import { QRCodeEntity } from '../database/entities/index.js';

export class QRCodeController implements Controller {
    public path = '/qr';
    public router: Router = router();
    // public authToken = 'TODO:CHANGETHIS';

    public register(): void {
        this.router.get('/', (req, res) => this.getCodes(req, res));
        this.router.post('/', (req, res) => this.addCode(req, res));
    }

    private async getCodes(req: Request, res: Response): Promise<void> {
        const qrCodes = await QRCodeEntity.find();

        res.json({
            error: false,
            qrCodes,
        });

        return;
    }

    private validAddCodeBody = z.object({
        pointsTo: z.string(),
        correctionFactor: z.number(),
        formFactor: z.string(), // this is probably going to be an enum later on
    });

    private async addCode(req: Request, res: Response): Promise<void> {
        // todo: generate the QR code and add it to the database
        res.json({
            message: 'This endpoint is not implemented yet',
        });

        return;
    }
}
