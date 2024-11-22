import { BlobReader, BlobWriter, ZipWriter } from '@zip.js/zip.js';

export interface NamedFileBlob {
  fileBlob: Blob;
  filename: string;
}

export class FileUtil {
  public static getFileName(response) {
    const filenameRegEx = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
    const filenameMatches = response.headers.get('content-disposition').match(filenameRegEx);
    return filenameMatches && filenameMatches.length > 1 ? filenameMatches[1] : null;
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

  public static async saveFilesAsZip(files: NamedFileBlob[], nameOfZippedFile: string) {
    if (!files.length) {
      return;
    }

    const zippedFileAsBlob = await this.zipFilesAsBlob(files);
    this.triggerSingleFileDownload(zippedFileAsBlob, nameOfZippedFile);
  }

  public static async zipFilesAsBlob(files: NamedFileBlob[]): Promise<Blob> {
    const filenameUsed = new Set();

    const zipWriter = new ZipWriter(new BlobWriter('application/zip'));
    for (const file of files) {
      let { filename, fileBlob } = file;

      while (filenameUsed.has(filename)) {
        filename = this.makeAnotherFilename(filename);
      }
      await zipWriter.add(filename, new BlobReader(fileBlob));

      filenameUsed.add(filename);
    }
    const zippedFileBlob = await zipWriter.close();

    return zippedFileBlob;
  }

  public static makeAnotherFilename(filename: string): string {
    /*
     * Append a number to filename to avoid duplicated names causing error during zip
     * examples:
     *   "filename.pdf" --> "filename (1).pdf"
     *   "filename (1).pdf" --> "filename (2).pdf"
     */
    const basename = filename.slice(0, filename.lastIndexOf('.'));
    const extname = filename.slice(filename.lastIndexOf('.') + 1);
    const numberInBracket = /\(([0-9]{1,2})\)$/;

    const sameFilenameCount = basename.match(numberInBracket);
    if (sameFilenameCount) {
      const newNumber = Number(sameFilenameCount[1]) + 1;
      const newBasename = basename.replace(numberInBracket, `(${newNumber})`);
      return `${newBasename}.${extname}`;
    }

    return `${basename} (1).${extname}`;
  }
}
