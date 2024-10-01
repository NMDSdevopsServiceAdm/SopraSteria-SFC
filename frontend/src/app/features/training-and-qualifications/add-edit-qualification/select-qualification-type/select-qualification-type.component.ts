import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { Worker } from '@core/model/worker.model';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { QualificationService } from '@core/services/qualification.service';
import { WorkerService } from '@core/services/worker.service';

@Component({
  selector: 'app-select-qualification-type',
  templateUrl: './select-qualification-type.component.html',
  styleUrls: ['./select-qualification-type.component.scss'],
})
export class SelectQualificationTypeComponent implements OnInit, OnDestroy {
  @ViewChild('formEl') formEl: ElementRef;
  public form: FormGroup;
  public submitted: boolean = false;
  public title: string;
  public section: string;
  public submitButtonText: string;
  public worker: Worker;
  public establishmentUid: string;
  public workerId: any;
  public formErrorsMap: Array<ErrorDetails>;

  ngOnInit(): void {
    this.worker = this.workerService.worker;
    this.setTitle();
    this.setSectionHeading();
    this.setButtonText();
    // this.setBackLink();
    // this.getCategories();
    // this.setupForm();
    // this.prefillForm();
    // this.setupFormErrorsMap();
    // this.route.params.subscribe((params) => {
    //   if (params) {
    //     this.establishmentUid = params.establishmentuid;
    //     this.workerId = params.id;
    //   }
    // });
  }

  constructor(
    protected formBuilder: FormBuilder,
    protected qualificationService: QualificationService,
    protected router: Router,
    protected backLinkService: BackLinkService,
    protected workerService: WorkerService,
    protected route: ActivatedRoute,
    protected errorSummaryService: ErrorSummaryService,
  ) {}

  protected setTitle(): void {
    this.title = 'Select the type of qualification you want to add';
  }

  protected setSectionHeading(): void {
    this.section = this.worker.nameOrId;
  }
  protected setButtonText(): void {
    const accessedFromSummary = false; // this.route.snapshot.parent.url[0].path.includes('confirm-training');
    this.submitButtonText = accessedFromSummary ? 'Save and return' : 'Continue';
  }

  public onCancel(event: Event) {
    event.preventDefault();
    // this.trainingService.clearSelectedTrainingCategory();
    // this.router.navigate(['/dashboard'], { fragment: 'training-and-qualifications' });
  }

  ngOnDestroy(): void {}
}
