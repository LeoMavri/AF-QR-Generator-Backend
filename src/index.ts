import 'reflect-metadata';
import * as dotenv from 'dotenv';
import express from 'express';
import util from 'node:util';

dotenv.config();

import { Controller } from './controllers/controller.js';
import { QRCodeController, RedirectController, RootController } from './controllers/index.js';
import { connectToDatabase } from './database/index.js';
import { checkAuth } from './middleware/check-auth.js';
import { handleError } from './middleware/handle-error.js';
import { Logger, validateVariables } from './utils/index.js';

async function main(): Promise<void> {
    const config = await validateVariables();

    Logger.info(`Environment have passed validation.`);

    const success = await connectToDatabase({
        host: config.databaseHost,
        port: config.databasePort,
        username: config.databaseUser,
        password: config.databasePassword,
        database: config.databaseName,
    });

    if (success === false) {
        Logger.error(`Database connection failed. Please double check your credentials`);

        process.exit(1);
    }
    Logger.info(`Successfully connected to the database.`);

    const app = express();
    app.use(express.json());
    // allow cors for all routes
    app.use((_req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', '*');
        next();
    });

    const controllers: Controller[] = [
        new RootController(),
        new QRCodeController(),
        new RedirectController(),
    ];

    for (const controller of controllers) {
        if (controller.authToken) {
            controller.router.use(checkAuth(controller.authToken));
        }
        controller.register();
        app.use(controller.path, controller.router);
    }

    app.use(handleError());

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    let listen = util.promisify(app.listen.bind(app)) as (port: number) => Promise<unknown>;
    await listen(config.port);
    Logger.info(`Started API on port ${config.port}`);
}

main();
