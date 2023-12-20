import { BulkUploadFileTypePipePipe } from '@shared/pipes/bulk-upload-file-type.pipe';

describe('openEndedAnswerPipe', () => {
  it('create an instance', () => {
    const pipe = new BulkUploadFileTypePipePipe();
    expect(pipe).toBeTruthy();
  });
  it('formats Establishment correctly', () => {
    const pipe = new BulkUploadFileTypePipePipe();
    expect(pipe.transform('Establishment')).toEqual("Workplace");
  });
  it('formats worker correctly', () => {
    const pipe = new BulkUploadFileTypePipePipe();
    expect(pipe.transform('Worker')).toEqual("Staff");
  });
  it('returns original if doesnt fit filetypes', () => {
    const pipe = new BulkUploadFileTypePipePipe();
    expect(pipe.transform('bla')).toEqual("bla");
  });
});
