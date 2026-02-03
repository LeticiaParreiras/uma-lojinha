import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { CurrentUserDto } from 'src/auth/dto/current-user.dto';
import { ItemDto } from './dto/items.dto';
import { CartResponse } from './dto/cart-response';
import { ItemResponse } from './dto/item-response';
import { itemUpdate } from './dto/item-update';
import { ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';

@ApiBearerAuth('BearerAuth')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get current user cart',
  })
  async findOne(@CurrentUser() user: CurrentUserDto) {
    const cart = await this.cartService.findOne(user);
    return CartResponse.fromEntity(cart)
  }
 

  @Post('new-item')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Add new item in cart'
  })
  async addItem(@CurrentUser() user: CurrentUserDto, @Body()item : ItemDto){
    const itemResponse = await this.cartService.addItem(item, user)
    return ItemResponse.fromEntity(itemResponse)
  }
  @Patch(':itemId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Update cart item'
  })
  @ApiParam({
    name: 'itemId',
    description: 'cart item id',
    example: 'item_...'
  })
  async update(@CurrentUser() user: CurrentUserDto, @Param('itemId') itemId : string ,@Body() itemDto: itemUpdate) {
    const itemResponse = await this.cartService.updateItem(user,itemId, itemDto );
    return ItemResponse.fromEntity(itemResponse)
  }

  @Delete(':itemId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Delete cart item'
  })
  @ApiParam({
    name: 'itemId',
    description: 'cart item id',
    example: 'item_...'
  })
  remove(@Param('itemId') itemId: string, @CurrentUser() user: CurrentUserDto) {
    return this.cartService.deleteItem(user, itemId);
  }
}
