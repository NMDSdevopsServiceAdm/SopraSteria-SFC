import { HasValuePipe } from './has-value.pipe';

describe('HasValuePipe', () => {
  it('create an instance', () => {
    const pipe = new HasValuePipe();
    expect(pipe).toBeTruthy();
  });

  it('return false when the given value is undefined', async () => {
    const pipe = new HasValuePipe();
    const inputValue = undefined;
    const expected = false;

    expect(pipe.transform(inputValue)).toEqual(expected);
  });

  it('return false when the given value is null', async () => {
    const pipe = new HasValuePipe();
    const inputValue = null;
    const expected = false;

    expect(pipe.transform(inputValue)).toEqual(expected);
  });

  it('return true when the given value is 0', async () => {
    const pipe = new HasValuePipe();
    const inputValue = 0;
    const expected = true;

    expect(pipe.transform(inputValue)).toEqual(expected);
  });

  const testCases = [10, '', 'a string', {}, { an: 'object' }, [], [1, 2, 3]];

  testCases.forEach((inputValue) => {
    it(`return true when the given value is ${inputValue}`, async () => {
      const pipe = new HasValuePipe();
      const expected = true;

      expect(pipe.transform(inputValue)).toEqual(expected);
    });
  });
});
