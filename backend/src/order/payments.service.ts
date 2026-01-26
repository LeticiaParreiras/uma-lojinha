import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Order } from "./entities/order.entity";
import { Repository } from "typeorm";
import { Address } from "./entities/address.entity";
import { OrderItem } from "./entities/items.entity";
import { Payment } from "./entities/payment.entity";
import { Cart } from "src/cart/entities/cart.entity";
import { CartService } from 'src/cart/cart.service';

@Injectable()
export class PaymentsService {
    constructor(
        @InjectRepository(Order)
            private order: Repository<Order>,
            @InjectRepository(Address)
            private address: Repository<Address>,
            @InjectRepository(OrderItem)
            private orderItem: Repository<OrderItem>,
            @InjectRepository(Payment)
            private payment: Repository<Payment>,
            @InjectRepository(Cart)
            private cart: Repository<Cart>,
            
            private readonly CartService: CartService,
    ) {}
async createPreferences(items: any){
     // Montar o payload do Mercado Pago
    const payload = {
      items: items, 
      back_urls: { 
        success: 'https://localhost:3000/sucesso',
        failure: 'https://localhost:3000/falha',
        pending: 'https://localhost:3000/pendente',
      },
      auto_return: 'all',
    };

    // 3. Fazer a chamada 
    try {
      const response = await fetch(
        'https://api.mercadopago.com/checkout/preferences',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        console.error('Erro MP:', data);
        throw new BadRequestException('Erro ao criar preferência de pagamento');
      }
      
      // Geralmente retornamos o 'init_point' (link para o usuário pagar)
      return { 
          payment_url: data.init_point,
          preference_id: data.id
      };

    } catch (error) {
      console.error(error);
      throw new BadRequestException('Falha na comunicação com gateway de pagamento');
    }
}
async createPayment(orderId: string) {
    const order = await this.order.findOne({
      where: { id: orderId },
      relations: { orderItems: { Product: true }, address: true, user: true },
    });

    if (!order) {
      throw new BadRequestException('Order not found');
    }

    // 1. Mapear os itens 
    const items = order.orderItems.map((item) => ({
      id: item.Product.id,
      title: item.Product.name,
      quantity: item.quantity,
      currency_id: 'BRL',
      unit_price: Number(item.price),
    }));

   const paymentData = await this.createPreferences(items);

   //  Criar a entidade Payment e salvar no banco
   const paymentEntity = this.payment.create({
    order: order,
    preferenceId: paymentData.preference_id,
   });
    await this.payment.save(paymentEntity);
    return paymentData.payment_url
  }
  async updatePayment(orderId: string){
    
  }
}
