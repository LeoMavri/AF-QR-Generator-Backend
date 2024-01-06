import { Request, Response, Router } from 'express';
import router from 'express-promise-router';

import { Controller } from './controller.js';
import { QRCodeEntity } from '../database/entities/index.js';
import { Logger } from '../utils/index.js';

export class RedirectController implements Controller {
    public path = '/redirect';
    public router: Router = router();

    public register(): void {
        this.router.get('/:id', (req, res) => this.redirect(req, res));
    }

    private async redirect(req: Request, res: Response): Promise<void> {
        const id = req.params.id;

        const qrCode = await QRCodeEntity.findOneBy({ urlExtension: id });

        if (!qrCode) {
            // TODO: make a proper 404 page in the frontend (CC: mitza)
            res.status(404).send('This QR Code does not exist.');
            return;
        }

        try {
            await QRCodeEntity.update(qrCode.urlExtension, {
                timesScanned: () => 'timesScanned + 1',
            });
        } catch (err) {
            Logger.warn(`Something went wrong while trying to increment timesScanned.`, err);
        }

        res.redirect(qrCode.pointsTo);

        return;
    }
}
