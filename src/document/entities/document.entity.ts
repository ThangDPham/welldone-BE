import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
@Entity('document')
export class DocumentFile {
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    name: string;
    @Column({type: 'bytea'})
    attachFile: Buffer;
}