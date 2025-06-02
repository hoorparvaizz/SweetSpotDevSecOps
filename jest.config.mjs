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
  verbose: true
}; 