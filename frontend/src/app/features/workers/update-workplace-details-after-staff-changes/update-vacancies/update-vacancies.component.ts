import { Component, ElementRef, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { UpdateWorkplaceAfterStaffChangesService } from '@core/services/update-workplace-after-staff-changes.service';

@Component({
  selector: 'app-update-vacancies',
  templateUrl: './update-vacancies.component.html',
  styleUrl: './update-vacancies.component.scss',
})
export class UpdateVacanciesComponent {
  @ViewChild('formEl') formEl: ElementRef;
  public heading: string;
  public form: UntypedFormGroup;
  public formErrorsMap: Array<ErrorDetails> = [];
  public submitted = false;

  constructor(
    protected formBuilder: UntypedFormBuilder,
    protected router: Router,
    protected backlinkService: BackLinkService,
    protected errorSummaryService: ErrorSummaryService,
    protected updateWorkplaceAfterStaffChangesService: UpdateWorkplaceAfterStaffChangesService,
    protected route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.setupTexts();
    this.setupForm();
    this.setupFormErrorsMap();
    this.setBackLink();
    this.prefill();
  }

  public setupTexts() {
    this.heading = 'Update your current staff vacancies';
  }

  public setupForm() {
    this.form = this.formBuilder.group({});
  }
  public setupFormErrorsMap() {}
  public setBackLink() {}
  public prefill() {}

  public onSubmit() {}
}
