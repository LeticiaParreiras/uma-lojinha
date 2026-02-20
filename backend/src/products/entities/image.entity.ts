import { nanoid } from "nanoid";
import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { Product } from "./product.entity";

@Entity("ProductImage")
export class ProductImage {
    @PrimaryColumn()
    id: string;
    
    @ManyToOne(() => Product, (product) => product.images, {cascade: true})
    @JoinColumn({ name: 'productId' })
    product: Product

    @Column()
    mimetype: string;

    @Column()
    position: number //posição na array de imagens do produto

    @Column({ type: 'blob' })
    data: Buffer;

    @BeforeInsert()
        generateID(){
        this.id = `productImage_${nanoid()}`;
        }
}