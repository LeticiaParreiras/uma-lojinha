import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Address } from './entities/address.entity';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/items.entity';
import { Payment } from './entities/payment.entity';
import { User } from 'src/user/entities/user.entity';
import { Product } from 'src/products/entities/product.entity';
import { Cart } from 'src/cart/entities/cart.entity';
import { CartItem } from 'src/cart/entities/items.entity';
import { CartModule } from 'src/cart/cart.module';
import { CartService } from 'src/cart/cart.service';

@Module({
  imports: [ TypeOrmModule.forFeature([User, Product,Address, OrderItem, Payment, Order, Cart, CartItem,]),
    AuthModule, CartModule],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
