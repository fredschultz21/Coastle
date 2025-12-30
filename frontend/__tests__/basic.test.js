describe('Frontend environment tests', () => {
  test('Node environment is available', () => {
    expect(process).toBeDefined();
  });

  test('String operations work correctly', () => {
    const testString = 'Coastle';
    expect(testString.toLowerCase()).toBe('coastle');
    expect(testString.length).toBe(7);
  });

  test('Math calculations are accurate', () => {
    const result = 2 + 2;
    expect(result).toBe(4);
  });
});