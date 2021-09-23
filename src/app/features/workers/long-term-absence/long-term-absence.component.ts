import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
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
  public returnToUrl: URLStructure;
  public form: FormGroup;
  public submitted: boolean;
  public longTermAbsenceReasons = [];
  private formErrorsMap: Array<ErrorDetails>;
  private workplace: Establishment;

  constructor(
    private route: ActivatedRoute,
    private backService: BackService,
    private workerService: WorkerService,
    private formBuilder: FormBuilder,
    private errorSummaryService: ErrorSummaryService,
  ) {}

  ngOnInit(): void {
    this.worker = this.route.snapshot.data.worker;
    this.workplace = this.route.snapshot.data.establishment;
    this.returnToUrl = this.workerService.returnTo;
    this.longTermAbsenceReasons = ['Maternity leave', 'Paternity leave', 'Illness', 'Injury', 'Other'];
    this.setupForm();
    this.setBackLink();
  }

  ngAfterViewInit(): void {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  private setupForm = () => {
    this.form = this.formBuilder.group({
      longTermAbsence: [null, Validators.required],
    });
  };

  public setBackLink(): void {
    this.backService.setBackLink(this.returnToUrl);
  }

  public onSubmit(): void {
    this.submitted = true;
    console.log('submitted');
  }
}
