import { FormatAmpersandPipe } from './format-ampersand.pipe';

describe('FormatAmpersandPipe', () => {
  it('creates an instance', () => {
    const pipe = new FormatAmpersandPipe();
    expect(pipe).toBeTruthy();
  });

  it('formats a string with and ampersand in it correctly', () => {
    const pipe = new FormatAmpersandPipe();
    expect(pipe.transform('L & A')).toEqual('L and A');
  });

  it('returns the original string if there is not an ampersand in it', () => {
    const pipe = new FormatAmpersandPipe();
    expect(pipe.transform('L and A')).toEqual('L and A');
  });
});
