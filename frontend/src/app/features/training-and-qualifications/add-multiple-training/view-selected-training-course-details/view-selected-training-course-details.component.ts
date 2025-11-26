import { ActivatedRoute, Router } from '@angular/router';
import { BackLinkService } from '@core/services/backLink.service';
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { DateValidator } from '@shared/validators/date.validator';
import dayjs from 'dayjs';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { ErrorSummaryService} from '@core/services/error-summary.service';
import { Establishment } from '@core/model/establishment.model';
import { TrainingService } from '@core/services/training.service';
import { TrainingCourse } from '@core/model/training-course.model';
import { TrainingCategory } from '@core/model/training.model';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-view-selected-training-course-details',
  templateUrl: './view-selected-training-course-details.component.html',
  styleUrl: './view-selected-training-course-details.component.scss',
})

export class ViewSelectedTrainingCourseDetailsComponent implements OnInit {
  @ViewChild('formEl') formEl: ElementRef;
  public courseCompletionDateDay: number;
  public courseCompletionDateMonth: number;
  public courseCompletionDateYear: number;
  public courseCompletionDate: Date;
  public expires: Date;
  public form: UntypedFormGroup;
  public formErrorsMap: Array<ErrorDetails>;
  public notesMaxLength = 1000;
  public notesOpen = false;
  public notesValue: string;
  public remainingCharacterCount: number = this.notesMaxLength;
  public submitted :boolean = false;
  public trainingCategoryId: number;
  public trainingCourse: TrainingCourse;
  public trainingCategory: TrainingCategory;
  public workplace: Establishment;

  constructor(
    private backLinkService: BackLinkService,
    private errorSummaryService: ErrorSummaryService,
    private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private trainingService: TrainingService,
  ) {}

  ngOnInit(): void {
    this.setBackLink();
    this.workplace = this.route.snapshot.data.establishment;
    this.trainingCourse = this.trainingService.getSelectedTrainingCourse();
    this.courseCompletionDate = this.trainingService.getCourseCompletionDate();
    this.courseCompletionDateDay = this.courseCompletionDate?.getDate() ?? null;
    this.courseCompletionDateMonth = this.courseCompletionDate?.getMonth() ?? null;
    this.courseCompletionDateYear = this.courseCompletionDate?.getFullYear() ?? null;
    this.notesValue = this.trainingService.getNotes();
    this.setupForm();
    this.setupFormErrorsMap();

    if (!this.trainingCourse) {
      this.router.navigate([
        `workplace/${this.workplace.uid}/add-multiple-training/select-staff`,
      ]);
      return;
    }

    if (this.courseCompletionDateMonth != null ) {
      this.courseCompletionDateMonth ++;
    }

    this.form.patchValue({
      courseCompletionDate: {
        day: this.courseCompletionDateDay,
        month: this.courseCompletionDateMonth,
        year: this.courseCompletionDateYear,
      },
      notes: this.notesValue,
    });

    if (this.notesValue != null) {
      this.notesOpen = true;
      this.remainingCharacterCount = this.notesMaxLength - this.notesValue.length;
    }
  }

  ngAfterViewInit(): void {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  private setBackLink(): void {
    this.backLinkService.showBackLink();
  }

  public onSubmit(): void {
    this.submitted = true;
    this.notesValue = this.form.get('notes').value;

    if (!this.form.valid) {
      if (this.form.controls.notes?.errors?.maxlength) {
        this.notesOpen = true;
      }
      this.errorSummaryService.scrollToErrorSummary();
      return;
    }

    if ( this.form.value.courseCompletionDate.day != null &&
      this.form.value.courseCompletionDate.month != null &&
      this.form.value.courseCompletionDate.year != null) {
      this.callTrainingServiceWithCourseCompletionDate();
    }

    if (this.notesValue != '') {
      this.trainingService.setNotes(this.notesValue);
    }

    // to be updated when next page is developed
    this.router.navigate(['/']);
  }

  private setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'courseCompletionDate',
        type: [
          {
            name: 'dateValid',
            message: 'Course completion date must be a valid date',
          },
          {
            name: 'todayOrBefore',
            message: `Course completion date must be before ${this.dateTomorrow()}`,
          },
          {
            name: 'dateMin',
            message: 'Course completion date cannot be more than 100 years ago',
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

  private dateTomorrow(): string {
    const today = dayjs();
    return today.add(1, 'day').format('DD MM YYYY');
  }

  public getFirstErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  public toggleNotesOpen(): void {
    this.notesOpen = !this.notesOpen;
  }

  public handleOnInput(event: Event) {
    this.notesValue = (<HTMLInputElement>event.target).value;
    this.remainingCharacterCount = this.notesMaxLength - this.notesValue.length;
  }

  private setupForm(): void {
    this.form = this.formBuilder.group({
      courseCompletionDate: this.formBuilder.group({
        day: null,
        month: null,
        year: null,
      }),
      notes: [null, Validators.maxLength(this.notesMaxLength)],
    },{ updateOn: 'submit'}
  );

    const minDate = dayjs().subtract(100, 'years');

    this.form
      .get('courseCompletionDate')
      .setValidators([DateValidator.dateValid(), DateValidator.todayOrBefore(), DateValidator.min(minDate)]);
  }

  private callTrainingServiceWithCourseCompletionDate(): void {
    const day = this.form.value.courseCompletionDate.day
    const month = this.form.value.courseCompletionDate.month
    const year = this.form.value.courseCompletionDate.year

    this.trainingService.setCourseCompletionDate(new Date(`${year}-${month}-${day}`));
  }
}
