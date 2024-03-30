import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

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

    @DeleteDateColumn()
    deleted_at: Date;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'created_by', referencedColumnName: 'id' })
    user: User;

    @Column()
    created_by: number;
}
