import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    Unique,
} from 'typeorm';

@Entity()
@Unique(['id'])
export class QRCodeEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    pointsTo: string;

    /**
     * Gen daca url-ul este diicot.cc/9uifhsrf89
     * urlExtension -> 9uifhsrf89
     */
    @Column()
    urlExtension: string;

    /**
     * Idee furata de aici: https://wanago.io/2021/11/01/api-nestjs-storing-files-postgresql-database/
     */
    @Column({
        type: 'bytea',
    })
    qrCodeImage: Uint8Array;

    @CreateDateColumn()
    createdAt: Date;
}
