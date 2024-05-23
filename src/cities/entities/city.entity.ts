import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class City {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column({ unique: true })
    city: string;
    
    @Column()
    state: string;

    @Column()
    zip: string;

    @Column()
    createdBy: number;
    
    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;
}
