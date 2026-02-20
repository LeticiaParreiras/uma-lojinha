import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Product } from "./entities/product.entity";
import { Repository } from "typeorm";
import { ProductImage } from "./entities/image.entity";
import { imageProductDto } from "./dto/image.dto";

Injectable()
export class ImageService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private productImageRepository: Repository<ProductImage>,
  ) {}

  async getImagesProduct(productId : string){
    return await  this.productImageRepository.findBy({product: { id: productId}})
  }
  async getOneImage(id : string){
    return await  this.productImageRepository.findOne({where: {id}})
  }


   async saveImage(file: Express.Multer.File, productId: string): Promise<ProductImage> {
    const product = await this.productsRepository.findOne({
  where: { id: productId }
});

if (!product) {
  throw new NotFoundException('Produto não encontrado');
}
    let images = await this.getImagesProduct(productId)
    let p = 0
    if(images){
        const imageLen = images.length
        p = imageLen
    }
    const image = this.productImageRepository.create({
      mimetype: file.mimetype,
      data: file.buffer,
      position: p,
      product: product,
  });
    return this.productImageRepository.save(image);
  }

  async changePosition(productId: string, imagesList: imageProductDto){
   for (const img of imagesList.image) {
    const image = await this.productImageRepository.findOne({
      where: {
        id: img.id,
        product: { id: productId },
      },
    });

    if (!image) {
      throw new NotFoundException(`Imagem ${img.id} não encontrada`);
    }
  const result = await this.productImageRepository.update(img.id, {
  position: img.position,
});
  if (result.affected === 0) {
      throw new BadRequestException(`Imagem ${img.id} não encontrada`);
    }
  }
  }
  async deleteImage(id: string) {
    const image = await this.productImageRepository.findOneBy({id});
    if (!image) return null;
    return await this.productImageRepository.remove(image);
}

}