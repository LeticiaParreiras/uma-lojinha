import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm"

import { Product } from "src/products/entities/product.entity";
import { nanoid } from "nanoid";
import { Order } from "./order.entity";

@Entity("orderItem")
export class OrderItem{
    @PrimaryColumn()
    id: string;

    @Column()
    quantity: number;
    
    @ManyToOne(() => Product, (Product) => Product.orderItem)
    @JoinColumn({ name: 'ProductId' })
    Product: Product;

    @Column('decimal', { precision: 10, scale: 2 })
    price: number;

    @ManyToOne(() => Order, (order) => order.orderItems)
    @JoinColumn({ name: 'OrderId' }) 
    order: Order;

    @BeforeInsert()
    generateID(){
        this.id = `item_${nanoid()}`
    }
}