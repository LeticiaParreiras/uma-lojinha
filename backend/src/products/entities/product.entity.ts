import { nanoid } from "nanoid";
import { CartItem } from "src/cart/entities/items.entity";
import { OrderItem } from "src/order/entities/items.entity";
import { BeforeInsert, Column, Entity, OneToMany, PrimaryColumn } from "typeorm";

@Entity ("products")
export class Product 
{
    @PrimaryColumn()
    id: string;

    @Column()
    name: string;

    @Column()
    description: string;
    
    @Column('decimal', { precision: 10, scale: 2 })
    price: number;

    @Column()
    quantity: number;

    @OneToMany(()=>CartItem, (CartItem) => CartItem.Product)
    CartItem: CartItem[];

    @OneToMany(() => OrderItem, (orderItem) => orderItem.Product)
    orderItem: OrderItem[];

    
    @BeforeInsert()
    generateID(){
    this.id = `product_${nanoid()}`;
    }
}
