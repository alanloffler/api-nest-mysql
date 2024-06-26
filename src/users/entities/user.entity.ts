import { Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, UpdateDateColumn } from 'typeorm';
import { Image } from '../../images/entities/image.entity';
import { Property } from '../../properties/entities/property.entity';
import { Role } from '../../common/enums/role.enum';

@Entity()
export class User {
    @Column({ primary: true, generated: true })
    id: number;

    @Column({ nullable: true })
    name: string;

    @Column({ unique: true, nullable: false })
    email: string;

    @Column({ unique: true, nullable: false, select: false })
    password: string;

    @Column({ type: 'enum', enum: Role, default: Role.USER })
    role: Role;

    @Column({ nullable: true })
    phone: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;

    @OneToMany(() => Property, (property) => property.created_by)
    properties: Property[];

    @OneToMany(() => Image, (image) => image.uploaded_by)
    images: Image[];
}
