import { FormatWhatDhaPipe } from './format-what-dha.pipe';

describe('FormatWhatDHAPipe', () => {
  it('should create an instance', () => {
    const pipe = new FormatWhatDhaPipe();
    expect(pipe).toBeTruthy();
  });

  it('should return "-" if the value is null', () => {
    const pipe = new FormatWhatDhaPipe();
    const actual = pipe.transform(null);
    const expected = '-';

    expect(actual).toEqual(expected);
  });

  it('should return "Not known" if the value is "Don`t know"', () => {
    const pipe = new FormatWhatDhaPipe();
    const actual = pipe.transform({
      knowWhatActivities: "Don't know",
      activities: null,
    });
    const expected = 'Not known';

    expect(actual).toEqual(expected);
  });
});
