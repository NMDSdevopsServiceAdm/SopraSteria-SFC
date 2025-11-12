import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DATE_PARSE_FORMAT } from '@core/constants/constants';
import { Establishment } from '@core/model/establishment.model';
import { Worker } from '@core/model/worker.model';
import { AlertService } from '@core/services/alert.service';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { TrainingService } from '@core/services/training.service';
import { WorkerService } from '@core/services/worker.service';
import dayjs from 'dayjs';

@Component({
  selector: 'app-training-course-matching-layout',
  templateUrl: './training-course-matching-layout.component.html',
})
export class TrainingCourseMatchingLayoutComponent implements OnInit {
  @ViewChild('formEl') formEl: ElementRef;
  public form: UntypedFormGroup;
  public workplace: Establishment;
  public worker: Worker;
  public submitted = false;
  public submitButtonDisabled: boolean = false;
  public buttonText: string;
  public notesOpen = false;
  public notesMaxLength = 1000;
  public remainingCharacterCount: number = this.notesMaxLength;
  public notesValue = '';
  public multipleTrainingDetails: boolean;
  public trainingRecord: any;
  public expiryMismatchWarning: any;
  private _filesToUpload: File[];

  constructor(
    private workerService: WorkerService,
    private establishmentService: EstablishmentService,
    protected formBuilder: UntypedFormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    protected errorSummaryService: ErrorSummaryService,
    protected backLinkService: BackLinkService,
    public trainingService: TrainingService,
    private alertService: AlertService,
  ) {}

  ngOnInit(): void {
    this.trainingRecord = this.route.snapshot.data.trainingRecord;
    console.log(this.trainingRecord);

    this.worker = this.workerService.worker;
    this.workplace = this.establishmentService.establishment;
    this.setupForm();
    this.fillForm();
    this.checkExpiryMismatch();
    this.setBackLink();
  }

  private setupForm(): void {
    this.form = this.formBuilder.group(
      {
        completed: this.formBuilder.group({
          day: null,
          month: null,
          year: null,
        }),
        expires: this.formBuilder.group({
          day: null,
          month: null,
          year: null,
        }),
        notes: [null, Validators.maxLength(this.notesMaxLength)],
      },
      { updateOn: 'submit' },
    );
  }

  private fillForm(): void {
    const { completed, expires, notes } = this.trainingRecord;

    this.form.patchValue({
      completed: this.toFormDate(this.parseDate(completed)),
      expires: this.toFormDate(this.parseDate(expires)),
      notes,
    });
    if (this.trainingRecord?.notes?.length > 0) {
      this.notesOpen = true;
      this.remainingCharacterCount = this.notesMaxLength - this.trainingRecord.notes.length;
    }
  }

  private parseDate(dateString?: string): dayjs.Dayjs | null {
    return dateString ? dayjs(dateString, DATE_PARSE_FORMAT) : null;
  }

  private toFormDate(date: dayjs.Dayjs | null): { day: number; month: number; year: number } | null {
    return date ? { day: date.date(), month: date.month() + 1, year: date.year() } : null;
  }

  private checkExpiryMismatch(): void {
    const { completed, expires, validityPeriodInMonth } = this.trainingRecord;

    if (!completed || !expires || !validityPeriodInMonth) return;

    const completedDate = dayjs(completed, DATE_PARSE_FORMAT);
    const expiresDate = dayjs(expires, DATE_PARSE_FORMAT);
    const expectedExpiry = completedDate.add(validityPeriodInMonth, 'month');

    this.expiryMismatchWarning = !expiresDate.isSame(expectedExpiry, 'day');
  }

  public onSubmit(): void {
    this.submitted = true;
    this.onSubmitSuccess();
  }

  private onSubmitSuccess(): void {
    this.router.navigate(['/dashboard'], { fragment: 'home' }).then(() => {
      this.alertService.addAlert({
        type: 'success',
        message: 'Training record updated',
      });
    });
  }

  public setBackLink(): void {
    this.backLinkService.showBackLink();
  }

  public onCancel(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/dashboard'], { fragment: 'home' });
  }
  public handleOnInput(event: Event) {
    this.notesValue = (<HTMLInputElement>event.target).value;
    this.remainingCharacterCount = this.notesMaxLength - this.notesValue.length;
  }
  public toggleNotesOpen(): void {
    this.notesOpen = !this.notesOpen;
  }
}
