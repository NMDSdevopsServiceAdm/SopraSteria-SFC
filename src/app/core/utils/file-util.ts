export class FileUtil {
  public static getFileName(response) {
    const filenameRegEx = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
    const filenameMatches = response.headers.get('content-disposition').match(filenameRegEx);
    return filenameMatches && filenameMatches.length > 1 ? filenameMatches[1] : null;
  }
}
