import { Component, OnDestroy, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { EstablishmentService } from '@core/services/establishment.service';
import { Subscription } from 'rxjs';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { ErrorSummaryService } from '@core/services/error-summary.service';

@Component({
  selector: 'app-total-staff',
  templateUrl: './total-staff.component.html',
})
export class TotalStaffComponent implements OnInit, OnDestroy {
  @Input() establishmentUid: string;
  @Input() form: FormGroup;
  @Input() formErrorsMap: Array<ErrorDetails>;
  @Input() submitted: boolean;

  private subscriptions: Subscription = new Subscription();

  constructor(
    protected establishmentService: EstablishmentService,
    protected errorSummaryService: ErrorSummaryService,
  ) {
  }

  ngOnInit() {
    this.subscriptions.add(
      this.establishmentService.getStaff(this.establishmentUid).subscribe(staff => {
        this.form.patchValue({ totalStaff: staff });
      })
    );
  }

  ngOnDestroy() {}

  public getFirstErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }
}
