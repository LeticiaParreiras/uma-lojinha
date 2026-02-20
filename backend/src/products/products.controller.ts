import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, NotFoundException, Res } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { PaginationDto } from './dto/pagination.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageService } from './image.service';
import { Response } from 'express';
import { imageProductDto } from './dto/image.dto';


@Controller('products')
export class ProductsController {
 
  constructor(
    private readonly productsService: ProductsService,
    private readonly ImageService: ImageService
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @Roles('admin')
  @ApiBearerAuth('BearerAuth')
  @ApiOperation({
      summary: "Create an Product",
      tags: ['Admin Products']
    })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @ApiOperation({summary: "Get all products",})
  @ApiQuery({name: 'offset', required: false, example: 0})
  @ApiQuery({name: 'limit', required: false, example: 10})
  @ApiQuery({name: 'search', required: false, example: ""})
  findAll(@Query() paginationDto: PaginationDto) {
    return this.productsService.findAll(paginationDto);
  }

  @Get(':productId')
  @ApiOperation({
      summary: "Get one product",
    })
  @ApiParam({name:'productId', example: "product_..."})
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':productId')
  @Roles('admin')
  @ApiBearerAuth('BearerAuth')
  @ApiOperation({summary: "Update an Product", tags: ['Admin Products']})
  @ApiParam({name:'productId', example: "product_..."})
  update(@Param('productId') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':productId')
  @UseGuards(JwtAuthGuard)
  @Roles('admin')
  @ApiBearerAuth('BearerAuth')
  @ApiOperation({summary: "Remove an Product", tags: ['Admin Products']})
  @ApiParam({name:'productId', example: "product_..."})
  remove(@Param('productId') id: string) {
    return this.productsService.remove(id);
  }

  

@Post('image/:productId')
 @UseGuards(JwtAuthGuard)
@Roles('admin')
@ApiOperation({summary: "Upload Image for product.", tags: ['Admin Products']})
@ApiParam({name:'productId', example: "product_..."})
 @ApiBearerAuth('BearerAuth')
@UseInterceptors(FileInterceptor('file'))
@ApiConsumes('multipart/form-data')
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      file: {
        type: 'string',
        format: 'binary',
      },
    },
  },
})
async uploadImage(
  @Param('productId') productId: string,
  @UploadedFile(
    new ParseFilePipe({
      validators: [
        new MaxFileSizeValidator({
          maxSize: 4096 * 1024, // 4MB
          message: 'O arquivo deve ter no máximo 4MB.',
        }),
      ],
    }),
  )
  file: Express.Multer.File,
) {
  const image = await this.ImageService.saveImage(file, productId);

  if (image) {
    return {
      message: 'Imagem salva com sucesso no banco!',
      id: image.id,
      product: image.product,
      url: `http://localhost:3000/products/image/${image.id}`,
    };
  }
}

@Get('image/:idImage')
@ApiOperation({summary: "Get One Image", tags: ['Image']})
@ApiParam({name:'id', example: "productImage_..."})
  async getOneImage(@Param('idImage') id: string, @Res() res: Response) {
    const image = await this.ImageService.getOneImage(id);
    if (!image) {
      throw new NotFoundException('Imagem não encontrada');
    }

    res.setHeader('Content-Type', image.mimetype);
    res.send(image.data);
  }
@Get('imagesProduct/:idImage')
@ApiOperation({summary: "Get product Images", tags: ['Image']})
@ApiParam({name:'idImage', example: "productImage_..."})
  async getImagesProducts(@Param('idImage') id: string) {
    const images = await this.ImageService.getImagesProduct(id);
    if (!images || images.length === 0) {
      throw new NotFoundException('Imagem não encontrada');
    }
    //retorna em ordem na base da posição
    const sortedImages = images.sort((a, b) => a.position - b.position);

  return sortedImages.map((img) => ({
    id: img.id,
    position: img.position,
    url: `http://localhost:3000/products/image/${img.id}`,
  }));
  }
  
  @Patch('images/:productId')
  @UseGuards(JwtAuthGuard)
  @Roles('admin')
  @ApiBearerAuth('BearerAuth')
  @ApiOperation({summary: "Change the position of the list images for the one product.", tags: ['Admin Products']})
  @ApiParam({name:'productId', example: "product_..."})
  async changePosition(@Param('productId') id: string, @Body() imageList : imageProductDto){
    await this.ImageService.changePosition(id, imageList)
    return "Imagens atualizadas"
  }


  @Delete('images/:idImage')
  @UseGuards(JwtAuthGuard)
  @Roles('admin')
  @ApiBearerAuth('BearerAuth')
  @ApiOperation({summary: "Delete image.", tags: ['Admin Products']})
  @ApiParam({name:'idImage', example: "productImage_..."})
  async deleteImage(@Param('idImage') id: string){
    const image = await this.ImageService.deleteImage(id)
    if (!image) {
      throw new NotFoundException('Imagem não encontrada');
    }
    return { message: 'Imagem deletada com sucesso' };
  }

}
