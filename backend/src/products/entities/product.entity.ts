import { nanoid } from "nanoid";
import { BeforeInsert, Column, Entity, PrimaryColumn } from "typeorm";


@Entity ("products")
export class Product 
{
    @PrimaryColumn()
    id: string;

    @Column()
    name: string;

    @Column()
    description: string;
    
    @Column("int")
    price: number;

    @Column()
    quantity: number;
    
    @BeforeInsert()
    generateID(){
    this.id = `product_${nanoid()}`;
    }
}
