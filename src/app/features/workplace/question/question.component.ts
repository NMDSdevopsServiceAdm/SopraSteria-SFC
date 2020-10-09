import { AfterViewInit, ElementRef, OnDestroy, OnInit, ViewChild, Directive } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { Establishment } from '@core/model/establishment.model';
import { URLStructure } from '@core/model/url.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import isNull from 'lodash/isNull';
import { Subscription } from 'rxjs';

@Directive()
export class Question implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('formEl') formEl: ElementRef;
  public form: FormGroup;
  public establishment: Establishment;
  public primaryWorkplace: Establishment;
  public submitted = false;

  public return: URLStructure;
  public previousRoute: string[];
  public nextRoute: string[];
  public back: URLStructure;

  public formErrorsMap: Array<ErrorDetails> = [];
  public serverError: string;
  public serverErrorsMap: Array<ErrorDefinition> = [];
  protected subscriptions: Subscription = new Subscription();
  protected initiated = false;
  protected submitAction: { action: string; save: boolean } = null;

  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected establishmentService: EstablishmentService,
  ) {}

  ngOnInit() {
    this.return = this.establishmentService.returnTo;

    this.subscriptions.add(
      this.establishmentService.establishment$.subscribe((establishment) => {
        this.establishment = establishment;
        this.primaryWorkplace = this.establishmentService.primaryWorkplace;

        if (!this.initiated) {
          this._init();

          this.setBackLink();
        }
      }),
    );

    this.setupFormErrorsMap();
    this.setupServerErrorsMap();
  }

  ngAfterViewInit() {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  setBackLink() {
    this.back = this.return ? this.return : { url: this.previousRoute };
    this.backService.setBackLink(this.back);
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

  protected navigate(): void {
    const action = this.submitAction.action;
    if (!action) {
      return;
    }

    switch (action) {
      case 'continue':
        this.router.navigate(this.nextRoute);
        break;

      case 'summary':
        this.router.navigate(['/workplace', this.establishment.uid, 'check-answers']);
        break;

      case 'exit':
        const url = this.isPrimaryWorkplace ? ['/dashboard'] : ['/workplace', this.establishment.uid];
        this.router.navigate(url, { fragment: 'workplace' });
        break;

      case 'return':
        this.router.navigate(this.return.url, { fragment: this.return.fragment, queryParams: this.return.queryParams });
        break;
    }
  }

  public onSubmit(payload: { action: string; save: boolean } = { action: 'continue', save: true }) {
    this.submitAction = payload;
    if (!this.submitAction.save) {
      this.navigate();
      return;
    }

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

  protected _onSuccess(data) {
    this.establishmentService.setState({ ...this.establishment, ...data });
    this.onSuccess();
    this.navigate();
  }

  protected onError(error) {
    this.serverError = this.errorSummaryService.getServerErrorMessage(error.status, this.serverErrorsMap);
    this.errorSummaryService.scrollToErrorSummary();
  }

  public get isPrimaryWorkplace() {
    return this.primaryWorkplace && this.establishment.uid === this.primaryWorkplace.uid;
  }
}
