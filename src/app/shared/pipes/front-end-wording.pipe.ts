import { Pipe, PipeTransform } from '@angular/core';
import { BulkUploadFileType } from '@core/model/bulk-upload.model';

@Pipe({
  name: 'bulkUploadFileTypePipe',
})
export class BulkUploadFileTypePipePipe implements PipeTransform {
  public bulkUploadFileTypeEnum = BulkUploadFileType;

  transform(value: string): string {
    if (this.bulkUploadFileTypeEnum[value] ) {
      return this.bulkUploadFileTypeEnum[value]
    }
    return  value;
  }
}
