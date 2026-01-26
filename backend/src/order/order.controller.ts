import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { cepApi } from './dto/address.dto';
import { CurrentUserDto } from 'src/auth/dto/current-user.dto';
import { CurrentUser } from 'src/auth/current-user.decorator';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('address/cep')
  @UseGuards(JwtAuthGuard)
  getAddrressByCep(@Body() dto: cepApi) {
    return this.orderService.findAddressByCep(dto);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createOrderDto: CreateOrderDto, @CurrentUser() user: CurrentUserDto) {
    
    return this.orderService.create(createOrderDto, user);
  }
  /*
  @Post('payment/:orderId')
  @UseGuards(JwtAuthGuard)
  createPayment(@Param('orderId') orderId: string) {
    return this.orderService.createPayment(orderId);
  }*/

  @Get()
  findAll() {
    return this.orderService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.orderService.update(+id, updateOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderService.remove(+id);
  }
}
