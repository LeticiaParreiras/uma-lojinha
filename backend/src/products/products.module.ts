import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { AuthModule } from 'src/auth/auth.module';
import { ImageService } from './image.service';
import { ProductImage } from './entities/image.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, ProductImage]), AuthModule, ],
  controllers: [ProductsController],
  providers: [ProductsService, ImageService],
})
export class ProductsModule {}
