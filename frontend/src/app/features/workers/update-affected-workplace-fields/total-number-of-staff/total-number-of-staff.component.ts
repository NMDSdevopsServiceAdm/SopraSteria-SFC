import { Component, ElementRef, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-total-number-of-staff',
  templateUrl: './total-number-of-staff.component.html',
  styleUrls: ['./total-number-of-staff.component.scss'],
})
export class TotalNumberOfStaffComponent {
  @ViewChild('formEl') formEl: ElementRef;
  public form: UntypedFormGroup;
  public submitted: boolean;
  private subscriptions: Subscription = new Subscription();

  constructor(
    protected formBuilder: UntypedFormBuilder,
    protected router: Router,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
  ) {}

  ngOnInit(): void {}

  protected setupForm(): void {
    this.form = this.formBuilder.group({
      numberOfStaff: null,
    });
  }

  onSubmit(): void {}

  onCancel(event: Event): void {
    event.preventDefault();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
