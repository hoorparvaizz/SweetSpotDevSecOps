export default {
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['js', 'jsx', 'json'],
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/SweetSpotMarketplace/client/src/$1',
  },
  testMatch: [
    '<rootDir>/SweetSpotMarketplace/client/src/**/*.test.(js|jsx)'
  ],
}; 