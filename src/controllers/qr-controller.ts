import { Request, Response, Router } from 'express';
import router from 'express-promise-router';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import QRCode from 'qrcode';
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
            return;
        }

        // TODO: randomise the urlExtension
        // TODO; check if that url is taken already

        const qrCodeEntity = await QRCodeEntity.create({
            urlExtension: 'balling',
            pointsTo: result.data.pointsTo,
            qrCodeImage: qrCode,
        }).save();

        res.json({
            error: false,
            qrCodeEntity,
        });

        const p = path.join(path.resolve(), 'qr-codes', `${qrCodeEntity.urlExtension}.png`);
        await writeFile(p, qrCode);
    }
}
