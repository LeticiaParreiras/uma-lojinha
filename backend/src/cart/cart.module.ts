import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/items.entity';
import { Product } from 'src/products/entities/product.entity';

@Module({
  controllers: [CartController],
  providers: [CartService],
  imports: [
    TypeOrmModule.forFeature([User, Cart, CartItem, Product
    ]),
  ]
})
export class CartModule {}
