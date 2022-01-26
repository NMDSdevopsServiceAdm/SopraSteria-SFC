import { AfterViewInit, Directive, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { URLStructure } from '@core/model/url.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { WorkplaceInterfaceService } from '@core/services/workplace-interface.service';

@Directive()
export class AddTotalStaffDirective implements OnInit, AfterViewInit {
  @ViewChild('formEl') formEl: ElementRef;

  protected serverErrorsMap: Array<ErrorDefinition>;
  public submitted = false;
  public return: URLStructure;
  public form: FormGroup;
  public serverError: string;
  public formErrorsMap: Array<ErrorDetails>;
  public returnToConfirmDetails: URLStructure;
  public workplaceTotalStaff;

  constructor(
    protected router: Router,
    public backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected route: ActivatedRoute,
    protected formBuilder: FormBuilder,
    public workplaceInterfaceService: WorkplaceInterfaceService,
  ) {}

  public ngOnInit(): void {
    this.setupForm();
    this.setBackLink();
    this.setupFormErrorsMap();
    this.workplaceTotalStaff = this.workplaceInterfaceService.totalStaff$.value;
    this.return = this.workplaceInterfaceService.returnTo$.value;

    this.prefillForm();
  }

  public ngAfterViewInit(): void {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  private setupForm(): void {
    this.form = this.formBuilder.group({
      totalStaff: [null, { validators: [Validators.required], updateOn: 'submit' }],
    });
  }

  protected prefillForm(): void {
    if (this.workplaceTotalStaff) {
      this.form.setValue({
        totalStaff: this.workplaceTotalStaff,
      });
    }
  }

  public onSubmit(): void {
    this.submitted = true;

    if (this.form.valid) {
      const totalStaff = this.form.get('totalStaff').value;
      this.workplaceInterfaceService.totalStaff$.next(totalStaff);

      const url = this.setFormSubmissionLink();
      this.router.navigate(['registration', url]);
    } else {
      this.errorSummaryService.scrollToErrorSummary();
    }
  }

  private setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'totalStaff',
        type: [
          {
            name: 'required',
            message: `Enter total staff number`,
          },
        ],
      },
    ];
  }

  public getErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  protected setFormSubmissionLink(): string {
    return this.return ? 'confirm-details' : 'add-user-details';
  }

  protected setBackLink(): void {
    const url = this.return ? 'confirm-details' : 'select-main-service';
    this.backService.setBackLink({ url: ['registration', url] });
  }
}
