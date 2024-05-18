import { Column, Entity } from 'typeorm';

@Entity()
export class Role {
    @Column({ primary: true, generated: true })
    id: number;

    @Column()
    name: string;

    @Column()
    value: string;

    @Column()
    title: string;
}
