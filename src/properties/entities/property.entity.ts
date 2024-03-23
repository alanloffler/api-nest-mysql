import { User } from 'src/users/entities/user.entity';
import { Column, CreateDateColumn, Entity, ManyToOne, UpdateDateColumn } from 'typeorm';

@Entity()
export class Property {
    @Column({ primary: true, generated: true })
    id: number;
    @Column()
    type: string;
    @Column()
    color: string;
    @Column()
    business_type: string;
    @Column({ type: 'tinyint' })
    is_active: number;
    @Column()
    title: string;
    @Column()
    short_description: string;
    @Column({ type: 'longtext' })
    long_description: string;
    @Column()
    price: number;

    @CreateDateColumn()
    created_at: Date;
    @UpdateDateColumn()
    updated_at: Date;

    @ManyToOne(() => User, (user) => user.id, { eager: true })
    created_by: User;
}
