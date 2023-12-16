import 'reflect-metadata';
import * as dotenv from 'dotenv';
import express from 'express';
import util from 'node:util';
import { z } from 'zod';

dotenv.config();

import { Controller } from './controllers/controller.js';
import { QRCodeController } from './controllers/index.js';
import { connectToDatabase } from './database/index.js';
import { checkAuth } from './middleware/check-auth.js';
import { handleError } from './middleware/handle-error.js';
import { Logger } from './utils/index.js';

async function main(): Promise<void> {
    Logger.info(`Validating environment variables...`);
    const config = {
        port: parseInt(process.env.PORT),
        databaseHost: process.env.DATABASE_HOST,
        databasePort: parseInt(process.env.DATABASE_PORT),
        databaseUser: process.env.DATABASE_USERNAME,
        databasePassword: process.env.DATABASE_PASSWORD,
        databaseName: process.env.DATABASE_NAME,
    };

    // TODO: move this to a different file, probably somewhere in `utils`
    const validInput = z.object({
        port: z
            .number({
                required_error: `The port needs to be specified in the .env file.`,
                invalid_type_error: `The port needs to be a number.`,
                description: `The port to run the API on.`,
            })
            .min(0, `The port needs to be positive.`)
            .max(65535, `The port needs to be smaller than 65535`),
        databaseHost: z.string({
            required_error: `The database host needs to be specified in the .env file.`,
        }),
        databasePort: z
            .number({
                required_error: `The database port needs to be specified in the .env file.`,
                invalid_type_error: `The database  port needs to be a number.`,
                description: `The port to connect to the database with.`,
            })
            .min(0, `The database  port needs to be positive.`)
            .max(65535, `The database  port needs to be smaller than 65535`),
        databaseUser: z.string({
            required_error: `The database username needs to be specified in the .env file.`,
        }),
        databasePassword: z.string({
            required_error: `The database password needs to be specified in the .env file.`,
        }),
        databaseName: z.string({
            required_error: `The database (table) name needs to be specified in the .env file.`,
        }),
    });

    const result = validInput.safeParse(config);
    if (result.success === false) {
        Logger.error(
            `One or more errors have been found: `,
            result.error.issues.map(issue => `${issue.path} - ${issue.message}`)
        );

        process.exit(1);
    }

    Logger.info(`Environment have passed validation.`);
    Logger.info(`Attempting connection to the database...`);
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

    const controllers: Controller[] = [new QRCodeController()];

    for (const controller of controllers) {
        if (controller.authToken) {
            controller.router.use(checkAuth(controller.authToken));
        }
        controller.register();
        app.use(controller.path, controller.router);
    }

    app.use(handleError());

    let listen = util.promisify(app.listen.bind(app));
    await listen(config.port);
    Logger.info(`Started API on port ${config.port}`);
}

main();
