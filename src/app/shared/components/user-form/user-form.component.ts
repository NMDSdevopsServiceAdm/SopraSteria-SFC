import { Component, Input } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { UserPermissionsType } from '@core/model/userDetails.model';
import { ErrorSummaryService } from '@core/services/error-summary.service';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
})
export class UserFormComponent {
  @Input() form: UntypedFormGroup;
  @Input() formErrorsMap: ErrorDetails[];
  @Input() submitted = false;
  @Input() formControlsMap: any[];
  @Input() permissionsTypeRadios: UserPermissionsType[];
  @Input() title: string;
  @Input() getFirstErrorMessage: (item: string) => string;

  constructor(private errorSummaryService: ErrorSummaryService) {}
}
