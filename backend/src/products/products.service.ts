import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { ILike, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from './dto/pagination.dto';

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

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0, search = '' } = paginationDto; //definine valores do limit e offset caso não sejam fornecidos
    const [products, total] = await this.productsRepository.findAndCount({
      take: limit, // limite de itens a serem retornados
      skip: offset, // número de itens a serem pulados 
      where: search ? { name: ILike(`%${search}%`) } : {}, // filtro de busca por nome, usando ILike para busca case-insensitive
    });
    return {
      data: products,
      count: total,
    };
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
