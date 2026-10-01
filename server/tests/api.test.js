const request = require('supertest');
const app = require('../src/server');

describe('Backend API Integration Tests & Admin Security Audit', () => {
  let adminToken = '';

  test('GET /api/health should return status 200', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
  });

  test('POST /api/auth/register should REJECT public registration with role=ADMIN', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Hacker Admin',
        email: 'hacker_admin@defense.gov',
        password: 'password123',
        role: 'ADMIN',
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Public registration for the ADMIN role is strictly prohibited');
  });

  test('POST /api/auth/login should authenticate Default Admin and return JWT token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: process.env.ADMIN_EMAIL || 'admin@acquisition.com',
        password: process.env.ADMIN_PASSWORD || 'Admin@12345',
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.role).toEqual('ADMIN');
    expect(res.body.data.token).toBeDefined();
    adminToken = res.body.data.token;
  });

  test('GET /api/auth/me should return admin user profile with valid JWT', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.data.email).toEqual(process.env.ADMIN_EMAIL || 'admin@acquisition.com');
  });

  test('POST /api/users should allow ADMIN to create new user with assigned role', async () => {
    const newEmail = `officer_${Date.now()}@acquisition.com`;
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        fullName: 'Newly Created Officer',
        email: newEmail,
        password: 'Password@123',
        role: 'PROCUREMENT_OFFICER',
        organization: 'Department of Defense',
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toEqual(newEmail);
    expect(res.body.data.role).toEqual('PROCUREMENT_OFFICER');
  });

  test('GET /api/procurement should return list of procurement requirements for Admin', async () => {
    const res = await request(app)
      .get('/api/procurement')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body.data.requirements)).toBe(true);
  });

  test('GET /api/dashboard/supply-chain-stats should return metrics, charts & tables for ADMIN', async () => {
    const res = await request(app)
      .get('/api/dashboard/supply-chain-stats')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.metrics).toBeDefined();
    expect(res.body.data.metrics.totalShipments).toBeDefined();
    expect(res.body.data.metrics.inTransitShipments).toBeDefined();
    expect(res.body.data.metrics.deliveredShipments).toBeDefined();
    expect(res.body.data.metrics.delayedShipments).toBeDefined();
    expect(res.body.data.metrics.pendingInspections).toBeDefined();
    expect(res.body.data.metrics.highRiskShipments).toBeDefined();
    expect(res.body.data.charts.shipmentStatusBreakdown).toBeDefined();
    expect(res.body.data.charts.supplierDeliveryPerformance).toBeDefined();
    expect(res.body.data.charts.shipmentRiskDistribution).toBeDefined();
    expect(res.body.data.charts.monthlyDeliveryTrend).toBeDefined();
    expect(res.body.data.tables.upcomingDeliveries).toBeDefined();
    expect(res.body.data.tables.delayedShipments).toBeDefined();
    expect(res.body.data.tables.recentInspections).toBeDefined();
  });

  test('GET /api/dashboard/supply-chain-stats should REJECT unauthorized role (e.g. VENDOR) with HTTP 403', async () => {
    // Register or login a vendor
    const vendorEmail = `vendor_${Date.now()}@logistics.com`;
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Global Logistics Vendor',
        email: vendorEmail,
        password: 'Password@123',
        role: 'VENDOR',
        organization: 'Vendor Corp',
      });

    const vendorToken = regRes.body.data.token;

    const res = await request(app)
      .get('/api/dashboard/supply-chain-stats')
      .set('Authorization', `Bearer ${vendorToken}`);

    expect(res.statusCode).toEqual(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('not authorized');
  });

  test('POST /api/users should REJECT non-admin requests with HTTP 403', async () => {
    const analystEmail = `analyst_${Date.now()}@defense.gov`;
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Supply Chain Analyst 1',
        email: analystEmail,
        password: 'Password@123',
        role: 'SUPPLY_CHAIN_ANALYST',
      });

    const analystToken = regRes.body.data.token;

    // Analyst attempts to create a user (admin only)
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${analystToken}`)
      .send({
        fullName: 'Unauthorized User',
        email: `unauth_${Date.now()}@test.com`,
        password: 'Password@123',
        role: 'ADMIN',
      });

    expect(res.statusCode).toEqual(403);
    expect(res.body.success).toBe(false);
  });

  afterAll(async () => {
    const mongoose = require('mongoose');
    await mongoose.connection.close();
  });
});

