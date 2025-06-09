import { MockCWPUseReasons } from '@core/test-utils/MockCareWorkforcePathwayService';
import { FormatCwpUsePipe } from './format-cwp-use.pipe';

describe('FormatCwpUsePipe', () => {
  it('should create an instance', () => {
    const pipe = new FormatCwpUsePipe();
    expect(pipe).toBeTruthy();
  });

  const mockReasons = MockCWPUseReasons;

  it('should return a dash "-" if the value is null', () => {
    const pipe = new FormatCwpUsePipe();
    const actual = pipe.transform(null);
    const expected = '-';
    expect(actual).toEqual(expected);
  });

  it('should return "No" if CWP use is No', () => {
    const pipe = new FormatCwpUsePipe();
    const actual = pipe.transform({ use: 'No', reasons: null });
    const expected = 'No';
    expect(actual).toEqual(expected);
  });

  it('should return "Not known" if CWP use is "Dont know"', () => {
    const pipe = new FormatCwpUsePipe();
    const actual = pipe.transform({ use: "Don't know", reasons: null });
    const expected = 'Not known';
    expect(actual).toEqual(expected);
  });

  it('should return "Yes" if CWP use is "Yes" and reason not given', () => {
    const pipe = new FormatCwpUsePipe();
    const actual = pipe.transform({ use: 'Yes', reasons: [] });
    const expected = 'Yes';
    expect(actual).toEqual(expected);
  });

  it('should return a list of selected reasons if CWP use is "Yes" and some reasons are chosen', () => {
    const pipe = new FormatCwpUsePipe();
    const actual = pipe.transform({ use: 'Yes', reasons: [mockReasons[0], mockReasons[1]] });
    const expected = ["To help define our organisation's values", 'To help update our job descriptions'];
    expect(actual).toEqual(expected);
  });

  it('should return with the free text provided if user selected "For something else" and input some free text', () => {
    const pipe = new FormatCwpUsePipe();
    const actual = pipe.transform({
      use: 'Yes',
      reasons: [mockReasons[0], mockReasons[1], { ...mockReasons[2], other: 'To meet CQC requirement' }],
    });
    const expected = [
      "To help define our organisation's values",
      'To help update our job descriptions',
      'To meet CQC requirement',
    ];
    expect(actual).toEqual(expected);
  });

  it('should convert the reason "For something else" to "To help with something else" if it is chosen without free text', () => {
    const pipe = new FormatCwpUsePipe();
    const actual = pipe.transform({ use: 'Yes', reasons: mockReasons });
    const expected = [
      "To help define our organisation's values",
      'To help update our job descriptions',
      'To help with something else',
    ];
    expect(actual).toEqual(expected);
  });
});
