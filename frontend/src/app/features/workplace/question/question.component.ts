import { AfterViewInit, Directive, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { Establishment } from '@core/model/establishment.model';
import { URLStructure } from '@core/model/url.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { ProgressBarUtil } from '@core/utils/progress-bar-util';
import isNull from 'lodash/isNull';
import { Subscription } from 'rxjs';

@Directive()
export class Question implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('formEl') formEl: ElementRef;
  public form: UntypedFormGroup;
  public establishment: Establishment;
  public primaryWorkplace: Establishment;
  public submitted = false;

  public return: URLStructure;

  private _previousRouteSegment: string;
  private _nextRouteSegment: string;
  private _skipRouteSegment: string;

  public back: URLStructure;
  public hideBackLink: boolean;

  public formErrorsMap: Array<ErrorDetails> = [];
  public serverError: string;
  public serverErrorsMap: Array<ErrorDefinition> = [];
  protected subscriptions: Subscription = new Subscription();
  protected initiated = false;
  public submitAction: { action: string; save: boolean } = null;
  public workplaceFlowSections: string[] = ProgressBarUtil.workplaceFlowProgressBarSections();

  constructor(
    protected formBuilder: UntypedFormBuilder,
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

          if (!this.hideBackLink) {
            this.setBackLink();
          }
        }
      }),
    );

    this.setupFormErrorsMap();
    this.setupServerErrorsMap();
  }

  ngAfterViewInit() {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  protected setBackLink(): void {
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

  protected setPreviousRouteSegment(pathSegment: string) {
    this._previousRouteSegment = pathSegment;
  }

  protected setNextRouteSegment(pathSegment: string) {
    this._nextRouteSegment = pathSegment;
  }

  protected setSkipRouteSegment(pathSegment: string) {
    this._skipRouteSegment = pathSegment;
  }

  protected isInAddDetailsFlow(): boolean {
    // TODO: verify and improve this
    return !this.return;
  }

  public get previousRoute(): string[] {
    if (this.isInAddDetailsFlow) {
      return this.establishmentService.buildPathForAddWorkplaceDetails(
        this.establishment.uid,
        this._previousRouteSegment,
      );
    } else {
      return ['/workplace', `${this.establishment.uid}`, this._previousRouteSegment];
    }
  }

  public get nextRoute(): string[] {
    if (this.isInAddDetailsFlow) {
      return this.establishmentService.buildPathForAddWorkplaceDetails(this.establishment.uid, this._nextRouteSegment);
    } else {
      return ['/workplace', `${this.establishment.uid}`, this._nextRouteSegment];
    }
  }

  public get skipRoute(): string[] {
    if (this.isInAddDetailsFlow) {
      return this.establishmentService.buildPathForAddWorkplaceDetails(this.establishment.uid, this._skipRouteSegment);
    } else {
      return ['/workplace', `${this.establishment.uid}`, this._skipRouteSegment];
    }
  }

  protected set previousRoute(route: string | string[]) {
    const pathSegment = Array.isArray(route) ? route.at(-1) : route;
    this.setPreviousRouteSegment(pathSegment);
  }

  protected set nextRoute(route: string | string[]) {
    const pathSegment = Array.isArray(route) ? route.at(-1) : route;
    this.setNextRouteSegment(pathSegment);
  }

  protected set skipRoute(route: string | string[]) {
    const pathSegment = Array.isArray(route) ? route.at(-1) : route;
    this.setSkipRouteSegment(pathSegment);
  }

  protected navigate(): Promise<boolean> {
    const action = this.submitAction.action;

    if (!action) {
      return;
    }

    switch (action) {
      case 'continue':
        return this.router.navigate(this.nextRoute);
      case 'summary':
        return this.router.navigate(['/workplace', this.establishment.uid, 'check-answers']);
      case 'skip':
        return this.router.navigate(this.skipRoute);
      case 'exit':
        return this.router.navigate(['/dashboard'], { fragment: 'workplace' });
      case 'return':
        return this.router.navigate(this.return.url, {
          fragment: this.return.fragment,
          queryParams: this.return.queryParams,
        });
    }
  }

  public setSubmitAction(payload: { action: string; save: boolean }): void {
    this.submitAction = { action: payload.action, save: payload.save };

    if (!payload.save) {
      this.onSubmit();
    }
  }

  public onSubmit(): void {
    if (!this.submitAction.save) {
      this.establishment.showSharingPermissionsBanner
        ? this.removeSharingPermissionsBanner(() => this.navigate())
        : this.navigate();
      return;
    }

    this.serverError = null;
    this.submitted = true;
    this.errorSummaryService.syncFormErrorsEvent.next(true);

    /**
     * Required to reinstate error links on dynamic forms
     * where the error summary is removed on adding rows
     */
    this.addErrorLinkFunctionality();
    this.createDynamicErrorMessaging();

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
  protected removeSharingPermissionsBanner(completeFunction: () => unknown): void {
    // callback is invoked if func not declared in child to ensure navigation
    completeFunction();
  }
  protected createDynamicErrorMessaging(): void {}
  protected addErrorLinkFunctionality(): void {}
  protected addAlert(): void {}

  protected _onSuccess(data) {
    this.establishmentService.setState({ ...this.establishment, ...data });
    this.onSuccess();

    this.navigate().then(() => {
      this.addAlert();
    });
  }

  protected onError(error) {
    this.serverError = this.errorSummaryService.getServerErrorMessage(error.status, this.serverErrorsMap);
    this.errorSummaryService.scrollToErrorSummary();
  }

  public get isPrimaryWorkplace() {
    return this.primaryWorkplace && this.establishment.uid === this.primaryWorkplace.uid;
  }
}
