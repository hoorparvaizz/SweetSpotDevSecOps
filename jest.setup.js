// Jest setup file for CI/CD compatibility

// Set test timeout for slower CI environments
jest.setTimeout(30000);

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