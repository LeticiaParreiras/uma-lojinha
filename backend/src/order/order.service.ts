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

    // 2. Prepara os objetos dos ITENS 
    const orderItemsEntities = cart.CartItems.map((item) => {
        return this.orderItem.create({
            Product: item.Product,
            quantity: item.quantity,
            price: item.Product.price, 
        });
    });

    // 3. Prepara o objeto do ENDEREÇO 
    const addressEntity = this.address.create({
        ...createOrderDto.address
    });

    // 4. Cria o PEDIDO 
    const order = this.order.create({
        user: { id: user.userId },
        address: addressEntity,   
        orderItems: orderItemsEntities
    });
    
    return await this.order.save(order);
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
