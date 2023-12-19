import { Request, Response, Router } from 'express';
import router from 'express-promise-router';

import { Controller } from './controller.js';

export class RootController implements Controller {
    public path = '/';
    public router: Router = router();

    public register(): void {
        this.router.get('/', (req, res) => this.root(req, res));
    }

    private async root(req: Request, res: Response): Promise<void> {
        res.json({
            error: false,
            message: 'bruh',
        });

        return;
    }
}
