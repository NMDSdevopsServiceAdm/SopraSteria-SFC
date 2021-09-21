import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { Establishment } from '@core/model/establishment.model';
import { URLStructure } from '@core/model/url.model';
import { Worker } from '@core/model/worker.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { WorkerService } from '@core/services/worker.service';

@Component({
  selector: 'app-long-term-absence',
  templateUrl: './long-term-absence.component.html',
})
export class LongTermAbsenceComponent implements OnInit {
  @ViewChild('formEl') formEl: ElementRef;
  public worker: Worker;
  public returnUrl: URLStructure;
  public form: FormGroup;
  public submitted: boolean;
  public longTermAbsenceReasons = [];
  public backAtWork = false;
  private formErrorsMap: Array<ErrorDetails>;
  private workplace: Establishment;

  constructor(
    private route: ActivatedRoute,
    private backService: BackService,
    private workerService: WorkerService,
    private formBuilder: FormBuilder,
    private errorSummaryService: ErrorSummaryService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.worker = this.route.snapshot.data.worker;
    this.workplace = this.route.snapshot.data.establishment;
    this.returnUrl = this.workerService.returnTo ? this.workerService.returnTo : { url: ['/dashboard'] };
    this.longTermAbsenceReasons = ['Maternity leave', 'Paternity leave', 'Illness', 'Injury', 'Other'];
    this.setupForm();
    this.setupFormErrorsMap();
    this.setBackLink();
  }

  ngAfterViewInit(): void {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  public setupForm = () => {
    // this.worker.longTermAbsence = 'Illness';
    const workerLongTermAbsence = this.worker.longTermAbsence;

    this.form = this.formBuilder.group({
      longTermAbsence: new FormControl(workerLongTermAbsence, [this.radioButtonOrCheckboxRequired.bind(this)]),
    });
  };

  private radioButtonOrCheckboxRequired(control: FormControl): { [key: string]: boolean } {
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

  public setBackLink(): void {
    this.backService.setBackLink(this.returnUrl);
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
      // update worker with long term absence
      // this.router.navigate(this.returnUrl.url);
    } else {
      this.errorSummaryService.scrollToErrorSummary();
    }
  }

  public getFirstErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }
}
