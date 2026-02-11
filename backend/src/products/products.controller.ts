import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { PaginationDto } from './dto/pagination.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

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

  @UseGuards(JwtAuthGuard)
  @Delete(':productId')
  @Roles('admin')
  @ApiBearerAuth('BearerAuth')
  @ApiOperation({summary: "Remove an Product", tags: ['Admin Products']})
  @ApiParam({name:'productId', example: "product_..."})
  remove(@Param('productId') id: string) {
    return this.productsService.remove(id);
  }
}
