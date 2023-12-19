import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryColumn, Unique } from 'typeorm';

@Entity()
@Unique(['urlExtension'])
export class QRCodeEntity extends BaseEntity {
    /**
     * Gen daca url-ul este diicot.cc/9uifhsrf89
     * urlExtension -> 9uifhsrf89
     */
    @PrimaryColumn()
    urlExtension!: string;

    /**
     * Unde duce url-ul
     * Gen https://google.com etc.
     */
    @Column()
    pointsTo!: string;

    @Column({
        type: 'bytea',
    })
    qrCodeImage!: Buffer;

    @CreateDateColumn()
    createdAt!: Date;
}
