import { nanoid } from 'nanoid';
import { Cart } from 'src/cart/entities/cart.entity';
import { BeforeInsert, Column, Entity, OneToOne, PrimaryColumn } from 'typeorm';

@Entity("users")
export class User {
    @PrimaryColumn()
    id: string;

    @Column()
    username: string;

    @Column()
    email: string;

    @Column()
    password: string;

    @OneToOne(() => Cart, (Cart) => Cart.user, {
      cascade: true
    })
    Cart : Cart;

    @BeforeInsert()
    generateID(){
    this.id = `user_${nanoid()}`;
  }
}
