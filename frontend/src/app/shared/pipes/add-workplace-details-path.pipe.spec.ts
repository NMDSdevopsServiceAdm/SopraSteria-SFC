import { AddWorkplaceDetailsPathPipe } from './add-workplace-details-path.pipe';

describe('AddWorkplaceDetailsPathPipe', () => {
  it('create an instance', () => {
    const pipe = new AddWorkplaceDetailsPathPipe();
    expect(pipe).toBeTruthy();
  });

  it('should take a url part and workplace uid, and return a url array for add-workplace-details question pages', async () => {
    const pathSegment = 'do-you-have-starters';
    const workplaceUid = 'mock-workplace-uid';

    const expectedOutput = [
      '/workplace',
      workplaceUid,
      'workplace-data',
      'add-workplace-details',
      'do-you-have-starters',
    ];

    const pipe = new AddWorkplaceDetailsPathPipe();
    const result = pipe.transform(pathSegment, workplaceUid);
    expect(result).toEqual(expectedOutput);
  });
});
