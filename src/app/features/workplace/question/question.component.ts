import { OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { Establishment } from '@core/model/establishment.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { Subscription } from 'rxjs';
import { isNull } from 'util';

export class Question implements OnInit, OnDestroy {
  public form: FormGroup;
  public establishment: Establishment;
  public submitted = false;

  public return: string[];
  public previous: string[];
  public next: string[];
  public back: string[];

  public formErrorsMap: Array<ErrorDetails> = [];
  public serverError: string;
  public serverErrorsMap: Array<ErrorDefinition> = [];
  protected subscriptions: Subscription = new Subscription();
  protected initiated = false;

  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected establishmentService: EstablishmentService
  ) {}

  ngOnInit() {
    this.subscriptions.add(
      this.establishmentService.establishment$.subscribe(establishment => {
        this.establishment = establishment;

        if (!this.initiated) {
          this._init();

          this.setBackLink();
        }
      })
    );

    this.setupFormErrorsMap();
    this.setupServerErrorsMap();
  }

  setBackLink() {
    this.back = this.return ? this.return : this.previous;
    this.backService.setBackLink({ url: this.back });
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public getFormErrorMessage(item: string, errorType: string): string {
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  public getFirstErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  public onSubmit() {
    this.serverError = null;
    this.submitted = true;
    this.errorSummaryService.syncFormErrorsEvent.next(true);

    if (!this.form.valid) {
      this.errorSummaryService.scrollToErrorSummary();
      return;
    }

    const props = this.generateUpdateProps();

    if (isNull(props)) {
      this.onSuccess();
      this.navigate();
      return;
    }

    this.updateEstablishment(props);
  }

  protected _init(): void {
    this.initiated = true;
    this.init();
  }

  protected init(): void {}
  protected setupFormErrorsMap(): void {}
  protected setupServerErrorsMap(): void {}
  protected generateUpdateProps(): any {}
  protected updateEstablishment(props): void {}
  protected onSuccess(): void {}

  protected navigate(): void {
    this.router.navigate(this.next);
  }

  protected _onSuccess(data) {
    this.establishmentService.setState({ ...this.establishment, ...data });
    this.onSuccess();
    this.navigate();
  }

  protected onError(error) {
    this.serverError = this.errorSummaryService.getServerErrorMessage(error.status, this.serverErrorsMap);
    this.errorSummaryService.scrollToErrorSummary();
  }
}
