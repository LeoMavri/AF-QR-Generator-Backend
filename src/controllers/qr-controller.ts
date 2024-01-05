import { Request, Response, Router } from 'express';
import router from 'express-promise-router';
import { randomBytes } from 'node:crypto';
import QRCode from 'qrcode';
import { z } from 'zod';

import { Controller } from './controller.js';
import { QRCodeEntity } from '../database/entities/index.js';
import { Logger } from '../utils/index.js';

export class QRCodeController implements Controller {
    public path = '/qr';
    public router: Router = router();
    // public authToken = process.env.AUTH_HEADER;

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
        // correctionFactor: z.number(),
        errorCorrectionLevel: z
            .enum(['low', 'medium', 'quartile', 'high', 'L', 'M', 'Q', 'H'])
            .optional(),
        // Higher is the version, more are the storable data, and of course bigger will be the QR Code symbol.
        version: z.number().min(1).max(40).optional(),
        maskPattern: z.number().min(0).max(7).optional(),
    });

    private async addCode(req: Request, res: Response): Promise<void> {
        const body = req.body;

        const result = this.validAddCodeBody.safeParse(body);
        if (result.success === false) {
            console.log(req.body);
            res.status(400).json({
                error: true,
                message: result.error.message,
            });
            return;
        }

        let qrCode: Buffer;

        try {
            qrCode = await QRCode.toBuffer(result.data.pointsTo);
        } catch (err) {
            res.status(500).json({
                error: true,
                message: 'Something went wrong while generating the QR code.',
            });

            Logger.error(`Failed to generate QR Code for ${result.data.pointsTo}`, err);

            return;
        }

        const qrCodeData = {
            urlExtension: randomBytes(12).toString('hex'),
            pointsTo: result.data.pointsTo,
            qrCodeImage: qrCode,
        };

        try {
            await QRCodeEntity.insert(qrCodeData);

            res.json({
                error: false,
                qrCodeData,
            });
        } catch (err) {
            res.json({
                error: true,
                message: 'Something went wrong while inserting the QR code into the database.',
            });

            Logger.error(`Failed to insert QR Code into the database.`, err);

            return;
        }
    }
}
