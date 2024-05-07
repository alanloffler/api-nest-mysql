import { Column, Entity } from "typeorm";

@Entity()
export class Favorite {
    @Column({ primary: true, generated: true })
    id: number;

    @Column()
    propertyId: number;

    @Column()
    userId: number;
}
