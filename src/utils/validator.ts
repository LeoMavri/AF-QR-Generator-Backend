import { z } from 'zod';

import { Logger } from './index.js';

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
    authHeader: z.string({
        required_error: `The authentification header needs to be specified in the .env file.`,
    }),
});

export async function validateVariables(): Promise<{
    port: number;
    databaseHost: string;
    databasePort: number;
    databaseUser: string;
    databasePassword: string;
    databaseName: string;
    authHeader: string;
}> {
    const config = {
        port: parseInt(process.env.PORT),
        databaseHost: process.env.DATABASE_HOST,
        databasePort: parseInt(process.env.DATABASE_PORT),
        databaseUser: process.env.DATABASE_USERNAME,
        databasePassword: process.env.DATABASE_PASSWORD,
        databaseName: process.env.DATABASE_NAME,
        authHeader: process.env.AUTH_HEADER,
    };

    const result = validInput.safeParse(config);
    if (result.success === false) {
        Logger.error(
            `One or more errors have been found: `,
            result.error.issues.map(issue => `${issue.path} - ${issue.message}`)
        );

        process.exit(1);
    }

    return config;
}
