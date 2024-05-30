import { Column, Entity, ManyToOne } from "typeorm";
import { Property } from "../../properties/entities/property.entity";

@Entity()
export class Favorite {
    @Column({ primary: true, generated: true })
    id: number;

    @Column()
    userId: number;

    @ManyToOne(() => Property, property => property.favorites, { onDelete: 'CASCADE', orphanedRowAction: 'delete' })
    property: Property;
    
    @Column({ nullable: true })
    propertyId: number;
}
