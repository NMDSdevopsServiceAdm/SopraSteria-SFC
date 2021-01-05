import { Component, Input, ViewEncapsulation } from '@angular/core';
import { FileValidateStatus, ValidatedFile } from '@core/model/bulk-upload.model';

@Component({
  selector: 'app-file-validate-status',
  templateUrl: './file-validate-status.component.html',
  styleUrls: ['./file-validate-status.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class FileValidateStatusComponent {
  public statusEnum = FileValidateStatus;
  @Input() public file: ValidatedFile;
}
