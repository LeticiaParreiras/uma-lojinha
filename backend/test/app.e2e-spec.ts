import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { faker } from '@faker-js/faker';
import { ConfigService } from '@nestjs/config';
import { User, UserRole } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

export interface AuthRes {
  accessToken: string;
}
interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  quantity: number;
}
describe('API Tests (e2e)', () => {
  let app: INestApplication;
  let userToken: string;
  let admToken: string;
  let userRepo: Repository<User>;
  

  const testUser = {
    username: faker.person.fullName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
  };

    const testAdmin= {
    username: faker.person.fullName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
  };
  let createdProducts: Product[] = [];

beforeAll(async () => {
    // ✅ Garante que está em modo teste
    process.env.NODE_ENV = 'test';
    
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    userRepo = moduleFixture.get<Repository<User>>(
      getRepositoryToken(User),);
    await app.init();
  }, 30000);

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });
  describe('App', () => {
    it('/ (GET)', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect('Hello World!');
    });
  });
  

  describe('Autenticação', () => {
    it('/auth/login (POST) - não deve fazer login por falta de cadastro', async () => {
      return await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: faker.internet.email(),
          password: faker.internet.password(),
        })
        .expect(400);
      })

    it('/auth/register (POST) - deve criar um novo usuário', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.email).toBe(testUser.email);
          expect(res.body).not.toHaveProperty('password');
  
        });
    });
    it('/auth/register (POST) - não deve criar um novo usuário, email ja utilizado', async () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(400)
    });

    it('/auth/login (POST) - deve fazer login com sucesso', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(201);

      expect(res.body).toHaveProperty('accessToken');
    });
  });

  describe('Rotas do Administrador', () => {
    it('/auth/register (POST) - deve criar e transformar em admin', async () => {
      // 1. Cria o usuário via API
      const registerRes = await request(app.getHttpServer())
        .post('/auth/admin/register')
        .send(testAdmin)
        .expect(201);
      expect(registerRes.body).toHaveProperty('id');
      expect(registerRes.body.role).toBe('admin');

      // 3. Agora, ao fazer login, o token terá privilégios de admin
      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testAdmin.email,
          password: testAdmin.password,
        })
        .expect(201);

      admToken = loginRes.body.accessToken;
    });
    it('/products (POST) - deve criar um novos produtos', async () => {

      for(let p=0; p<3; p++) {
        const product = {
          name: faker.commerce.productName(),
          price: parseFloat(faker.commerce.price({ min: 20, max: 1000 })),
          description: faker.commerce.productDescription(),
          quantity: faker.number.int({ min: 1, max: 100 })
        }
        const res = await request(app.getHttpServer())
          .post('/products')
          .set('Authorization', `Bearer ${admToken}`)
          .send(product)
          .expect(201)
        expect(res.body).toHaveProperty('id');
        expect(res.body.name).toBe(product.name);
        expect(res.body.price).toBe(product.price);
        expect(res.body.description).toBe(product.description);
        expect(res.body.quantity).toBe(product.quantity);
        createdProducts.push(res.body as Product);
      };
    });

    it('/products (GET) - deve listar todos os produtos', async () => {
      const res = await request(app.getHttpServer())
        .get('/products')
        .expect(200)
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(3);
    });

    it('/products/:id (GET) - deve retornar um produto específico', async () => {
      const expectedProduct = createdProducts[0];
      const res = await request(app.getHttpServer())
        .get(`/products/${expectedProduct.id}`)
        .expect(200);
      expect(res.body.name).toBe(expectedProduct.name);
      expect(res.body.price).toBe(expectedProduct.price);
      expect(res.body.description).toBe(expectedProduct.description);
      expect(res.body.quantity).toBe(expectedProduct.quantity);
    });

    it('/products/:id (PATCH) - deve atualizar um produto', async () => {
      const newPrice = parseFloat(faker.commerce.price({ min: 20, max: 1000 }));
      const newDescription = faker.commerce.productDescription();
      const newQuantity = faker.number.int({ min: 1, max: 100 });
      const res = await  request(app.getHttpServer())
        .patch(`/products/${createdProducts[2].id}`)
        .set('Authorization', `Bearer ${admToken}`)
        .send({ 
          price: newPrice,
          description: newDescription,
          quantity: newQuantity,
        })
        .expect(200)
      expect(res.body.price).toBe(newPrice);
      expect(res.body.description).toBe(newDescription);
      expect(res.body.quantity).toBe(newQuantity);
      
    });

    
    it('/products/:id (DELETE) - deve deletar um produto', () => {
      return request(app.getHttpServer())
        .delete(`/products/${createdProducts[2].id}`)
        .set('Authorization', `Bearer ${admToken}`)
        .expect(200);
    });
  });
    describe('Rotas de usuario', () =>{

      it('/auth/login (POST) - deve fazer login usuário', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(201);
      expect(res.body).toHaveProperty('accessToken');
      
      userToken = res.body.accessToken;
    });
    it('/products (POST) - Não deve criar um novo produto por não ter autorização', async () => {
        const product = {
          name: faker.commerce.productName(),
          price: parseFloat(faker.commerce.price({ min: 20, max: 1000 })),
          description: faker.commerce.productDescription(),
          quantity: faker.number.int({ min: 1, max: 100 })
        }
        await request(app.getHttpServer())
          .post('/products')
          .set('Authorization', `Bearer ${userToken}`)
          .send(product)
          .expect(403)
      
    });
    it('/products/:id - Não deve atualizar produto por não ter autorização', async () => {
      return await request(app.getHttpServer())
        .patch(`/products/${createdProducts[1].id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          price: parseFloat(faker.commerce.price({ min: 20, max: 1000 }))
        })
        .expect(403);
    });

    it('/products/:id (DELETE) - não deve deletar um produto por não ter autorização', () => {
      return request(app.getHttpServer())
        .delete(`/products/${createdProducts[1].id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
     it('/cart (GET) - Deve retorna carinho do usuário', async () =>{
      const cart = await request(app.getHttpServer()).get(`/cart`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200)
      expect(cart.body).toHaveProperty('id');
      expect(cart.body).toHaveProperty('cartItems');
      expect(cart.body.cartItems).toHaveLength(0)
     })
     it('/cart/new-item (POST) - deve adicionar item no carrinho', async () =>{
      const item = {
        productId : createdProducts[0].id,
        quantity: faker.number.int({ min: 1, max:  createdProducts[0].quantity})
      }
      const cartItem = await request(app.getHttpServer()).
      post('/cart/new-item')
      .set('Authorization', `Bearer ${userToken}`)
      .send(item)
      .expect(201)
      expect(cartItem.body.product.id).toBe(item.productId)
      expect(cartItem.body.quantity).toBe(item.quantity)
      expect(cartItem.body.totalPrice).toBe(+(item.quantity* createdProducts[0].price).toFixed(2))
      const cart = await request(app.getHttpServer()).get(`/cart`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200)
      expect(cart.body.cartItems).toHaveLength(1)
     })
     it ('/cart/:itemId (PATCH) - deve atualizar item do carrinho', async () =>{
      const newQuantity = faker.number.int({ min: 1, max:  createdProducts[0].quantity})
      const cart = await request(app.getHttpServer())
      .get(`/cart`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200)
      expect(cart.body.cartItems).toHaveLength(1)
      expect(cart.body.cartItems[0]).toHaveProperty('id')
      const cartItem = cart.body.cartItems[0].id
      const newCartItem = await request(app.getHttpServer())
      .patch(`/cart/${cartItem}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({quantity: newQuantity})
      .expect(200)
      expect(newCartItem.body.quantity).toBe(newQuantity)
    });
     it ('/cart/:itemId (PATCH) - não deve atualizar item do carrinho por quantidade ser maior no estoque', async () =>{
      const newQuantity =  createdProducts[0].quantity + 1
      const cart = await request(app.getHttpServer())
      .get(`/cart`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200)
      expect(cart.body.cartItems).toHaveLength(1)
      expect(cart.body.cartItems[0]).toHaveProperty('id')
      const cartItem = cart.body.cartItems[0].id
      await request(app.getHttpServer())
      .patch(`/cart/${cartItem}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({quantity: newQuantity})
      .expect(400)
    });
    it('cart/:itemId (DELETE) - Deve deletar item do carrinho', async () =>{
      const cart = await request(app.getHttpServer())
      .get(`/cart`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200)
      expect(cart.body.cartItems).toHaveLength(1)
      expect(cart.body.cartItems[0]).toHaveProperty('id')
      const cartItem = cart.body.cartItems[0].id
      await request(app.getHttpServer())
      .delete(`/cart/${cartItem}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200)
      const updatedCart = await request(app.getHttpServer()) 
    .get('/cart')
    .set('Authorization', `Bearer ${userToken}`)
    .expect(200);
    expect(updatedCart.body.cartItems).toHaveLength(0)
    })
  })
});  

