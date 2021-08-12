import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Directive, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { LocationSearchResponse } from '@core/model/location.model';
import { URLStructure } from '@core/model/url.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { LocationService } from '@core/services/location.service';
import { WorkplaceInterfaceService } from '@core/services/workplace-interface.service';
import { SanitizePostcodeUtil } from '@core/utils/sanitize-postcode-util';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { Subscription } from 'rxjs';

@Directive()
export class FindWorkplaceAddress implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('formEl') formEl: ElementRef;
  protected serverErrorsMap: Array<ErrorDefinition>;
  protected subscriptions: Subscription = new Subscription();
  protected flow: string;
  public form: FormGroup;
  public formErrorsMap: Array<ErrorDetails>;
  public serverError: string;
  public submitted = false;
  public createAccountNewDesign: boolean;
  public returnToConfirmDetails: URLStructure;

  constructor(
    public backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder,
    protected locationService: LocationService,
    protected router: Router,
    protected featureFlagsService: FeatureFlagsService,
    protected workplaceInterfaceService: WorkplaceInterfaceService,
  ) {}

  async ngOnInit(): Promise<void> {
    this.setupForm();
    this.setupFormErrorsMap();
    this.setupServerErrorsMap();
    this.init();
    this.prefillForm();
    await this.getFeatureFlag();
    this.setBackLink();
  }

  async getFeatureFlag(): Promise<void> {
    await this.featureFlagsService.configCatClient.forceRefreshAsync();
    this.createAccountNewDesign = await this.featureFlagsService.configCatClient.getValueAsync(
      'createAccountNewDesign',
      false,
    );
  }

  ngAfterViewInit() {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  get getPostcode() {
    return this.form.get('postcode');
  }

  protected init(): void {}
  protected setupFormErrorsMap(): void {}

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

  protected setupServerErrorsMap(): void {
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
        name: 503,
        message: 'Database error.',
      },
    ];
  }

  protected prefillForm(): void {
    const postcode = this.workplaceInterfaceService.postcode$.value;
    if (postcode) {
      this.form.setValue({
        postcode: postcode,
      });
    }
  }

  protected validPostcode(control: FormControl): { [s: string]: boolean } {
    if (!SanitizePostcodeUtil.sanitizePostcode(control.value)) {
      return { invalidPostcode: true };
    }
    return null;
  }

  protected getAddressesByPostCode(): void {
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

  protected onSuccess(data: LocationSearchResponse): void {}

  private onError(error: HttpErrorResponse): void {
    if (error.status === 404) {
      this.setInvalidPostcode(this.getPostcode.value);
      this.router.navigate([this.flow, 'workplace-address-not-found']);
      return;
    }
    this.serverError = this.errorSummaryService.getServerErrorMessage(error.status, this.serverErrorsMap);
    this.errorSummaryService.scrollToErrorSummary();
  }

  protected setInvalidPostcode(postcode: string): void {}

  public onSubmit(): void {
    this.submitted = true;
    const postcode = this.form.get('postcode').value;
    this.workplaceInterfaceService.postcode$.next(postcode);

    this.errorSummaryService.syncFormErrorsEvent.next(true);
    if (this.form.valid) {
      this.getAddressesByPostCode();
    } else {
      this.errorSummaryService.scrollToErrorSummary();
    }
  }

  public setBackLink(): void {
    if (this.returnToConfirmDetails) {
      this.setBackLinkToConfirmDetailsPage();
      return;
    }
    const url = this.createAccountNewDesign ? 'new-regulated-by-cqc' : 'select-workplace-address';
    this.backService.setBackLink({ url: [this.flow, url] });
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected setBackLinkToConfirmDetailsPage(): void {}

  public getFirstErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
