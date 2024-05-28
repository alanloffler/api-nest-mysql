import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Property } from "../../properties/entities/property.entity";
import { State } from "../../states/entities/state.entity";

@Entity()
export class City {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column({ unique: true })
    city: string;

    @Column()
    zip: string;
    
    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date | null;

    @ManyToOne(() => State, (state) => state.id)
    @JoinColumn({ name: 'state', referencedColumnName: 'id' })
    state: State;

    @OneToMany(() => Property, (property) => property.state)
    properties: Property[];
}
