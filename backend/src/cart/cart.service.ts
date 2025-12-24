import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { CartItem } from './entities/items.entity';
import { CurrentUserDto } from 'src/auth/dto/current-user.dto';
import { ItemDto } from './dto/items.dto';
import { Product } from 'src/products/entities/product.entity';
import { itemUpdate } from './dto/item-update';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository <Cart>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(CartItem)
    private items: Repository<CartItem>,
    @InjectRepository(Product)
    private product: Repository<Product>,

  ) {}
  async create(user: CurrentUserDto) {
    const findUser =  await this.userRepository.findOne({
      where: { id: user.userId },
      relations: ['Cart']
    });
    if (!findUser){
      throw new BadRequestException ('User not found')
    }
    // se ja existir
    if (findUser.Cart){
      return findUser.Cart
    }
    const cart = this.cartRepository.create({
      user : findUser,
      CartItems: []
    })
    return await this.cartRepository.save(cart)
  }

  async findOne(user: CurrentUserDto) {
   const cart = await this.cartRepository.findOne({
      where: {user: {id: user.userId}},
      relations: { CartItems: {Product: true,}, }
    })
    // se não acha carrinho
    if(!cart){
        throw new NotFoundException ('User cart not found')
    }
    return cart
  }

  async addItem(item : ItemDto, user: CurrentUserDto) {
    const cart = await this.cartRepository.findOne({
      where: {user: {id: user.userId}},
      relations: { CartItems: {Product: true,}, }
    })
    if (!cart){
      throw new NotFoundException('User cart not found')
    }
    const product = await this.product.findOne({
      where: {id: item.productId},
      select: ['id', 'price', 'quantity']
  })
    if (!product){
      throw new NotFoundException('Product not found')
    }
    let cartItem = await this.items.findOne({
      where:{ Cart: cart, Product: product}
    })
    //Se ja tiver o produto no carrinho, atualiza
    if (cartItem){
      cartItem.quantity += item.quantity
    }
    //Se não cria um novo
    else{
      cartItem =  this.items.create({
        quantity: item.quantity,
        Product: product,
        Cart: cart,
    })
  }
  // Validação no estoque
  if(cartItem.quantity> product.quantity){
    throw new BadRequestException('Insufficient stock')
  }
    return this.items.save(cartItem)
  }
  async updateItem(user : CurrentUserDto, itemId :string, item : itemUpdate ){
    const cartItem = await this.items.findOne({
      where:{ id: itemId, Cart: {
        user: {id: user.userId}
      }},
      relations: ['Product']
    })
    if(!cartItem){
      throw new NotFoundException('Cart item not found')
    }
    if (!cartItem.Product){
      await this.items.remove(cartItem)
      throw new NotFoundException('Product not found')
    }
    if(item.quantity > cartItem.Product.quantity){
      throw new BadRequestException('Insufficient stock')
    }
    cartItem.quantity = item.quantity
    return this.items.save(cartItem)
  }
  async deleteItem(user : CurrentUserDto, itemId: string){
     const cartItem = await this.items.findOne({
      where:{ id: itemId, Cart: {
        user: {id: user.userId}
      }}
    })
    if(!cartItem){
      throw new NotFoundException('Cart item not found')
    }
   await this.items.remove(cartItem)
   return { message : "Item removed successfully"}
  }
}