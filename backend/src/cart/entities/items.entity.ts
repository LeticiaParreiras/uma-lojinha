import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm"
import { Cart } from "./cart.entity";
import { Product } from "src/products/entities/product.entity";
import { nanoid } from "nanoid";

@Entity("cartItem")
export class CartItem{
    @PrimaryColumn()
    id: string;

    @Column()
    quantity: number;
    
    @ManyToOne(() => Product, (Product) => Product.CartItem)
    @JoinColumn({ name: 'ProductId' })
    Product: Product;

    @ManyToOne(() => Cart, (Cart) => Cart.CartItems, {onDelete: 'CASCADE' })
    @JoinColumn({ name: 'CartId' }) 
    Cart: Cart;

    @BeforeInsert()
    generateID(){
        this.id = `item_${nanoid()}`
    }
    get totalPrice(): number {
        return this.Product? this.quantity * this.Product.price : 0;
  }
}