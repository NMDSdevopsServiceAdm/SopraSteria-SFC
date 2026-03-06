import { ClosedEndedAnswerPipe } from './closed-ended-answer.pipe';

describe('ClosedEndedAnswerPipe', () => {
  it('create an instance', () => {
    const pipe = new ClosedEndedAnswerPipe();
    expect(pipe).toBeTruthy();
  });

  it(`convert "Don't know" to "Not known"`, () => {
    const pipe = new ClosedEndedAnswerPipe();
    const result = pipe.transform("Don't know");

    expect(result).toEqual('Not known');
  });

  it('convert "I do not know" to "Not known"', () => {
    const pipe = new ClosedEndedAnswerPipe();
    const result = pipe.transform('I do not know');

    expect(result).toEqual('Not known');
  });

  it('convert null to a dash "-"', () => {
    const pipe = new ClosedEndedAnswerPipe();
    const result = pipe.transform(null);

    expect(result).toEqual('-');
  });

  it('convert undefined to a dash "-"', () => {
    const pipe = new ClosedEndedAnswerPipe();
    const result = pipe.transform(undefined);

    expect(result).toEqual('-');
  });

  it('keep the value unchanged in other cases', () => {
    const pipe = new ClosedEndedAnswerPipe();
    const result = pipe.transform('Some value');

    expect(result).toEqual('Some value');
  });
});
