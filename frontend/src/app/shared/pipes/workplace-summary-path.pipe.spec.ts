import { WorkplaceSummaryPathPipe } from './workplace-summary-path.pipe';

fdescribe('WorkplaceSummaryPathPipe', () => {
  it('create an instance', () => {
    const pipe = new WorkplaceSummaryPathPipe();
    expect(pipe).toBeTruthy();
  });

  it('should take a url part and workplace uid, and return a url array for workplace summary question pages', async () => {
    const pathSegment = 'do-you-have-starters';
    const workplaceUid = 'mock-workplace-uid';

    const expectedOutput = ['/workplace', workplaceUid, 'workplace-data', 'workplace-summary', 'do-you-have-starters'];

    const pipe = new WorkplaceSummaryPathPipe();
    const result = pipe.transform(pathSegment, workplaceUid);
    expect(result).toEqual(expectedOutput);
  });
});
