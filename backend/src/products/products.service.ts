import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}
  create(dto: CreateProductDto) {
    const product = this.productsRepository.create({
      name: dto.name,
      price: dto.price,
      description: dto.description,
      quantity: dto.quantity,
    }
  );
  return this.productsRepository.save(product)
  }

  findAll() {
    return this.productsRepository.find();
  }

  findOne(id: string) {
    return this.productsRepository.findOneBy({id});
  }

  async update(id: string, dto: UpdateProductDto) {
    const product = await this.productsRepository.findOneBy({ id });
    if (!product) throw new BadRequestException('invalid product');
    this.productsRepository.merge( product, dto );
    return this.productsRepository.save(product);
  }

  async remove(id: string) {
    const product = await this.productsRepository.findOneBy({ id });
    if (!product) throw new BadRequestException('invalid product');
    return this.productsRepository.remove(product);
  }
}
