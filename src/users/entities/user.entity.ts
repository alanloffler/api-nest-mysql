import { Property } from 'src/properties/entities/property.entity';
import { Column, CreateDateColumn, Entity, OneToMany, UpdateDateColumn } from 'typeorm';

@Entity()
export class User {
    @Column({ primary: true, generated: true })
    id: number;

    @Column()
    name: string;

    @Column()
    email: string;

    @Column()
    password: string;

    @Column({ default: 'user' })
    type: string;

    @Column({ nullable: true })
    phone: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @OneToMany(() => Property, (property) => property.created_by)
    properties: Property[];
}
