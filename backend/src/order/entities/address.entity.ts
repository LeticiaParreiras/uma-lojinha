import { nanoid } from "nanoid";
import { BeforeInsert, Column, Entity, OneToOne, PrimaryColumn } from "typeorm";
import { Order } from "./order.entity";

@Entity("address")
export class Address{
    @PrimaryColumn()
      id: string;
    @Column({ length: 100 })
    name: string;

    @Column({length: 8})
    cep: string;

    @Column({ length: 2})
    uf: string;

    @Column({ length: 50})
    cidade: string;

    @Column({ length: 50})
    bairro: string;

    @Column({ length: 100})
    logradouro: string;

    @Column({ length: 10})
    numero: string;
    @Column({ length: 100, nullable: true})
    complemento: string;

    @OneToOne(() => Order, (order) => order.address, )
    order: Order;

    @BeforeInsert()
      generateID() {
        this.id = `address_${nanoid()}`;
      }
}