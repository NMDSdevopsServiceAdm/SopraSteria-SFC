import { AfterViewInit, Directive, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { LocationAddress } from '@core/model/location.model';
import { URLStructure } from '@core/model/url.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { WorkplaceInterfaceService } from '@core/services/workplace-interface.service';
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
  public enteredPostcode: string;
  public returnToConfirmDetails: URLStructure;
  public title: string;
  protected subscriptions: Subscription = new Subscription();
  protected nextRoute: string;
  protected errorMessage: string;

  constructor(
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected workplaceInterfaceService: WorkplaceInterfaceService,
  ) {}

  ngOnInit(): void {
    this.setErrorMessage();
    this.setupForm();
    this.init();
    this.setupFormErrorsMap();
    this.setupSubscription();
    this.setTitle();
    this.enteredPostcode = this.locationAddresses[0].postalCode;
    this.setBackLink();
    this.setNextRoute();
  }

  ngAfterViewInit(): void {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  protected init(): void {} // eslint-disable-line @typescript-eslint/no-empty-function

  protected save(): void {
    this.workplaceInterfaceService.manuallyEnteredWorkplace$.next(false);
    this.workplaceInterfaceService.selectedLocationAddress$.next(this.getSelectedLocation());
    this.router.navigate([this.flow, this.nextRoute]);
  }

  protected setBackLink(): void {
    this.backService.setBackLink({ url: [`${this.flow}/find-workplace`] });
  }

  protected setErrorMessage(): void {
    this.errorMessage = `Select your workplace if it's displayed`;
  }

  protected setTitle(): void {
    this.title = 'Select your workplace';
  }

  public setNextRoute(): void {} // eslint-disable-line @typescript-eslint/no-empty-function

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
            message: this.errorMessage,
          },
        ],
      },
    ];
  }

  protected setupSubscription(): void {
    this.subscriptions.add(
      this.workplaceInterfaceService.locationAddresses$.subscribe(
        (locationAddresses: Array<LocationAddress>) => (this.locationAddresses = locationAddresses),
      ),
    );
  }

  public prefillForm(): void {
    if (this.workplaceInterfaceService.selectedLocationAddress$.value) {
      this.form.patchValue({
        workplace: this.workplaceInterfaceService.selectedLocationAddress$.value.locationId,
      });
    }
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
