import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { CurrentUserDto } from 'src/auth/dto/current-user.dto';
import { ItemDto } from './dto/items.dto';
import { CartResponse } from './dto/cart-response';
import { ItemResponse } from './dto/item-response';
import { itemUpdate } from './dto/item-update';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  //Cria carrinho
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@CurrentUser() user: CurrentUserDto) {
    const cart = await this.cartService.create(user);
    return CartResponse.fromEntity(cart)
  }
  //Acha carrinho do usuario
  @Get()
  @UseGuards(JwtAuthGuard)
  async findOne(@CurrentUser() user: CurrentUserDto) {
    const cart = await this.cartService.findOne(user);
    return CartResponse.fromEntity(cart)
  }
  // Adiciona item no carrinho
  @Post('new-item')
  @UseGuards(JwtAuthGuard)
  async addItem(@CurrentUser() user: CurrentUserDto, @Body()item : ItemDto){
    const itemResponse = await this.cartService.addItem(item, user)
    return ItemResponse.fromEntity(itemResponse)
  }
  //Atualiza item do carrinho
  @Patch(':itemId')
  @UseGuards(JwtAuthGuard)
  async update(@CurrentUser() user: CurrentUserDto, @Param('itemId') itemId : string ,@Body() itemDto: itemUpdate) {
    const itemResponse = await this.cartService.updateItem(user,itemId, itemDto );
    return ItemResponse.fromEntity(itemResponse)
  }

  @Delete(':itemId')
  @UseGuards(JwtAuthGuard)
  remove(@Param('itemId') itemId: string, @CurrentUser() user: CurrentUserDto) {
    return this.cartService.deleteItem(user, itemId);
  }
}
