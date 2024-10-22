import { FileUtil } from './file-util';
import { BlobReader, ZipReader } from '@zip.js/zip.js';

fdescribe('FileUtil', () => {
  describe('zipFileBlobs', () => {
    const mockFiles = [
      { filename: 'training/First Aid.pdf', blob: new Blob(['first aid'], { type: 'application/pdf' }) },
      { filename: 'training/First Aid 2024.pdf', blob: new Blob(['First Aid 2024'], { type: 'application/pdf' }) },
      {
        filename: 'qualification/Level 2 Care Cert.pdf',
        blob: new Blob(['Level 2 Care Cert'], { type: 'application/pdf' }),
      },
    ];

    it('should zip all given file blobs into one zip file and return as a single file blob', async () => {
      const zippedBlob = await FileUtil.zipFiles(mockFiles);
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
        { filename: 'training/First Aid.pdf', blob: new Blob(['another first aid'], { type: 'application/pdf' }) },
        { filename: 'training/First Aid.pdf', blob: new Blob(['3rd first aid'], { type: 'application/pdf' }) },
      ];

      const zippedBlob = await FileUtil.zipFiles(mockFileWithSameFileNames);

      const contentsOfZipFile = await new ZipReader(new BlobReader(zippedBlob)).getEntries();
      expect(contentsOfZipFile).toHaveSize(5);

      const fileNamesInZipFile = contentsOfZipFile.map((file) => file.filename);
      expect(fileNamesInZipFile).toContain('training/First Aid.pdf');
      expect(fileNamesInZipFile).toContain('training/First Aid (1).pdf');
      expect(fileNamesInZipFile).toContain('training/First Aid (2).pdf');
    });
  });

  describe('triggerSingleFileDownload', () => {
    it('should download certificates by creating and triggering anchor tag, then cleaning DOM', () => {
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
});
