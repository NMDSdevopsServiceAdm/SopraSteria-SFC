import { AfterViewInit, Directive, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { LocationAddress } from '@core/model/location.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { RegistrationService } from '@core/services/registration.service';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { filter } from 'lodash';
import { Subscription } from 'rxjs';

@Directive()
export class SelectWorkplaceDirective implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('formEl') formEl: ElementRef;
  public flow: string;
  public locationAddresses: Array<LocationAddress>;
  public form: FormGroup;
  public formErrorsMap: Array<ErrorDetails>;
  public submitted = false;
  public isCQCLocationUpdate: boolean;
  public createAccountNewDesign: boolean;
  public enteredPostcode: string;
  public workplaceNotDisplayedLink: string;
  protected subscriptions: Subscription = new Subscription();
  protected nextRoute: string;

  constructor(
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected featureFlagsService: FeatureFlagsService,
    protected registrationService: RegistrationService,
  ) {}

  ngOnInit(): void {
    this.setupForm();
    this.setupFormErrorsMap();
    this.init();
    this.enteredPostcode = this.locationAddresses[0].postalCode;
    this.featureFlagsService.configCatClient.getValueAsync('createAccountNewDesign', false).then((value) => {
      this.createAccountNewDesign = value;
      this.setBackLink();
      this.setWorkplaceNotDisplayedLink();
      this.setNextRoute();
    });
  }

  ngAfterViewInit(): void {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  protected init(): void {}

  protected save(): void {}

  protected setBackLink(): void {
    const backLink = this.createAccountNewDesign ? 'find-workplace' : 'regulated-by-cqc';
    this.backService.setBackLink({ url: [`${this.flow}/${backLink}`] });
  }

  protected setWorkplaceNotDisplayedLink(): void {
    this.workplaceNotDisplayedLink = this.createAccountNewDesign ? 'workplace-name-address' : 'enter-workplace-address';
  }

  protected setNextRoute(): void {
    this.nextRoute = this.createAccountNewDesign ? 'new-select-main-service' : 'select-main-service';
  }

  protected setupForm(): void {
    this.form = this.formBuilder.group({
      workplace: [
        null,
        {
          validators: [Validators.required],
          updateOn: 'submit',
        },
      ],
    });
  }

  protected setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'workplace',
        type: [
          {
            name: 'required',
            message: `Select your workplace if it's displayed`,
          },
        ],
      },
    ];
  }

  protected getSelectedLocation(): LocationAddress {
    const selectedLocationId: string = this.form.get('workplace').value;
    return filter(this.locationAddresses, ['locationId', selectedLocationId])[0];
  }

  public onSubmit(): void {
    this.submitted = true;
    this.errorSummaryService.syncFormErrorsEvent.next(true);

    if (this.form.valid) {
      this.save();
    } else {
      this.errorSummaryService.scrollToErrorSummary();
    }
  }

  /**
   * Pass in formGroup or formControl name and errorType
   * Then return error message
   * @param item
   * @param errorType
   */
  public getFormErrorMessage(item: string, errorType: string): string {
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
