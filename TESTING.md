# Testing Guide for SweetSpot Marketplace

## Overview
This project uses Jest as the testing framework with Babel for transpilation. The test suite includes both server-side and client-side tests.

## Test Structure

### Server Tests
- Located in `server/__tests__/`
- Files: `health.test.js`, `utils.test.js`
- Simple unit tests for basic functionality

### Client Tests
- Located in `client/src/components/__tests__/`
- Files: `App.test.jsx`
- Basic JavaScript tests without complex React rendering

## Configuration Files

### Jest Configuration (`jest.config.mjs`)
```javascript
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
```

### Babel Configuration (`babel.config.cjs`)
```javascript
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    ['@babel/preset-react', { runtime: 'automatic' }]
  ]
};
```

## Running Tests

### Local Testing
```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

### CI/CD Pipeline Testing
```bash
# Run the local CI/CD simulation
./test-ci.sh
```

## CI/CD Workflow

The GitHub Actions workflow (`.github/workflows/ci-cd.yml`) includes:

1. **Test Job**:
   - Sets up Node.js 18.x and 20.x
   - Installs dependencies
   - Creates required directories
   - Sets up MongoDB service
   - Runs Jest tests

2. **Build Job**:
   - Builds the application using Vite and esbuild
   - Archives production artifacts

3. **Security Scan Job**:
   - Runs npm audit for security vulnerabilities
   - Non-blocking for moderate issues

4. **Code Quality Job**:
   - Checks for ESLint and Prettier configurations
   - Non-blocking quality checks

## Test Dependencies

Required packages in `devDependencies`:
- `jest`: Testing framework
- `@babel/core`: Babel transpiler core
- `@babel/preset-env`: Babel preset for environment-specific transpilation
- `@babel/preset-react`: Babel preset for React JSX
- `babel-jest`: Babel integration for Jest
- `@testing-library/react`: React testing utilities
- `@testing-library/jest-dom`: Jest DOM matchers
- `supertest`: HTTP assertion library

## Current Test Coverage

The test suite includes basic functionality tests:
- Environment setup validation
- Basic JavaScript operations
- String and array manipulations
- Object property access
- Process and Node.js environment checks

## Adding New Tests

### Server Tests
Add new test files in `server/__tests__/` with the pattern `*.test.js`:
```javascript
describe('Your Test Suite', () => {
  test('should test something', () => {
    expect(something).toBe(expected);
  });
});
```

### Client Tests
Add new test files in `client/src/components/__tests__/` with the pattern `*.test.jsx`:
```javascript
describe('Component Tests', () => {
  test('should render component', () => {
    // Basic component test
    expect(true).toBe(true);
  });
});
```

## Troubleshooting

### Common Issues
1. **Babel preset not found**: Ensure all Babel packages are installed in devDependencies
2. **ES module issues**: Use `babel.config.cjs` instead of `babel.config.js`
3. **Test path issues**: Verify test file naming patterns match Jest config

### Debug Commands
```bash
# Check Jest configuration
npx jest --showConfig

# Run tests with debug output
npm test -- --verbose --no-cache

# List all test files Jest can find
npx jest --listTests
``` 