import { RemoveTrailingWhitespacePipe } from './remove-trailing-whitespace.pipe';

describe('RemoveTrailingWhitespacePipe', () => {
  let pipe: RemoveTrailingWhitespacePipe;

  beforeEach(() => {
    pipe = new RemoveTrailingWhitespacePipe();
  });

  it('should create', () => {
    expect(pipe).toBeTruthy();
  });

  it('should remove trailing whitespace from a string', () => {
    const result = pipe.transform('   Hello World   ');
    expect(result).toBe('   Hello World');
  });

  it('should return strings with no trailing whitespace as the same', () => {
    const result = pipe.transform('Hello World');
    expect(result).toBe('Hello World');
  });

  it('should return an empty string if the input is null', () => {
    const result = pipe.transform(null);
    expect(result).toBe('');
  });

  it('should return an empty string if the input is undefined', () => {
    const result = pipe.transform(undefined);
    expect(result).toBe('');
  });

  it('should return an empty string if the input is an empty string', () => {
    const result = pipe.transform('');
    expect(result).toBe('');
  });
});
