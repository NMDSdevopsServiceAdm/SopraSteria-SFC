import { AfterViewInit, Directive, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { URLStructure } from '@core/model/url.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { RegistrationService } from '@core/services/registration.service';
import { WorkplaceInterfaceService } from '@core/services/workplace-interface.service';

@Directive()
export class AddTotalStaffDirective implements OnInit, AfterViewInit {
  @ViewChild('formEl') formEl: ElementRef;

  public flow: string;
  protected serverErrorsMap: Array<ErrorDefinition>;
  public submitted = false;
  public form: FormGroup;
  public serverError: string;
  public formErrorsMap: Array<ErrorDetails>;
  public returnToConfirmDetails: URLStructure;
  public totalStaffNumber: number;

  constructor(
    protected router: Router,
    public backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected route: ActivatedRoute,
    protected formBuilder: FormBuilder,
    protected registrationService: RegistrationService,
    public workplaceInterfaceService: WorkplaceInterfaceService,
  ) {}

  public ngOnInit(): void {
    this.flow = this.route.snapshot.parent.url[0].path;
    this.setupForm();
    this.setBackLink();
    this.setupFormErrorsMap();
    this.totalStaffNumber = this.workplaceInterfaceService.totalStaff$.value;
    this.prefillForm();
  }

  public ngAfterViewInit(): void {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  private setupForm(): void {
    this.form = this.formBuilder.group({
      totalStaff: [null, [Validators.required]],
    });
  }

  protected prefillForm(): void {
    if (this.totalStaffNumber) {
      this.form.setValue({
        totalStaff: this.totalStaffNumber,
      });
    }
  }

  public onSubmit(): void {
    this.submitted = true;

    if (this.form.valid) {
      const totalStaff = this.form.get('totalStaff').value;

      this.workplaceInterfaceService.totalStaff$.next(totalStaff);
      this.navigateToNextRoute();
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

  private navigateToNextRoute(): void {
    this.router.navigate([this.flow, 'add-user-details']);
  }

  protected setBackLink(): void {
    this.backService.setBackLink({ url: [`${this.flow}/select-main-service`] });
  }
}
