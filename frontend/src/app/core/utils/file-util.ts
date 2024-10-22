import { BlobReader, BlobWriter, ZipWriter } from '@zip.js/zip.js';

export class FileUtil {
  public static getFileName(response) {
    const filenameRegEx = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
    const filenameMatches = response.headers.get('content-disposition').match(filenameRegEx);
    return filenameMatches && filenameMatches.length > 1 ? filenameMatches[1] : null;
  }

  public static async downloadFilesAsZip(files: { filename: string; blob: Blob }[], nameOfZipFile: string) {
    // const x = forkJoin(blobsAndFilenames).pipe(
    //   tap((files) => FileUtil.downloadFilesAsZip(files, 'all-certificates.zip')),
    // );

    // return x;

    const zippedFileAsBlob = await this.zipFiles(files);
    this.triggerSingleFileDownload(zippedFileAsBlob, nameOfZipFile);
  }

  public static async zipFiles(files: Array<{ filename: string; blob: Blob }>): Promise<Blob> {
    const filenameUsed = new Set();

    const zipWriter = new ZipWriter(new BlobWriter('application/zip'));
    for (const file of files) {
      let { filename, blob } = file;

      while (filenameUsed.has(filename)) {
        filename = this.makeAnotherFilename(filename);
      }
      await zipWriter.add(filename, new BlobReader(blob));

      filenameUsed.add(filename);
    }
    const zippedFileBlob = await zipWriter.close();
    return zippedFileBlob;
  }

  private static makeAnotherFilename(filename: string): string {
    /*
      Append a number to filename to avoid filename collision causing error in zip
      "filename.pdf" --> "filename (1).pdf"
      "filename (1).pdf" --> "filename (2).pdf"
    */
    const basename = filename.slice(0, filename.lastIndexOf('.'));
    const extname = filename.slice(filename.lastIndexOf('.') + 1);

    const sameFilenameCount = basename.match(/\(([0-9]+)\)$/);
    if (sameFilenameCount) {
      const newNumber = Number(sameFilenameCount[1]) + 1;
      const newBasename = basename.replace(/(\([0-9]+\))$/, `(${newNumber})`);
      return `${newBasename}.${extname}`;
    }

    return `${basename} (1).${extname}`;
  }

  public static triggerSingleFileDownload(fileBlob: Blob, filename: string): void {
    const blobUrl = window.URL.createObjectURL(fileBlob);
    const link = this.createHiddenDownloadLink(blobUrl, filename);

    // Append the link to the body and click to trigger download
    document.body.appendChild(link);
    link.click();

    // Remove the link
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  }

  private static createHiddenDownloadLink(blobUrl: string, filename: string): HTMLAnchorElement {
    const link = document.createElement('a');

    link.href = blobUrl;
    link.download = filename;
    link.style.display = 'none';
    return link;
  }
}
