import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { cepApi, cepResponse } from './dto/address.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { Address } from './entities/address.entity';
import { OrderItem } from './entities/items.entity';
import { Payment } from './entities/payment.entity';
import { CurrentUserDto } from 'src/auth/dto/current-user.dto';
import { CartService } from 'src/cart/cart.service';
import { CartItem } from 'src/cart/entities/items.entity';
import { Cart } from 'src/cart/entities/cart.entity';
import { th } from '@faker-js/faker';


@Injectable()
export class OrderService {
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
  async create(createOrderDto: CreateOrderDto, user: CurrentUserDto) {
    // 1. Busca o carrinho e seus itens
    const cart = await this.CartService.findOne(user);

    // 2. Prepara os objetos dos ITENS (apenas cria na memória, sem salvar ainda)
    const orderItemsEntities = cart.CartItems.map((item) => {
        return this.orderItem.create({
            Product: item.Product,
            quantity: item.quantity,
            price: item.Product.price, 
        });
    });

    // 3. Prepara o objeto do ENDEREÇO (memória)
    const addressEntity = this.address.create({
        ...createOrderDto.address
    });

    // 4. Cria o PEDIDO com tudo dentro (o 'Pai' abraça os 'Filhos')
    const order = this.order.create({
        user: { id: user.userId },
        address: addressEntity,   
        orderItems: orderItemsEntities
    });

    // 5. O GRANDE FINAL: Um único save resolve tudo!
    return await this.order.save(order);
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

    // 2. Montar o payload do Mercado Pago
    const payload = {
      items: items, // A chave TEM que ser 'items'
      back_urls: { // Opcional, mas recomendado: pra onde o usuário volta?
        success: 'https://localhost:3000/sucesso',
        failure: 'https://localhost:3000/falha',
        pending: 'https://localhost:3000/pendente',
      },
      auto_return: 'all',
    };

    // 3. Fazer a chamada (Assumindo Node v18+ que já tem fetch nativo)
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

      console.log('Payment created:', data);
      
      // Geralmente retornamos o 'init_point' (link para o usuário pagar)
      return { 
          payment_url: data.init_point, 
          sandbox_url: data.sandbox_init_point // Para testes
      };

    } catch (error) {
      console.error(error);
      throw new BadRequestException('Falha na comunicação com gateway de pagamento');
    }
  }


async findAddressByCep(dto: cepApi): Promise<cepResponse> {
  try {
    const response = await fetch(
      `https://viacep.com.br/ws/${dto.cep}/json/`,
    );

    const data = await response.json();

    if (data.erro || !data ) {
      throw new BadRequestException('CEP inválido');
    }

    const cepData: cepResponse = {
      uf: data.uf,
      cidade: data.localidade,
      bairro: data.bairro,
      logradouro: data.logradouro,
      complemento: data.complemento || '',
    };

    return cepData;
  } catch (error) {
    throw new BadRequestException('Erro ao buscar o CEP');
  }
}
  findAll() {
    return `This action returns all order`;
  }

  findOne(id: number) {
    return `This action returns a #${id} order`;
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }
}
