import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { Establishment } from '@core/model/establishment.model';
import { QualificationRequest, QualificationResponse, QualificationType } from '@core/model/qualification.model';
import { Worker } from '@core/model/worker.model';
import { BackService } from '@core/services/back.service';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { WorkerService } from '@core/services/worker.service';
import dayjs from 'dayjs';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-add-edit-qualification',
  templateUrl: './add-edit-qualification.component.html',
})
export class AddEditQualificationComponent implements OnInit, OnDestroy {
  public form: FormGroup;
  public qualificationTypes: QualificationType[] = [];
  public qualifications: any;
  public qualificationId: string;
  public record: QualificationResponse;
  public worker: Worker;
  public workplace: Establishment;
  public yearValidators: ValidatorFn[];
  public notesMaxLength = 500;
  public submitted = false;
  public formErrorsMap: Array<ErrorDetails>;
  private subscriptions: Subscription = new Subscription();
  public previousUrl: string;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private backService: BackService,
    private errorSummaryService: ErrorSummaryService,
    private workerService: WorkerService,
    protected backLinkService: BackLinkService,
  ) {
    this.yearValidators = [Validators.max(dayjs().year()), Validators.min(dayjs().subtract(100, 'years').year())];
  }

  async ngOnInit(): Promise<void> {
    this.form = this.formBuilder.group({
      type: [null, Validators.required],
    });

    this.worker = this.workerService.worker;
    this.workplace = this.route.parent.snapshot.data.establishment;
    this.qualificationId = this.route.snapshot.params.qualificationId;

    Object.keys(QualificationType).forEach((key) => {
      this.qualificationTypes[key] = QualificationType[key];
      this.form.addControl(key, this.createQualificationGroup());
    });

    this.subscriptions.add(
      this.workerService
        .getAvailableQualifcations(this.workplace.uid, this.worker.uid, QualificationType.Award)
        .subscribe(
          (qualifications) => {
            if (qualifications) {
              this.qualifications = qualifications;
            }
          },
          (error) => {
            console.error(error.error);
          },
        ),
    );

    if (this.qualificationId) {
      this.subscriptions.add(
        this.workerService.getQualification(this.workplace.uid, this.worker.uid, this.qualificationId).subscribe(
          (record) => {
            if (record) {
              this.record = record;
              const typeKey = Object.keys(this.qualificationTypes).find(
                (key) => this.qualificationTypes[key] === this.record.qualification.group,
              );

              this.form.patchValue({
                type: record.qualification.group,
              });

              this.form.get(typeKey).patchValue({
                qualification: this.record.qualification.id,
                year: this.record.year,
                notes: this.record.notes,
              });
            }
          },
          (error) => {
            console.error(error.error);
          },
        ),
      );
    }

    this.form.get('type').valueChanges.subscribe((value) => {
      this.submitted = false;
      Object.keys(QualificationType).forEach((key) => {
        const group = this.form.get(key) as FormGroup;
        const { qualification, year, notes } = group.controls;

        qualification.clearValidators();
        year.clearValidators();
        notes.clearValidators();

        if (value === QualificationType[key]) {
          qualification.setValidators([Validators.required]);
          year.setValidators(this.yearValidators);
          notes.setValidators([Validators.maxLength(this.notesMaxLength)]);
        }

        qualification.updateValueAndValidity();
        year.updateValueAndValidity();
        notes.updateValueAndValidity();
      });
    });

    this.setupFormErrorsMap();

    this.setBackLink();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'type',
        type: [
          {
            name: 'required',
            message: 'Select the qualification type',
          },
        ],
      },
    ];

    Object.keys(QualificationType).forEach((key) => {
      this.formErrorsMap.push(
        ...[
          {
            item: `${key}.qualification`,
            type: [
              {
                name: 'required',
                message: 'Select the qualification name',
              },
            ],
          },
          {
            item: `${key}.year`,
            type: [
              {
                name: 'min',
                message: 'Year achieved must be this year or fewer than 100 years in the past',
              },
              {
                name: 'max',
                message: 'Year achieved must be this year or fewer than 100 years in the past',
              },
            ],
          },
          {
            item: `${key}.notes`,
            type: [
              {
                name: 'maxlength',
                message: `Notes must be ${this.notesMaxLength} characters or fewer`,
              },
            ],
          },
        ],
      );
    });
  }

  private createQualificationGroup(): FormGroup {
    return this.formBuilder.group(
      {
        qualification: null,
        year: null,
        notes: null,
      },
      {
        updateOn: 'submit',
      },
    );
  }

  public getFirstErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  public onSubmit(): void {
    this.submitted = true;
    this.errorSummaryService.syncFormErrorsEvent.next(true);

    if (!this.form.valid) {
      this.errorSummaryService.scrollToErrorSummary();
      return;
    }

    const { type } = this.form.value;
    const typeKey = Object.keys(this.qualificationTypes).find((key) => this.qualificationTypes[key] === type);
    const group = this.form.get(typeKey) as FormGroup;
    const { qualification, year, notes } = group.value;

    const record: QualificationRequest = {
      type,
      qualification: {
        id: parseInt(qualification, 10),
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
          this.workerService.alert = { type: 'success', message: 'Qualification has been saved.' };
        } else {
          this.workerService.alert = { type: 'success', message: 'Qualification has been added.' };
        }
      });
  }

  private onError(error): void {
    console.log(error);
  }
  public navigateToPreviousPage(): void {
    this.router.navigate([this.previousUrl]);
  }

  protected setBackLink(): void {
    this.backLinkService.showBackLink();
  }
}
