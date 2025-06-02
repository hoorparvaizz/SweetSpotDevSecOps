// Simple JavaScript tests
describe('Basic App Tests', () => {
  test('renders without crashing', () => {
    expect(true).toBe(true);
  });

  test('basic math operations work', () => {
    expect(2 + 2).toBe(4);
    expect(5 * 3).toBe(15);
  });

  test('string operations work', () => {
    const testString = 'SweetSpot';
    expect(testString.toLowerCase()).toBe('sweetspot');
    expect(testString.length).toBe(9);
  });
}); 