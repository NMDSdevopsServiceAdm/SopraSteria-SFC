import { ShowTrainingValidityPipe } from './show-training-validity.pipe';

describe('ShowTrainingValidityPipe', () => {
  it('create an instance', () => {
    const pipe = new ShowTrainingValidityPipe();
    expect(pipe).toBeTruthy();
  });

  const testCases = [
    { training: { validityPeriodInMonth: 12, doesNotExpire: false }, expectedOutput: '12 months' },
    { training: { validityPeriodInMonth: 1, doesNotExpire: false }, expectedOutput: '1 month' },
    { training: { validityPeriodInMonth: null, doesNotExpire: true }, expectedOutput: 'Does not expire' },
    { training: { validityPeriodInMonth: null, doesNotExpire: false }, expectedOutput: '-' },
    { training: { validityPeriodInMonth: null, doesNotExpire: null }, expectedOutput: '-' },

    { training: { validityPeriodInMonth: null }, expectedOutput: '-' },
    { training: { validityPeriodInMonth: 1 }, expectedOutput: '1 month' },
    { training: { validityPeriodInMonth: 3 }, expectedOutput: '3 months' },

    { training: { doesNotExpire: true }, expectedOutput: 'Does not expire' },
    { training: { doesNotExpire: false }, expectedOutput: '-' },
    { training: { doesNotExpire: null }, expectedOutput: '-' },

    { training: {}, expectedOutput: '-' },
  ];

  testCases.forEach(({ training, expectedOutput }) => {
    it(`should return the validity in expected format`, () => {
      const pipe = new ShowTrainingValidityPipe();
      // @ts-ignore
      const actual = pipe.transform(training);

      expect(actual).toEqual(expectedOutput);
    });
  });
});
