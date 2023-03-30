import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { Establishment } from '@core/model/establishment.model';
import { Worker } from '@core/model/worker.model';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-long-term-absence',
  templateUrl: './long-term-absence.component.html',
})
export class LongTermAbsenceComponent implements OnInit {
  @ViewChild('formEl') formEl: ElementRef;
  public worker: Worker;
  public form: UntypedFormGroup;
  public submitted: boolean;
  public longTermAbsenceReasons: Array<string>;
  public backAtWork = false;
  private formErrorsMap: Array<ErrorDetails>;
  public workplace: Establishment;
  private subscriptions: Subscription = new Subscription();
  public returnUrl;

  constructor(
    private route: ActivatedRoute,
    private workerService: WorkerService,
    private formBuilder: UntypedFormBuilder,
    private errorSummaryService: ErrorSummaryService,
    private router: Router,
    public backLinkService: BackLinkService,
  ) {}

  ngOnInit(): void {
    this.worker = this.route.snapshot.data.worker;
    this.workplace = this.route.snapshot.data.establishment;
    this.longTermAbsenceReasons = this.route.snapshot.data.longTermAbsenceReasons;
    this.setupForm();
    this.setupFormErrorsMap();
    this.setReturnUrl();
    this.backLinkService.showBackLink();
  }

  ngAfterViewInit(): void {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public setReturnUrl(): void {
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnToTrainingAndQuals')
      ? ['/workplace', this.workplace.uid, 'training-and-qualifications-record', this.worker.uid, 'training']
      : ['/workplace', this.workplace.uid, 'staff-record', this.worker.uid, 'staff-record-summary'];
  }

  public setupForm = () => {
    const workerLongTermAbsence = this.worker.longTermAbsence;

    this.form = this.formBuilder.group(
      {
        longTermAbsence: new UntypedFormControl(workerLongTermAbsence, [this.radioButtonOrCheckboxRequired.bind(this)]),
      },
      {
        updateOn: 'submit',
      },
    );
  };

  private radioButtonOrCheckboxRequired(control: UntypedFormControl): { [key: string]: boolean } {
    if (control.value === null && !this.backAtWork) {
      return { radioButtonOrCheckboxRequired: true };
    } else {
      return null;
    }
  }

  private setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'longTermAbsence',
        type: [
          {
            name: 'radioButtonOrCheckboxRequired',
            message: 'Select a reason for their long-term absence',
          },
        ],
      },
    ];
  }

  public setBackAtWork(): void {
    this.form.patchValue({
      longTermAbsence: null,
    });
  }

  public resetBackAtWork(): void {
    this.backAtWork = false;
  }

  public onSubmit(): void {
    this.submitted = true;
    this.errorSummaryService.syncFormErrorsEvent.next(true);

    if (this.form.valid) {
      this.updateWorker();
    } else {
      this.errorSummaryService.scrollToErrorSummary();
    }
  }

  public generateProps() {
    const value = this.form.value.longTermAbsence;
    return { longTermAbsence: String(value) };
  }

  private updateWorker(): void {
    const props = this.generateProps();

    this.subscriptions.add(
      this.workerService.updateWorker(this.workplace.uid, this.worker.uid, props).subscribe(
        () => this.onSuccess(),
        (error) => this.onError(error),
      ),
    );
  }

  private onSuccess(): void {
    this.router.navigate(this.returnUrl);
  }

  private onError(error): void {
    console.error(error);
  }

  public getFirstErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }
}
