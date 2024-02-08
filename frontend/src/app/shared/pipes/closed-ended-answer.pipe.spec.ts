import { ClosedEndedAnswerPipe } from './closed-ended-answer.pipe';

describe('openEndedAnswerPipe', () => {
  it('create an instance', () => {
    const pipe = new ClosedEndedAnswerPipe();
    expect(pipe).toBeTruthy();
  });
});
