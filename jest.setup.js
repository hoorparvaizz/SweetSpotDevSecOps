// Jest setup file for CI/CD compatibility

// Set test timeout for slower CI environments
jest.setTimeout(30000);

// Set up environment variables for tests (local development)
process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sweetspot_test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-for-local-development';
process.env.PORT = process.env.PORT || '3001';

// Prevent unhandled promise rejections from failing tests
process.on('unhandledRejection', (reason, promise) => {
  console.warn('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle EADDRINUSE errors in CI
process.on('uncaughtException', (error) => {
  if (error.code !== 'EADDRINUSE') {
    console.error('Uncaught Exception:', error);
  }
});

// Global test setup
beforeAll(() => {
  // Suppress console.warn in tests unless explicitly needed
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterAll(() => {
  // Restore console.warn
  console.warn.mockRestore?.();
});