import { Pipe, PipeTransform } from '@angular/core';
import { BulkUploadFileType } from '@core/model/bulk-upload.model';

@Pipe({
    name: 'bulkUploadFileTypePipe',
    standalone: false
})
export class BulkUploadFileTypePipePipe implements PipeTransform {
  public bulkUploadFileTypeEnum = BulkUploadFileType;

  transform(value: string): string {
    const valueCapitalized = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
    return this.bulkUploadFileTypeEnum[valueCapitalized] ? this.bulkUploadFileTypeEnum[valueCapitalized] : value;
  }
}
