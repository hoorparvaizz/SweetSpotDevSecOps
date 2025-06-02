export default {
  testEnvironment: 'node',
  testMatch: [
    '<rootDir>/server/**/*.test.js',
    '<rootDir>/client/src/**/*.test.jsx'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/'
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  verbose: true,
  detectOpenHandles: true,
  forceExit: true,
  maxWorkers: 1,
  testTimeout: 30000
}; 