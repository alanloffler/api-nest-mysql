import { Property } from "src/properties/entities/property.entity";
import { Column, Entity, ManyToOne } from "typeorm";

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
