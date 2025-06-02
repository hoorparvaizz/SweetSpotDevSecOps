import request from 'supertest';
import express from 'express';
import { registerRoutes } from '../routes.js';

// Mock mongoose for testing
jest.mock('mongoose', () => ({
    connection: {
        readyState: 1
    }
}));

describe('Health Check Endpoint', () => {
    let app;

    beforeAll(async () => {
        app = express();
        await registerRoutes(app);
    });

    test('GET /api/health should return 200 and health status', async () => {
        const response = await request(app)
            .get('/api/health')
            .expect(200);

        expect(response.body).toHaveProperty('status', 'ok');
        expect(response.body).toHaveProperty('timestamp');
        expect(response.body).toHaveProperty('uptime');
        expect(response.body).toHaveProperty('database');
        expect(response.body).toHaveProperty('version');
        expect(response.body).toHaveProperty('environment');
    });

    test('Health endpoint should include required fields', async () => {
        const response = await request(app)
            .get('/api/health');

        expect(response.body.status).toBe('ok');
        expect(response.body.database).toBe('connected');
        expect(typeof response.body.uptime).toBe('number');
        expect(typeof response.body.timestamp).toBe('string');
    });
}); 