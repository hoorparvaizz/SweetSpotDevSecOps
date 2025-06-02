// Simple test without ES module imports
describe('Health Check Tests', () => {
    test('should pass basic test', () => {
        expect(1 + 1).toBe(2);
    });

    test('should validate environment setup', () => {
        expect(process.env.NODE_ENV).toBeDefined();
    });

    test('should check process object', () => {
        expect(process).toBeDefined();
        expect(typeof process.version).toBe('string');
    });
}); 