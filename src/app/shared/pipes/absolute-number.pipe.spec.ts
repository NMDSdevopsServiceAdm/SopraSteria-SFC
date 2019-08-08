import { AbsoluteNumberPipe } from './absolute-number.pipe';

describe('AbsoluteNumberPipe', () => {
  it('create an instance', () => {
    const pipe = new AbsoluteNumberPipe();
    expect(pipe).toBeTruthy();
  });
});
