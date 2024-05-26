import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Image } from '../../images/entities/image.entity';
import { Favorite } from 'src/favorites/entities/favorite.entity';

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
    
    @OneToMany(() => Favorite, favorite => favorite.propertyId)
    favorites: Favorite[];
    // @OneToMany(() => Image, (image) => image.property, { cascade: true, onDelete: 'CASCADE' })
    @OneToMany(() => Image, (image) => image.property)
    images: Image[];

    @Column('decimal', { precision: 20, scale: 15, default: 0})
    lat?: number;

    @Column('decimal', { precision: 20, scale: 15, default: 0 })
    lng?: number;

    @Column({ default: null })
    key?: string;

    @Column({ default: 0 })
    zoom?: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @DeleteDateColumn()
    deletedAt: Date;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'created_by', referencedColumnName: 'id' })
    user: User;

    @Column()
    created_by: number;

    @Column()
    street: string;

    @Column()
    city: string;

    @Column()
    state: string;

    @Column()
    zip: string;
}
