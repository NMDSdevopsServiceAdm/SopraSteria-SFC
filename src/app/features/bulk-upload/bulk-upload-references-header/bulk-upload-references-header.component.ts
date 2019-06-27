import { Component, Input } from '@angular/core';
import { BulkUploadFileType } from '@core/model/bulk-upload.model';

@Component({
  selector: 'app-bulk-upload-references-header',
  templateUrl: './bulk-upload-references-header.component.html'
})
export class BulkUploadReferencesHeaderComponent {
  @Input() public primaryEstablishment: string;
  @Input() public page: string;
  public bulkUploadReferencePageEnum = BulkUploadFileType;
}
