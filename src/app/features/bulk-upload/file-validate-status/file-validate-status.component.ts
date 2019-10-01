import { Component, Input, ViewEncapsulation } from '@angular/core';
import { FileValidateStatus } from '@core/model/bulk-upload.model';

@Component({
  selector: 'app-file-validate-status',
  templateUrl: './file-validate-status.component.html',
  styleUrls: ['./file-validate-status.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class FileValidateStatusComponent {
  public statusEnum = FileValidateStatus;
  @Input() public status: FileValidateStatus;

  public getIconByStatus(status: string): string {
    let icon: string;

    if (status === this.statusEnum.Pass) {
      icon = 'tick';
    } else if (status === this.statusEnum.Fail) {
      icon = 'cross';
    }

    return icon;
  }
}
