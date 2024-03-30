import { Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, UpdateDateColumn } from 'typeorm';

import { Role } from '../../common/enums/role.enum';
import { Property } from '../../properties/entities/property.entity';

@Entity()
export class User {
    @Column({ primary: true, generated: true })
    id: number;

    @Column({ nullable: true })
    name: string;

    @Column()
    email: string;

    @Column({ unique: true, nullable: false, select: false })
    password: string;

    @Column({ type: 'enum', enum: Role, default: Role.USER })
    role: Role;

    @Column({ nullable: true })
    phone: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @DeleteDateColumn()
    deleted_at: Date;

    @OneToMany(() => Property, (property) => property.created_by)
    properties: Property[];
}
