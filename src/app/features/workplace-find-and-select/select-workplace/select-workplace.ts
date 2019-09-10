import { AfterViewInit, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { LocationAddress } from '@core/model/location.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { filter } from 'lodash';
import { Subscription } from 'rxjs';

export class SelectWorkplace implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('formEl', { static: false }) formEl: ElementRef;
  protected flow: string;
  protected locationAddresses: Array<LocationAddress>;
  protected subscriptions: Subscription = new Subscription();
  public form: FormGroup;
  public formErrorsMap: Array<ErrorDetails>;
  public submitted = false;

  constructor(
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder,
    protected router: Router
  ) {}

  ngOnInit() {
    this.setupForm();
    this.setupFormErrorsMap();
    this.init();
    this.setBackLink();
  }

  ngAfterViewInit() {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  protected init(): void {}

  protected save(): void {}

  protected setBackLink(): void {
    this.backService.setBackLink({ url: [`${this.flow}/regulated-by-cqc`] });
  }

  protected setupForm(): void {
    this.form = this.formBuilder.group({
      workplace: ['', Validators.required],
    });
  }

  public setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'workplace',
        type: [
          {
            name: 'required',
            message: 'Please select an address.',
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
      this.router.navigate([`${this.flow}/select-main-service`]);
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

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
