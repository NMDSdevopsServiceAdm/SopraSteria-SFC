import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Directive, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { LocationSearchResponse } from '@core/model/location.model';
import { BackService } from '@core/services/back.service';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { LocationService } from '@core/services/location.service';
import { WorkplaceInterfaceService } from '@core/services/workplace-interface.service';
import { ProgressBarUtil } from '@core/utils/progress-bar-util';
import { SanitizePostcodeUtil } from '@core/utils/sanitize-postcode-util';
import { Subscription } from 'rxjs';

@Directive()
export class FindWorkplaceAddressDirective implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('formEl') formEl: ElementRef;
  protected serverErrorsMap: Array<ErrorDefinition>;
  protected subscriptions: Subscription = new Subscription();
  public flow: string;
  public form: FormGroup;
  public formErrorsMap: Array<ErrorDetails>;
  public serverError: string;
  public submitted = false;
  public workplaceSections: string[];
  public userAccountSections: string[];

  constructor(
    public backService: BackService,
    protected backLinkService: BackLinkService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder,
    protected locationService: LocationService,
    protected router: Router,
    protected workplaceInterfaceService: WorkplaceInterfaceService,
  ) {}

  ngOnInit(): void {
    this.setFlow();
    this.workplaceSections = ProgressBarUtil.workplaceProgressBarSections();
    this.userAccountSections = ProgressBarUtil.userProgressBarSections();
    this.setupForm();
    this.setupFormErrorsMap();
    this.setupServerErrorsMap();
    this.prefillForm();

    this.setBackLink();
  }

  ngAfterViewInit(): void {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  get getPostcode(): AbstractControl {
    return this.form.get('postcode');
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected setFlow(): void {}

  private setupForm(): void {
    this.form = this.formBuilder.group({
      postcode: [
        '',
        {
          validators: [Validators.required, Validators.maxLength(8), this.validPostcode],
          updateOn: 'submit',
        },
      ],
    });
  }

  private setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'postcode',
        type: [
          {
            name: 'required',
            message: `Enter ${this.flow === 'registration' ? 'your' : 'the'} workplace postcode`,
          },
          {
            name: 'maxlength',
            message: 'Postcode must be 8 characters or fewer',
          },
          {
            name: 'invalidPostcode',
            message: 'Enter a valid workplace postcode',
          },
        ],
      },
    ];
  }

  private setupServerErrorsMap(): void {
    this.serverErrorsMap = [
      {
        name: 400,
        message: 'Enter a valid workplace postcode',
      },
      {
        name: 404,
        message: 'No results found.',
      },
      {
        name: 500,
        message: 'Database error.',
      },
    ];
  }

  private prefillForm(): void {
    const postcode = this.workplaceInterfaceService.postcode$.value;
    if (postcode) {
      this.form.setValue({
        postcode: postcode,
      });
    }
  }

  private validPostcode(control: FormControl): { [s: string]: boolean } {
    if (!SanitizePostcodeUtil.sanitizePostcode(control.value)) {
      return { invalidPostcode: true };
    }
    return null;
  }

  private getAddressesByPostCode(): void {
    this.subscriptions.add(
      this.locationService.getAddressesByPostCode(this.getPostcode.value).subscribe(
        (data: LocationSearchResponse) => {
          this.onSuccess(data);
          this.router.navigate([this.flow, 'select-workplace-address']);
        },
        (error: HttpErrorResponse) => this.onError(error),
      ),
    );
  }

  private onError(error: HttpErrorResponse): void {
    if (error.status === 404) {
      this.setInvalidPostcode(this.getPostcode.value);
      this.router.navigate([this.flow, 'workplace-address-not-found']);
      return;
    }
    this.serverError = this.errorSummaryService.getServerErrorMessage(error.status, this.serverErrorsMap);
    this.errorSummaryService.scrollToErrorSummary();
  }

  public onSubmit(): void {
    this.submitted = true;

    this.errorSummaryService.syncFormErrorsEvent.next(true);
    if (this.form.valid) {
      this.workplaceInterfaceService.postcode$.next(this.getPostcode.value);
      this.getAddressesByPostCode();
    } else {
      this.errorSummaryService.scrollToErrorSummary();
    }
  }

  public setBackLink(): void {
    this.backLinkService.showBackLink();

    // const returnToWorkplaceNotFound = this.workplaceInterfaceService.workplaceNotFound$.value;

    // const backLink = returnToWorkplaceNotFound ? 'workplace-address-not-found' : 'regulated-by-cqc';

    // this.backService.setBackLink({ url: [this.flow, backLink] });
    // this.workplaceInterfaceService.workplaceNotFound$.next(false);
  }

  public getFirstErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  private setInvalidPostcode(postcode: string): void {
    this.workplaceInterfaceService.invalidPostcodeEntered$.next(postcode);
  }

  private onSuccess(data: LocationSearchResponse): void {
    this.workplaceInterfaceService.locationAddresses$.next(data.postcodedata);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
