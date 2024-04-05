import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Property } from '../../properties/entities/property.entity';
import { User } from 'src/users/entities/user.entity';

@Entity()
export class Image {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'uploaded_by', referencedColumnName: 'id' })
    user: User;
    @Column()
    uploaded_by: number;

    @ManyToOne(() => Property, (property) => property.images, { onDelete: 'CASCADE', onUpdate: 'CASCADE' } )
    property: Property;
    @Column({ nullable: true })
    propertyId: number;

    @CreateDateColumn()
    created_at: Date;

    @DeleteDateColumn()
    deletedAt: Date;
}
