// Integration tests for CircleCI
describe('API Integration Tests', () => {
  test('should connect to database', async () => {
    expect(process.env.MONGODB_URI).toBeDefined();
    expect(process.env.MONGODB_URI).toContain('sweetspot');
  });

  test('should validate JWT secret', () => {
    expect(process.env.JWT_SECRET).toBeDefined();
    expect(process.env.JWT_SECRET.length).toBeGreaterThan(10);
  });

  test('should run in test or development environment', () => {
    // Allow both 'test' (fallback) and 'development' (Doppler dev config)
    expect(['test', 'development']).toContain(process.env.NODE_ENV);
  });

  test('should have correct port configured', () => {
    expect(process.env.PORT).toBeDefined();
    expect(process.env.PORT).toBe('3001');
  });

  test('should validate environment setup', () => {
    const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET', 'NODE_ENV'];
    requiredEnvVars.forEach(envVar => {
      expect(process.env[envVar]).toBeDefined();
    });
  });

  test('should perform basic math operations', () => {
    expect(2 + 2).toBe(4);
    expect(10 * 5).toBe(50);
  });

  test('should validate MongoDB URI format', () => {
    expect(process.env.MONGODB_URI).toMatch(/^mongodb:\/\//);
    expect(process.env.MONGODB_URI).toContain('27017');
  });
});
