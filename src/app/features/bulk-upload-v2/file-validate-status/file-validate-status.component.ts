import { Component, Input } from '@angular/core';
import { ValidatedFileType } from '@core/model/bulk-upload.model';

@Component({
  selector: 'app-file-validate-status',
  templateUrl: './file-validate-status.component.html',
  styleUrls: ['./file-validate-status.component.scss'],
  preserveWhitespaces: true,
})
export class FileValidateStatusComponent {
  @Input() public warnings: number;
  @Input() public errors: number;
  @Input() public fileType: ValidatedFileType;

  public get showInvalidFileMessage(): boolean {
    return !this.fileType || this.fileType === null;
  }

  public get showErrorMessages(): boolean {
    return this.errors > 0;
  }

  public get showValidationPassed(): boolean {
    return this.fileType && this.errors === 0;
  }
}
