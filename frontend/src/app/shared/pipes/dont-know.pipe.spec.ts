import { DontKnowPipe } from './dont-know.pipe';

describe('DontKnowPipe', () => {
  it('create an instance', () => {
    const pipe = new DontKnowPipe();
    expect(pipe).toBeTruthy();
  });

  it(`format Don't know correctly`, () => {
    const pipe = new DontKnowPipe();
    expect(pipe.transform(`Don't know`)).toEqual('I do not know');
  });

  it(`returns the value if it isn't Don't know`, () => {
    const pipe = new DontKnowPipe();
    expect(pipe.transform('somevalue')).toEqual('somevalue');
  });
});
