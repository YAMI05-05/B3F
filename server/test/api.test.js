const request = require('supertest');
require('dotenv').config();
const path = require('path');

const BASE_URL = `http://localhost:${process.env.PORT || 4000}`;

describe('open API Tests', () => {
  it('should create a new user without an image', async () => {
    const uniqueUsername = `testuser_noimage_${Date.now()}`;
    const uniqueEmail = `noimage_${Date.now()}@example.com`;

    const res = await request(BASE_URL)
  .post('/api/users/register')
  .send({
    username: uniqueUsername,
    email: uniqueEmail,
    password: 'securepassword123',
    name: 'name',
    role: 'buyer' // <-- use a valid role
  })
  .set('Accept', 'application/json');

    console.log(res.body)
    expect(res.body.success).toBe(true);
    expect(res.body.message).toEqual('User registered successfully');
    expect(res.body.user).toHaveProperty('id');
    expect(res.body.user.username).toEqual(uniqueUsername);
    expect(res.body.user.email).toEqual(uniqueEmail);
    expect(res.body.user.image).toBeNull();
    expect(res.body.user.isAdmin).toBe(false);
  }); });

  it('should login user with correct credentials from DB', async () => {
    const res = await request(BASE_URL)
      .post('/api/users/login')
      .send({
        email: 'john@gmail.com',
        password: 'john123' // this must match the original unhashed password
      });
  
    console.log(res.body);
  
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('email');
    expect(res.body.user.email).toEqual('john@gmail.com');
    expect(res.body.user.role).toEqual('buyer');
  });
  
  

  it('should update user profile successfully', async () => {
    const token = 'user_jwt_token';
  
    const res = await request(BASE_URL)
      .put('/api/users/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Updated Name',
        password: 'newsecurepassword123'
      });
  
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Profile updated successfully');
  });

  // it('should not login with incorrect password', async () => {
  //   const res = await request(BASE_URL)
  //     .post('/api/users/login')
  //     .send({
  //       email: 'test@example.com',
  //       password: 'wrongpassword'
  //     });
  
  //   expect(res.status).toBe(401);
  //   expect(res.body.success).toBe(false);
  //   expect(res.body.message).toEqual('Invalid email or password');
  // });

  // it('should create a product when seller is authenticated', async () => {
  //   const sellerToken = 'your_seller_jwt_token_here';
  
  //   const res = await request(BASE_URL)
  //     .post('/api/products')
  //     .set('Authorization', `Bearer ${sellerToken}`)
  //     .field('name', 'Test Product')
  //     .field('description', 'Test description')
  //     .field('price', '199.99')
  //     .field('offerPrice', '149.99')
  //     .field('category', 'electronics');
  
  //   expect(res.body.success).toBe(true);
  //   expect(res.body.product).toHaveProperty('id');
  //   expect(res.body.product.name).toBe('Test Product');
  // });
  