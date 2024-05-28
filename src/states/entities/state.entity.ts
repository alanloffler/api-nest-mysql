import { Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Property } from '../../properties/entities/property.entity';
import { City } from 'src/cities/entities/city.entity';

@Entity()
export class State {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    state: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;

    @OneToMany(() => Property, (property) => property.state)
    properties: Property[];

    @OneToMany(() => City, (city) => city.state, { eager: true })
    cities: City[];
}
