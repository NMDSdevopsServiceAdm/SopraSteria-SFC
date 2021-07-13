import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Directive, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { LocationSearchResponse } from '@core/model/location.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { LocationService } from '@core/services/location.service';
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

  constructor(
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder,
    protected locationService: LocationService,
    protected router: Router,
    protected featureFlagsService: FeatureFlagsService,
  ) {}

  async ngOnInit(): Promise<void> {
    this.setupForm();
    this.setupFormErrorsMap();
    this.setupServerErrorsMap();
    await this.getFeatureFlag();
    this.init();
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
          validators: [Validators.required, Validators.maxLength(8)],
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
    ];
  }

  protected getAddressesByPostCode(): void {
    this.subscriptions.add(
      this.locationService.getAddressesByPostCode(this.getPostcode.value).subscribe(
        (data: LocationSearchResponse) => {
          this.onSuccess(data);
          this.router.navigate([`${this.flow}/select-workplace-address`]);
        },
        (error: HttpErrorResponse) => {
          this.serverError = this.errorSummaryService.getServerErrorMessage(error.status, this.serverErrorsMap);
          this.errorSummaryService.scrollToErrorSummary();
        },
      ),
    );
  }

  protected onSuccess(data: LocationSearchResponse): void {}

  public onSubmit(): void {
    this.submitted = true;
    this.errorSummaryService.syncFormErrorsEvent.next(true);

    if (this.form.valid) {
      this.getAddressesByPostCode();
    } else {
      this.errorSummaryService.scrollToErrorSummary();
    }
  }

  protected setBackLink(): void {
    let url;
    this.createAccountNewDesign ? (url = 'workplace-name') : (url = 'select-workplace-address');
    this.backService.setBackLink({ url: [this.flow, url] });
  }

  public getFirstErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
