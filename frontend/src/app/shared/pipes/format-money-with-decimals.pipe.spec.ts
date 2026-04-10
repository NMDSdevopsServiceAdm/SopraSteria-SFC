import { FormatMoneyWithDecimalsPipe } from './format-money-with-decimals.pipe';

describe('FormatMoneyWithDecimalsPipe', () => {
  it('should create an instance', () => {
    const pipe = new FormatMoneyWithDecimalsPipe();
    expect(pipe).toBeTruthy();
  });

  it("should return a number with 2 decimal points when sent a single decimal", async() => {
    const pipe = new FormatMoneyWithDecimalsPipe();

    expect(pipe.transform('3.5')).toEqual("£3.50")
  })

  it("should return a number with 2 decimal points when sent a whole number", async() => {
    const pipe = new FormatMoneyWithDecimalsPipe();

    expect(pipe.transform('5')).toEqual("£5.00")
  })
});
