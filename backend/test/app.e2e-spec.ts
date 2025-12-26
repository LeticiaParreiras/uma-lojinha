import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { faker } from '@faker-js/faker';
import { ConfigService } from '@nestjs/config';

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
  let authToken: string;
  

  const testUser = {
    username: faker.person.fullName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
  };

  let createdProducts: Product[] = [];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ConfigService)
      .useValue({
        get: (key: string) => {
          const config = {
            DB_TYPE: 'sqlite',
            DB_DATABASE: ':memory:',
            DB_SYNCHRONIZE: true,
            JWT_SECRET: 'test-secret-key',
          };
          return config[key];
        },
        getOrThrow: (key: string) => {
          const config = {
            DB_TYPE: 'sqlite',
            DB_DATABASE: ':memory:',
            DB_SYNCHRONIZE: true,
            JWT_SECRET: 'test-secret-key',
          };
          const value = config[key];
          if (value === undefined) {
            throw new Error(`Configuration key ${key} is not defined`);
          }
          return value;
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  }, 30000);

  afterAll(async () => {
    // Limpa todos os produtos criados
    for (const id of createdProducts) {
      await request(app.getHttpServer())
        .delete(`/products/${id}`)
        .set('Authorization', `Bearer ${authToken}`);
    }
    createdProducts = []
    await app.close();
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
      const authRes = res.body as AuthRes;
      authToken = authRes.accessToken;
    });
  });

  describe('Produtos', () => {
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
          .set('Authorization', `Bearer ${authToken}`)
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
        .set('Authorization', `Bearer ${authToken}`)
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

    it('/products/:id - Não deve atualizar produto por não ter autorização', async () => {
      return await request(app.getHttpServer())
        .patch(`/products/${createdProducts[2].id}`)
        .send({
          price: parseFloat(faker.commerce.price({ min: 20, max: 1000 }))
        })
        .expect(401);
    });

    it('/products/:id (DELETE) - não deve deletar um produto por não ter autorização', () => {
      return request(app.getHttpServer())
        .delete(`/products/${createdProducts[2].id}`)
        .expect(401);
    });
    it('/products/:id (DELETE) - deve deletar um produto', () => {
      return request(app.getHttpServer())
        .delete(`/products/${createdProducts[2].id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });  
  });  

