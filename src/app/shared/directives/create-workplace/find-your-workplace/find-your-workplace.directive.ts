import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Directive, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { LocationSearchResponse } from '@core/model/location.model';
import { URLStructure } from '@core/model/url.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { LocationService } from '@core/services/location.service';
import { WorkplaceInterfaceService } from '@core/services/workplace-interface.service';
import { Subscription } from 'rxjs';

@Directive()
export class FindYourWorkplaceDirective implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('formEl') formEl: ElementRef;

  public flow: string;
  protected serverErrorsMap: Array<ErrorDefinition>;
  protected subscriptions: Subscription = new Subscription();
  public submitted = false;
  public form: FormGroup;
  public formErrorsMap: Array<ErrorDetails>;
  public serverError: string;
  public returnToWorkplaceNotFound: boolean;
  public returnToConfirmDetails: URLStructure;
  public postcodeOrLocationId: string;
  public workplaceSections: string[];
  public userAccountSections: string[];

  constructor(
    protected router: Router,
    public backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected route: ActivatedRoute,
    protected formBuilder: FormBuilder,
    protected workplaceInterfaceService: WorkplaceInterfaceService,
    protected locationService: LocationService,
  ) {}

  public ngOnInit(): void {
    this.flow = this.route.snapshot.parent.url[0].path;
    this.workplaceSections = this.route.snapshot.data.workplaceSections;
    this.userAccountSections = this.route.snapshot.data.userAccountSections;
    this.returnToWorkplaceNotFound = this.workplaceInterfaceService.workplaceNotFound$.value;
    this.returnToConfirmDetails = this.workplaceInterfaceService.returnTo$.value;
    this.postcodeOrLocationId = this.workplaceInterfaceService.postcodeOrLocationId$.value;
    this.setupForm();
    this.setupFormErrorsMap();
    this.prefillForm();
    this.setBackLink();
  }

  public ngAfterViewInit(): void {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  public setBackLink(): void {
    if (this.returnToConfirmDetails) {
      this.navigateToConfirmDetails();
      return;
    }

    const backLink = this.returnToWorkplaceNotFound ? 'workplace-not-found' : 'regulated-by-cqc';
    this.backService.setBackLink({ url: [this.flow, backLink] });
    this.workplaceInterfaceService.workplaceNotFound$.next(false);
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected navigateToConfirmDetails(): void {}

  private setupForm(): void {
    this.form = this.formBuilder.group({
      postcodeOrLocationID: [
        null,
        { validators: [Validators.required, Validators.pattern(`^[a-zA-Z0-9 -]{1,}$`)], updateOn: 'submit' },
      ],
    });
  }

  protected setupServerErrorsMap(): void {
    this.serverErrorsMap = [
      {
        name: 404,
        message: 'No location found.',
      },
      {
        name: 400,
        message: 'Invalid Postcode.',
      },
      {
        name: 500,
        message: 'Database error.',
      },
    ];
  }

  private setupFormErrorsMap(): void {
    const yourOrIts = this.flow === 'registration' ? 'your' : 'its';
    this.formErrorsMap = [
      {
        item: 'postcodeOrLocationID',
        type: [
          {
            name: 'required',
            message: `Enter ${yourOrIts} CQC location ID or ${yourOrIts} workplace postcode`,
          },
          {
            name: 'pattern',
            message: `Enter a valid CQC location ID or workplace postcode`,
          },
        ],
      },
    ];
  }

  protected prefillForm(): void {
    if (this.postcodeOrLocationId) {
      this.form.setValue({
        postcodeOrLocationID: this.postcodeOrLocationId,
      });
    }
  }

  public getErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  public onSubmit(): void {
    this.submitted = true;
    const postcodeOrLocationID = this.form.get('postcodeOrLocationID').value;
    this.workplaceInterfaceService.postcodeOrLocationId$.next(postcodeOrLocationID);

    if (this.form.valid) {
      this.subscriptions.add(
        this.locationService.getLocationByPostcodeOrLocationID(postcodeOrLocationID).subscribe(
          (data: LocationSearchResponse) => this.onSuccess(data),
          (error: HttpErrorResponse) => this.onError(error),
        ),
      );
    }
  }

  protected onSuccess(data: LocationSearchResponse): void {
    this.workplaceInterfaceService.locationAddresses$.next(data.locationdata);
    this.workplaceInterfaceService.searchMethod$.next(data.searchmethod);
    this.navigateToNextRoute(data);
  }

  private onError(error: HttpErrorResponse): void {
    if (error.status === 404) {
      this.workplaceInterfaceService.searchMethod$.next(error.error.searchmethod);
      this.router.navigate([this.flow, 'workplace-not-found']);
      return;
    }
    this.serverError = this.errorSummaryService.getServerErrorMessage(error.status, this.serverErrorsMap);
    this.errorSummaryService.scrollToErrorSummary();
  }

  private navigateToNextRoute(data: LocationSearchResponse): void {
    if (data.locationdata.length === 1) {
      this.router.navigate([this.flow, 'your-workplace']);
    } else {
      this.router.navigate([this.flow, 'select-workplace']);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
