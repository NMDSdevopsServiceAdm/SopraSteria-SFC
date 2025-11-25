import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-total-staff',
    templateUrl: './total-staff.component.html',
    standalone: false
})
export class TotalStaffComponent implements OnInit {
  @Input() establishmentUid: string;
  @Input() form: UntypedFormGroup;
  @Input() formErrorsMap: Array<ErrorDetails>;
  @Input() submitted: boolean;
  @Input() errorSummaryService: ErrorSummaryService;
  @Input() showHint = true;

  private subscriptions: Subscription = new Subscription();
  public totalStaff: Number;

  constructor(protected establishmentService: EstablishmentService) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.establishmentService.getEstablishmentField(this.establishmentUid, 'NumberOfStaff').subscribe((data) => {
        this.totalStaff = data.numberOfStaff;
        this.form.patchValue({ totalStaff: this.totalStaff });
      }),
    );
  }

  public getErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }
}
