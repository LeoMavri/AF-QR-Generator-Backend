import { Request, Response, Router } from 'express';
import router from 'express-promise-router';

import { Controller } from './controller.js';
import { QRCodeEntity } from '../database/entities/index.js';

export class RedirectController implements Controller {
    public path = '/redirect';
    public router: Router = router();

    public register(): void {
        this.router.get('/:id', (req, res) => this.redirect(req, res));
    }

    private async redirect(req: Request, res: Response): Promise<void> {
        const id = req.params.id;

        const qrCode = await QRCodeEntity.findOneBy({ urlExtension: id });

        console.log(id, qrCode);

        if (!qrCode) {
            // TODO: make a proper 404 page in the frontend (CC: mitza)
            res.status(404).send('Not found');
            return;
        }

        res.redirect(qrCode.pointsTo);

        return;
    }
}
