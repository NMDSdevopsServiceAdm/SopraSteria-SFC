import { OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { Establishment } from '@core/model/establishment.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { isNull } from 'util';

export class Question implements OnInit, OnDestroy {
  public form: FormGroup;
  public establishment: Establishment;
  public submitted = false;

  public return: string[];
  public previous: string[];
  public next: string[];
  public back: string[];

  public formErrorsMap: Array<ErrorDetails>;
  public serverErrorsMap: Array<ErrorDefinition>;
  protected subscriptions: Subscription = new Subscription();

  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected establishmentService: EstablishmentService
  ) {}

  ngOnInit() {
    this.subscriptions.add(
      this.establishmentService.establishment$.pipe(take(1)).subscribe(establishment => {
        this.establishment = establishment;

        this.init();

        this.back = this.return ? this.return : this.previous;
        this.backService.setBackLink({ url: this.back });
      })
    );

    this.setupFormErrorsMap();
    this.setupServerErrorsMap();
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

  protected init(): void {}
  protected setupFormErrorsMap(): void {}
  protected setupServerErrorsMap(): void {}
  protected generateUpdateProps(): any {}
  protected updateEstablishment(props, action): void {}
  protected onSuccess(): void {}

  protected navigate(action): void {
    switch (action) {
      case 'continue':
        this.router.navigate(this.next);
        break;

      case 'summary':
        this.router.navigate(['/workplace', this.establishment.uid, 'summary']);
        break;

      case 'exit':
        this.router.navigate(['/dashboard'], { fragment: 'workplace' });
        break;

      case 'return':
        this.router.navigate(this.return);
        break;
    }
  }

  public onSubmit(payload: { action: string; save: boolean } = { action: 'continue', save: true }) {
    if (!payload.save) {
      this.navigate(payload.action);
      return;
    }

    this.submitted = true;
    this.errorSummaryService.syncFormErrorsEvent.next(true);

    if (!this.form.valid) {
      this.errorSummaryService.scrollToErrorSummary();
      return;
    }

    const props = this.generateUpdateProps();

    if (isNull(props)) {
      this.onSuccess();
      this.navigate(payload.action);
      return;
    }

    this.updateEstablishment(props, payload.action);
  }

  _onSuccess(data, action) {
    this.establishmentService.setState({ ...this.establishment, ...data });
    this.onSuccess();
    this.navigate(action);
  }

  onError(error) {
    console.log(error);
  }
}
