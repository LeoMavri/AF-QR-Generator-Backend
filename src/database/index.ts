// init typeorm with pg

import { DataSource } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

import { QRCodeEntity } from './entities/index.js';

export const AppDataSource = new DataSource({
    type: 'postgres',
});

export async function connectToDatabase(
    connectionOptions: Partial<PostgresConnectionOptions>
): Promise<boolean> {
    AppDataSource.setOptions({
        ...connectionOptions,
        type: 'postgres',
        synchronize: true, // TODO: probably change this once we go live
        dropSchema: true,
        logging: false,
        entities: [QRCodeEntity],
    });

    try {
        await AppDataSource.initialize();
    } catch (err) {
        return false;
    }

    return true;
}
