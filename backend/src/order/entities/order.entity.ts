import { nanoid } from "nanoid";
import { User } from "src/user/entities/user.entity";
import { BeforeInsert, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { Address } from "./address.entity";
import { Payment } from "./payment.entity";
import { OrderItem } from "./items.entity";

export enum status{
    pending = "pending",
    canceled = "canceled",
    route = "in route",
    finish = "finish"
}
@Entity("Orders")
export class Order {
    @PrimaryColumn()
      id: string;
    
      @CreateDateColumn({type: 'datetime'})
      createAt: Date

      @UpdateDateColumn({type: 'datetime'})
      updateAt: Date

      @Column({type: "varchar", default: status.pending})
      status: status

      @ManyToOne(() => User, (user) => user.orders)
      @JoinColumn({name: 'userId'})
      user: User

      @OneToOne(() => Address, (address) => address.order, {cascade: true})
      @JoinColumn({name: 'addressId'})
      address: Address;


      @OneToMany(() => OrderItem, (orderItem) => orderItem.order, {cascade: true})
      orderItems: OrderItem[];
      @OneToOne(() => Payment, (payment) => payment.order, {cascade: true})   
      @JoinColumn({name: 'paymentId'})
      payment: Payment;

      @BeforeInsert()
          generateID(){
          this.id = `order_${nanoid()}`;
        }
}
