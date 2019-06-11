import { Component, Input } from '@angular/core';
import { FileValidateStatus } from '@core/model/bulk-upload.model';

@Component({
  selector: 'app-file-validate-status',
  templateUrl: './file-validate-status.component.html',
  styleUrls: ['./file-validate-status.component.scss']
})
export class FileValidateStatusComponent {
  public statusEnum = FileValidateStatus;
  @Input() public status: FileValidateStatus;
}
