import { AfterViewInit, ElementRef, OnDestroy, OnInit, ViewChild, Directive } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { Establishment } from '@core/model/establishment.model';
import { URLStructure } from '@core/model/url.model';
import { Worker } from '@core/model/worker.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { WorkerService } from '@core/services/worker.service';
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
  protected initiated = false;

  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected route: ActivatedRoute,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected workerService: WorkerService,
  ) {}

  ngOnInit() {
    this.return = this.workerService.returnTo;
    this.workplace = this.route.parent.snapshot.data.establishment;
    this.primaryWorkplace = this.route.parent.snapshot.data.primaryWorkplace;

    this.subscriptions.add(
      this.workerService.worker$.subscribe((worker) => {
        this.worker = worker;

        if (!this.initiated) {
          this._init();

          this.back = this.return
            ? this.return
            : {
                url: this.previous,
                ...(!this.workerService.addStaffRecordInProgress$.value && { fragment: 'staff-records' }),
              };
          this.backService.setBackLink(this.back);
        }
      }),
    );

    this.setupFormErrorsMap();
    this.setupServerErrorsMap();
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

  protected navigate(action): void {
    switch (action) {
      case 'continue':
        this.router.navigate(this.next);
        break;

      case 'summary':
        this.router.navigate(this.getRoutePath('check-answers'));
        break;

      case 'exit':
        const url =
          this.primaryWorkplace && this.workplace.uid === this.primaryWorkplace.uid
            ? ['/dashboard']
            : ['/workplace', this.workplace.uid];
        this.router.navigate(url, { fragment: 'staff-records' });
        break;

      case 'return':
        this.router.navigate(this.return.url, { fragment: this.return.fragment, queryParams: this.return.queryParams });
        break;
    }
  }

  public getRoutePath(name: string) {
    return ['/workplace', this.workplace.uid, 'staff-record', this.worker.uid, name];
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

    if (!this.worker) {
      this.subscriptions.add(
        this.workerService.createWorker(this.workplace.uid, props).subscribe(
          (data) => this._onSuccess(data, payload.action),
          (error) => this.onError(error),
        ),
      );
    } else {
      this.subscriptions.add(
        this.workerService.updateWorker(this.workplace.uid, this.worker.uid, props).subscribe(
          (data) => this._onSuccess(data, payload.action),
          (error) => this.onError(error),
        ),
      );
    }
  }

  _onSuccess(data, action) {
    this.workerService.setState({ ...this.worker, ...data });
    this.onSuccess();
    this.navigate(action);
  }

  onError(error) {
    this.serverError = this.errorSummaryService.getServerErrorMessage(error.status, this.serverErrorsMap);
    this.errorSummaryService.scrollToErrorSummary();
  }
}
