import { Component, Input } from '@angular/core';
import { ValidateStatus } from '@core/model/bulk-upload.model';

@Component({
  selector: 'app-validate-status',
  templateUrl: './validate-status.component.html',
  styleUrls: ['./validate-status.component.scss']
})
export class ValidateStatusComponent {
  public statusEnums = ValidateStatus;
  @Input() public status: ValidateStatus;
}
