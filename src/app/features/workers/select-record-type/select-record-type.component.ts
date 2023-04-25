import { Location } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { Establishment } from '@core/model/establishment.model';
import { SelectRecordTypes, Worker } from '@core/model/worker.model';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { TrainingService } from '@core/services/training.service';
import { WorkerService } from '@core/services/worker.service';

@Component({
  selector: 'app-select-record-type',
  templateUrl: './select-record-type.component.html',
})
export class SelectRecordTypeComponent implements OnInit, AfterViewInit {
  @ViewChild('formEl') formEl: ElementRef;
  public worker: Worker;
  public workplace: Establishment;
  public trainingOrQualificationPreviouslySelected: string;
  constructor(
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: UntypedFormBuilder,
    protected route: ActivatedRoute,
    private workerService: WorkerService,
    protected router: Router,
    private location: Location,
    public backLinkService: BackLinkService,
    private trainingService: TrainingService,
  ) {}
  public formErrorsMap: ErrorDetails[];
  public form: UntypedFormGroup;
  public url: string;
  public selectRecordTypes: SelectRecordTypes[];
  public submitted = false;
  public serverError: string;
  public establishmentuid: string;
  public workerId: string;
  public navigateUrl: string;

  ngOnInit(): void {
    this.trainingOrQualificationPreviouslySelected = this.trainingService.trainingOrQualificationPreviouslySelected;
    this.worker = this.workerService.worker;
    this.route.params.subscribe((params) => {
      if (params) {
        this.establishmentuid = params.establishmentuid;
        this.workerId = params.id;
      }
    });

    this.selectRecordTypes = [SelectRecordTypes.Training, SelectRecordTypes.Qualification];
    this.setupForm();
    this.setupFormErrorsMap();

    this.setBackLink();
    if (this.trainingOrQualificationPreviouslySelected) {
      this.prefill(this.getPrefillValue());
    }
  }

  private setupForm(): void {
    this.form = this.formBuilder.group(
      {
        selectRecordType: [null, Validators.required],
      },
      { updateOn: 'submit' },
    );
  }

  private setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'selectRecordType',
        type: [
          {
            name: 'required',
            message: 'Select the type of record',
          },
        ],
      },
    ];
  }

  public getFirstErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  public onSubmit(): void {
    this.submitted = true;
    this.errorSummaryService.syncFormErrorsEvent.next(true);
    if (this.form.valid) {
      this.addRecord();
    } else if (this.form.invalid) {
      this.errorSummaryService.scrollToErrorSummary();
      return;
    }
  }

  public setBackLink(): void {
    this.backLinkService.showBackLink();
  }

  private getPrefillValue(): string {
    if (this.trainingOrQualificationPreviouslySelected === 'training') {
      return SelectRecordTypes.Training;
    } else if (this.trainingOrQualificationPreviouslySelected === 'qualification') {
      return SelectRecordTypes.Qualification;
    }
  }

  private prefill(recordType): void {
    this.form.patchValue({
      selectRecordType: recordType,
    });
  }

  public addRecord(): void {
    if (this.form.value.selectRecordType === 'Qualification') {
      this.navigateUrl = `workplace/${this.establishmentuid}/training-and-qualifications-record/${this.workerId}/add-qualification`;
    } else if (this.form.value.selectRecordType === 'Training course') {
      this.navigateUrl = `workplace/${this.establishmentuid}/training-and-qualifications-record/${this.workerId}/add-training`;
    }
    if (this.navigateUrl && this.form.value.selectRecordType !== null) {
      this.router.navigate([this.navigateUrl]);
      this.route.fragment.subscribe((fragment: string) => {
        if (fragment && fragment === 'error-summary-title') {
          // This will give you current location path without including hash
          const pathWithoutHash = this.location.path(false);
          this.workerService.getRoute$.next(pathWithoutHash);
        } else {
          this.workerService.getRoute$.next(this.router.url);
        }
      });
    }
  }

  public onCancel(): void {
    this.router.navigate([
      '/workplace',
      this.establishmentuid,
      'training-and-qualifications-record',
      this.workerId,
      'training',
    ]);
  }

  ngAfterViewInit() {
    this.errorSummaryService.formEl$.next(this.formEl);
  }
}
