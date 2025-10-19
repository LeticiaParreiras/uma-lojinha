import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';

export interface AuthResponse {
  accessToken: string;
}
describe('API Tests (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  

  const testUser = {
    username: 'testuser',
    email: 'test3@example.com',
    password: 'Test123!',
  };

  const testProduct = {
    name: 'Produto Teste',
    price: 99.99,
    description: 'Descrição do produto teste',
    quantity: 10,
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: 'test.sqlite', // banco específico para testes
          entities: [__dirname + '/../**/*.entity{.ts,.js}'],
          synchronize: true,
          dropSchema: true // limpa o banco a cada execução
        }),
        AppModule
      ],
    }).compile();
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
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

    it('/auth/login (POST) - deve fazer login com sucesso', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(201);

      expect(response.body).toHaveProperty('accessToken');
      const authResponse = response.body as AuthResponse;
      authToken = authResponse.accessToken;
    });
  });

  describe('Produtos', () => {
    let productId: string;

    it('/products (POST) - deve criar um novo produto', () => {
      return request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testProduct)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          productId = res.body.id;
        });
    });

    it('/products (GET) - deve listar todos os produtos', () => {
      return request(app.getHttpServer())
        .get('/products')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
        });
    });

    it('/products/:id (GET) - deve retornar um produto específico', () => {
      return request(app.getHttpServer())
        .get(`/products/${productId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe(testProduct.name);
        });
    });

    it('/products/:id (PATCH) - deve atualizar um produto', () => {
      return request(app.getHttpServer())
        .patch(`/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ price: 89.99 })
        .expect(200)
        .expect((res) => {
          expect(res.body.price).toBe(89.99);
        });
    });

    it('/products/:id (DELETE) - deve deletar um produto', () => {
      return request(app.getHttpServer())
        .delete(`/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });
});
