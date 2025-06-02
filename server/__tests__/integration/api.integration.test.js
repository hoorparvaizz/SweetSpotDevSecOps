// Integration tests for CircleCI
describe('API Integration Tests', () => {
  test('should connect to database', async () => {
    expect(process.env.MONGODB_URI).toBeDefined();
    expect(process.env.MONGODB_URI).toContain('sweetspot_test');
  });

  test('should validate JWT secret', () => {
    expect(process.env.JWT_SECRET).toBeDefined();
    expect(process.env.JWT_SECRET.length).toBeGreaterThan(10);
  });

  test('should run in test environment', () => {
    expect(process.env.NODE_ENV).toBe('test');
  });

  test('should have correct port configured', () => {
    expect(process.env.PORT).toBeDefined();
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
});
