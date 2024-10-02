import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { INT_PATTERN } from '@core/constants/constants';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { Establishment } from '@core/model/establishment.model';
import { QualificationRequest, QualificationResponse, QualificationType } from '@core/model/qualification.model';
import { Worker } from '@core/model/worker.model';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { TrainingService } from '@core/services/training.service';
import { WorkerService } from '@core/services/worker.service';
import dayjs from 'dayjs';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-add-edit-qualification',
  templateUrl: './add-edit-qualification.component.html',
})
export class AddEditQualificationComponent implements OnInit, OnDestroy {
  @ViewChild('formEl') formEl: ElementRef;
  public form: UntypedFormGroup;
  public qualificationTypes: QualificationType[] = [];
  public qualificationId: string;
  public buttonText: string;
  public record: QualificationResponse;
  public worker: Worker;
  public workplace: Establishment;
  public yearValidators: ValidatorFn[];
  public notesMaxLength = 500;
  public submitted = false;
  public formErrorsMap: Array<ErrorDetails>;
  private subscriptions: Subscription = new Subscription();
  public previousUrl: Array<string>;
  public notesValue = '';
  public remainingCharacterCount: number;
  public intPattern = INT_PATTERN.toString();
  public notesOpen = false;

  constructor(
    private trainingService: TrainingService,
    private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private errorSummaryService: ErrorSummaryService,
    private workerService: WorkerService,
    protected backLinkService: BackLinkService,
  ) {
    this.yearValidators = [Validators.max(dayjs().year()), Validators.min(dayjs().subtract(100, 'years').year())];
  }

  ngOnInit(): void {
    this.previousUrl = [localStorage.getItem('previousUrl')];
    this.trainingService.trainingOrQualificationPreviouslySelected = 'qualification';

    this.form = this.formBuilder.group({
      year: [null, this.yearValidators],
      notes: [null, Validators.maxLength(this.notesMaxLength)],
    });

    this.worker = this.workerService.worker;
    this.workplace = this.route.parent.snapshot.data.establishment;
    this.qualificationId = this.route.snapshot.params.qualificationId;

    this.buttonText = this.qualificationId ? 'Save and return' : 'Save record';
    this.remainingCharacterCount = this.notesMaxLength;
    this.intPattern = this.intPattern.substring(1, this.intPattern.length - 1);

    if (this.qualificationId) {
      this.subscriptions.add(
        this.workerService.getQualification(this.workplace.uid, this.worker.uid, this.qualificationId).subscribe(
          (record) => {
            if (record) {
              this.record = record;

              this.form.patchValue({
                year: this.record.year,
                notes: this.record.notes,
              });

              if (this.record.notes?.length > 0) {
                this.notesOpen = true;
                this.remainingCharacterCount = this.notesMaxLength - this.record.notes.length;
              }
            }
          },
          (error) => {
            console.error(error.error);
          },
        ),
      );
    }

    this.setupFormErrorsMap();
    this.setBackLink();
  }

  protected navigateToPreviousPage(): void {
    this.router.navigate(this.previousUrl);
  }

  private setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'year',
        type: [
          {
            name: 'min',
            message: 'Year achieved must be this year or no more than 100 years ago',
          },
          {
            name: 'max',
            message: 'Year achieved must be this year or no more than 100 years ago',
          },
        ],
      },
      {
        item: 'notes',
        type: [
          {
            name: 'maxlength',
            message: `Notes must be ${this.notesMaxLength} characters or fewer`,
          },
        ],
      },
    ];
  }

  public handleOnInput(event: Event): void {
    this.notesValue = (<HTMLInputElement>event.target).value;
    this.remainingCharacterCount = this.notesMaxLength - this.notesValue.length;
  }

  public getFirstErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  public onSubmit(): void {
    this.submitted = true;
    this.errorSummaryService.syncFormErrorsEvent.next(true);
    this.addErrorLinkFunctionality();

    if (!this.form.valid) {
      if (this.form.controls.notes?.errors?.maxlength) {
        this.notesOpen = true;
      }
      this.errorSummaryService.scrollToErrorSummary();
      return;
    }

    const { year, notes } = this.form.value;
    const qualification = '12';

    const record: QualificationRequest = {
      type: this.record ? (this.record.qualification.group as QualificationType) : QualificationType.Certificate,
      qualification: {
        id: this.record ? this.record.qualification.id : parseInt(qualification, 10),
      },
      year,
      notes,
    };

    if (this.qualificationId) {
      this.subscriptions.add(
        this.workerService
          .updateQualification(this.workplace.uid, this.worker.uid, this.qualificationId, record)
          .subscribe(
            () => this.onSuccess(),
            (error) => this.onError(error),
          ),
      );
    } else {
      this.subscriptions.add(
        this.workerService.createQualification(this.workplace.uid, this.worker.uid, record).subscribe(
          () => this.onSuccess(),
          (error) => this.onError(error),
        ),
      );
    }
  }

  private onSuccess(): void {
    this.router
      .navigate([`/workplace/${this.workplace.uid}/training-and-qualifications-record/${this.worker.uid}/training`])
      .then(() => {
        if (this.qualificationId) {
          this.workerService.alert = { type: 'success', message: 'Qualification record saved' };
        } else {
          this.workerService.alert = { type: 'success', message: 'Qualification record added' };
        }
      });
  }

  private onError(error): void {
    console.log(error);
  }

  public toggleNotesOpen(): void {
    this.notesOpen = !this.notesOpen;
  }

  protected navigateToDeleteQualificationRecord(): void {
    this.router.navigate([
      '/workplace',
      this.workplace.uid,
      'training-and-qualifications-record',
      this.worker.uid,
      'qualification',
      this.qualificationId,
      'delete',
    ]);
  }

  private addErrorLinkFunctionality(): void {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  protected setBackLink(): void {
    this.backLinkService.showBackLink();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
