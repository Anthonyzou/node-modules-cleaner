import * as script from './lib';

const isArrayUnique = arr => Array.isArray(arr) && new Set(arr).size === arr.length
test('test', async () => {
  const files = await script(true);
  expect(files.length).toBe(3428);

  files
  .filter(i => i.startsWith('.'))
  .map(file => {
    expect(file).not.toMatch('.js')
    expect(file).not.toMatch('.html')
    expect(file).not.toMatch('.json')
    expect(file).not.toMatch('.css')
    expect(file).toMatch(/\.cpp|.cc|.h|.md|bench|example|docs/)

  })
  expect(isArrayUnique(files)).toBeTruthy()
});
