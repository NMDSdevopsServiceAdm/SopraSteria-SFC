import { AfterViewInit, Directive, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { Establishment } from '@core/model/establishment.model';
import { URLStructure } from '@core/model/url.model';
import { Worker } from '@core/model/worker.model';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkerService } from '@core/services/worker.service';
import { ProgressBarUtil } from '@core/utils/progress-bar-util';
import isNull from 'lodash/isNull';
import { Subscription } from 'rxjs';

@Directive()
export class QuestionComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('formEl') formEl: ElementRef;
  public form: FormGroup;
  public worker: Worker;
  public workplace: Establishment;
  public primaryWorkplace: Establishment;
  public submitted = false;

  public return: URLStructure;
  public previous: string[];
  public next: string[];
  public back: URLStructure;

  public formErrorsMap: Array<ErrorDetails>;
  public serverError: string;
  public serverErrorsMap: Array<ErrorDefinition>;
  protected subscriptions: Subscription = new Subscription();
  public initiated = false;

  public staffRecordSections: string[] = ProgressBarUtil.staffRecordProgressBarSections();
  public insideFlow: boolean;
  public flow: string;
  public submitAction: { action: string; save: boolean } = null;
  public returnUrl: string[];
  public submitTitle: string;

  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected route: ActivatedRoute,
    protected backLinkService: BackLinkService,
    protected errorSummaryService: ErrorSummaryService,
    protected workerService: WorkerService,
    protected establishmentService: EstablishmentService,
  ) {}

  ngOnInit(): void {
    this.return = this.workerService.returnTo;
    this.workplace = this.route.parent.snapshot.data.establishment;
    this.primaryWorkplace = this.establishmentService.primaryWorkplace;
    this.insideFlow = this.route.parent.snapshot.url[0].path !== 'staff-record-summary';
    this.subscriptions.add(
      this.workerService.worker$.subscribe((worker) => {
        this.worker = worker;
        if (!this.initiated) {
          this._init();
          this.back = this.previous
            ? {
                url: this.previous,
                ...(!this.workerService.addStaffRecordInProgress$.value && { fragment: 'staff-records' }),
              }
            : this.return;

          this.setBackLink();
        }
      }),
    );

    if (this.worker && !this.returnUrl) {
      this.returnUrl = ['/workplace', this.workplace.uid, 'staff-record', this.worker.uid, 'staff-record-summary'];
    }

    this.setupFormErrorsMap();
    this.setupServerErrorsMap();
  }

  public setBackLink(): void {
    this.backLinkService.showBackLink();
  }

  ngAfterViewInit() {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.workerService.setReturnTo(null);
  }

  public getFormErrorMessage(item: string, errorType: string): string {
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  protected _init() {
    this.initiated = true;
    this.init();
  }

  protected init() {}
  protected setupFormErrorsMap() {}
  protected setupServerErrorsMap() {}
  protected generateUpdateProps() {}
  protected onSuccess() {}
  protected addErrorLinkFunctionality(): void {}
  protected addAlert(): void {}

  protected navigate(): void {
    const { action } = this.submitAction;

    if (!action) {
      return;
    }

    switch (action) {
      case 'continue':
        this.router.navigate(this.next);
        break;

      case 'summary':
        this.router.navigate(this.getRoutePath(''));
        break;

      case 'exit':
        const url =
          this.primaryWorkplace?.uid === this.workplace.uid ? ['/dashboard'] : ['/workplace', this.workplace.uid];
        this.router.navigate(url, { fragment: 'staff-records' });
        break;

      case 'return':
        this.router.navigate(this.returnUrl);
        break;
    }
  }

  public getRoutePath(name: string) {
    if (name) {
      return ['/workplace', this.workplace.uid, 'staff-record', this.worker.uid, name];
    } else {
      return ['/workplace', this.workplace.uid, 'staff-record', this.worker.uid, 'staff-record-summary'];
    }
  }

  public setSubmitAction(payload: { action: string; save: boolean }): void {
    this.submitAction = { action: payload.action, save: payload.save };

    !payload.save && this.onSubmit();
  }

  public onSubmit() {
    if (!this.submitAction.save) {
      this.navigate();
      return;
    }

    this.submitted = true;
    this.errorSummaryService.syncFormErrorsEvent.next(true);
    this.addErrorLinkFunctionality();

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

    if (!this.worker) {
      this.subscriptions.add(
        this.workerService.createWorker(this.workplace.uid, props).subscribe(
          (data) => this._onSuccess(data),
          (error) => this.onError(error),
        ),
      );
    } else {
      this.subscriptions.add(
        this.workerService.updateWorker(this.workplace.uid, this.worker.uid, props).subscribe(
          (data) => this._onSuccess(data),
          (error) => this.onError(error),
        ),
      );
    }
  }

  _onSuccess(data) {
    this.workerService.setState({ ...this.worker, ...data });
    this.onSuccess();
    this.navigate();
    this.addAlert();
  }

  onError(error) {
    this.serverError = this.errorSummaryService.getServerErrorMessage(error.status, this.serverErrorsMap);
    this.errorSummaryService.scrollToErrorSummary();
  }
}
