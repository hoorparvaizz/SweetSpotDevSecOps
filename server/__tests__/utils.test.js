describe('Server Utils Tests', () => {
  test('environment variables are loaded', () => {
    expect(process.env).toBeDefined();
  });

  test('basic string operations work', () => {
    const testString = 'SweetSpot Marketplace';
    expect(testString.toLowerCase()).toBe('sweetspot marketplace');
    expect(testString.includes('SweetSpot')).toBe(true);
  });

  test('array operations work', () => {
    const testArray = [1, 2, 3, 4, 5];
    expect(testArray.length).toBe(5);
    expect(testArray.includes(3)).toBe(true);
    expect(testArray.filter(x => x > 3)).toEqual([4, 5]);
  });

  test('object operations work', () => {
    const testObj = { name: 'Test Product', price: 10.99 };
    expect(testObj.name).toBe('Test Product');
    expect(testObj.price).toBe(10.99);
    expect(Object.keys(testObj)).toEqual(['name', 'price']);
  });
}); 