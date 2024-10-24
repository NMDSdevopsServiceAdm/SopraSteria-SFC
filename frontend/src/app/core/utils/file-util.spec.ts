import { FileUtil } from './file-util';
import { BlobReader, ZipReader } from '@zip.js/zip.js';

describe('FileUtil', () => {
  const mockFiles = [
    { filename: 'training/First Aid.pdf', fileBlob: new Blob(['first aid'], { type: 'application/pdf' }) },
    { filename: 'training/First Aid 2024.pdf', fileBlob: new Blob(['First Aid 2024'], { type: 'application/pdf' }) },
    {
      filename: 'qualification/Level 2 Care Cert.pdf',
      fileBlob: new Blob(['Level 2 Care Cert'], { type: 'application/pdf' }),
    },
  ];

  describe('triggerSingleFileDownload', () => {
    it('should download files by creating and triggering anchor tag, then cleaning DOM', () => {
      const mockCertificates = [{ signedUrl: 'https://example.com/file1.pdf', filename: 'file1.pdf' }];
      const mockBlob = new Blob(['file content'], { type: 'application/pdf' });
      const mockBlobUrl = 'blob:http://signed-url-example.com/blob-url';

      const createElementSpy = spyOn(document, 'createElement').and.callThrough();
      const appendChildSpy = spyOn(document.body, 'appendChild').and.callThrough();
      const removeChildSpy = spyOn(document.body, 'removeChild').and.callThrough();
      const revokeObjectURLSpy = spyOn(window.URL, 'revokeObjectURL').and.callThrough();
      spyOn(window.URL, 'createObjectURL').and.returnValue(mockBlobUrl);

      FileUtil.triggerSingleFileDownload(mockBlob, mockCertificates[0].filename);

      // Assert anchor element appended
      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(appendChildSpy).toHaveBeenCalled();

      // Assert anchor element has correct attributes
      const createdAnchor = createElementSpy.calls.mostRecent().returnValue as HTMLAnchorElement;
      expect(createdAnchor.href).toBe(mockBlobUrl);
      expect(createdAnchor.download).toBe(mockCertificates[0].filename);

      // Assert DOM is cleaned up after download
      expect(revokeObjectURLSpy).toHaveBeenCalledWith(mockBlobUrl);
      expect(removeChildSpy).toHaveBeenCalled();
    });
  });

  describe('saveFilesAsZip', () => {
    it('should do nothing if the input files array is empty', async () => {
      const triggerDownloadSpy = spyOn(FileUtil, 'triggerSingleFileDownload');

      await FileUtil.saveFilesAsZip([], 'zipped file.zip');
      expect(triggerDownloadSpy).not.toHaveBeenCalled();
    });

    it('should zip all the given files as a blob, then trigger a download of the zipped file', async () => {
      const zipFilesAsBlobSpy = spyOn(FileUtil, 'zipFilesAsBlob').and.callThrough();
      const triggerDownloadSpy = spyOn(FileUtil, 'triggerSingleFileDownload');

      await FileUtil.saveFilesAsZip(mockFiles, 'zipped file.zip');

      expect(zipFilesAsBlobSpy).toHaveBeenCalledWith(mockFiles);

      const zippedBlob = await zipFilesAsBlobSpy.calls.mostRecent().returnValue;
      expect(triggerDownloadSpy).toHaveBeenCalledWith(zippedBlob, 'zipped file.zip');
    });
  });

  describe('zipFilesAsBlob', () => {
    it('should zip all given file blobs into one zip file and return as a single file blob', async () => {
      const zippedBlob = await FileUtil.zipFilesAsBlob(mockFiles);
      expect(zippedBlob).toBeInstanceOf(Blob);

      const contentsOfZipFile = await new ZipReader(new BlobReader(zippedBlob)).getEntries();
      expect(contentsOfZipFile).toHaveSize(mockFiles.length);

      const fileNamesInZipFile = contentsOfZipFile.map((file) => file.filename);
      mockFiles.forEach((mockfile) => {
        expect(fileNamesInZipFile).toContain(mockfile.filename);
      });
    });

    it('should be able to handle same filenames', async () => {
      const mockFileWithSameFileNames = [
        ...mockFiles,
        { filename: 'training/First Aid.pdf', fileBlob: new Blob(['another first aid'], { type: 'application/pdf' }) },
        { filename: 'training/First Aid.pdf', fileBlob: new Blob(['3rd first aid'], { type: 'application/pdf' }) },
      ];

      const zippedBlob = await FileUtil.zipFilesAsBlob(mockFileWithSameFileNames);

      const contentsOfZipFile = await new ZipReader(new BlobReader(zippedBlob)).getEntries();
      expect(contentsOfZipFile).toHaveSize(5);

      const fileNamesInZipFile = contentsOfZipFile.map((file) => file.filename);
      expect(fileNamesInZipFile).toContain('training/First Aid.pdf');
      expect(fileNamesInZipFile).toContain('training/First Aid (1).pdf');
      expect(fileNamesInZipFile).toContain('training/First Aid (2).pdf');
    });
  });

  describe('makeAnotherFilename', () => {
    const testCases = [
      { inputFilename: 'certificate.pdf', expected: 'certificate (1).pdf' },
      { inputFilename: 'certificate (1).pdf', expected: 'certificate (2).pdf' },
      { inputFilename: 'certificate (2).pdf', expected: 'certificate (3).pdf' },
      { inputFilename: 'certificate (9).pdf', expected: 'certificate (10).pdf' },
      { inputFilename: 'certificate (10).pdf', expected: 'certificate (11).pdf' },
      { inputFilename: 'certificate 1.pdf', expected: 'certificate 1 (1).pdf' },
      { inputFilename: 'certificate (2023).pdf', expected: 'certificate (2023) (1).pdf' },
      { inputFilename: 'Adult care worker (level 1).pdf', expected: 'Adult care worker (level 1) (1).pdf' },
    ];

    testCases.forEach(({ inputFilename, expected }) => {
      it(`should give a new filename as expected:  ${inputFilename} --> ${expected}`, () => {
        const actual = FileUtil.makeAnotherFilename(inputFilename);
        expect(actual).toEqual(expected);
      });
    });
  });
});
