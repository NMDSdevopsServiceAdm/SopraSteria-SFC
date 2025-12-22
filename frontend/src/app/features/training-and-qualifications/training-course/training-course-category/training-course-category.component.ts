import { Component, ElementRef, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { Establishment } from '@core/model/establishment.model';
import { TrainingCategory, TrainingCategorySortedByGroup } from '@core/model/training.model';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { TrainingCourseService } from '@core/services/training-course.service';
import { TrainingCategoryService } from '@core/services/training-category.service';
import { AlertService } from '@core/services/alert.service';

type JourneyType = 'Add' | 'Edit';

@Component({
  selector: 'app-training-course-category',
  templateUrl: './training-course-category.component.html',
})
export class TrainingCourseCategoryComponent implements OnInit, AfterViewInit {
  @ViewChild('formEl') formEl: ElementRef;

  public form: UntypedFormGroup;
  public formErrorsMap: Array<ErrorDetails>;
  public submitted: boolean = false;
  public workplace: Establishment;
  public isAddingNewTrainingCourse: boolean;
  public journeyType: JourneyType;
  public trainingCourseName: string;

  public requiredErrorMessage: string = 'Select the training course category';
  public sectionHeading: string;
  public ctaButtonText: string;

  public trainingGroups: TrainingCategorySortedByGroup;
  public categories: TrainingCategory[];
  public otherCategory: TrainingCategory;
  public preFilledId: number;

  constructor(
    protected formBuilder: UntypedFormBuilder,
    protected route: ActivatedRoute,
    protected router: Router,
    protected alertService: AlertService,
    protected backLinkService: BackLinkService,
    protected errorSummaryService: ErrorSummaryService,
    protected trainingCourseService: TrainingCourseService,
  ) {}

  ngOnInit(): void {
    this.workplace = this.route.parent.snapshot.data.establishment;
    this.determineJourneyType();
    this.setText();
    this.getCategories();
    this.setupForm();
    this.setupFormErrorsMap();
    this.prefill();
    this.backLinkService.showBackLink();
  }

  ngAfterViewInit(): void {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  private determineJourneyType() {
    this.journeyType = this.route.snapshot?.data?.journeyType ?? 'Add';
  }

  private setText() {
    switch (this.journeyType) {
      case 'Add': {
        this.sectionHeading = 'Add a training course';
        this.ctaButtonText = 'Save training course';
        break;
      }
      case 'Edit': {
        this.sectionHeading = 'Training and qualifications';
        this.ctaButtonText = 'Continue';
        break;
      }
    }
  }

  private getCategories(): void {
    this.categories = this.route.snapshot.data.trainingCategories;
    this.trainingGroups = TrainingCategoryService.sortTrainingCategoryByGroups(this.categories);
    this.otherCategory = this.categories.find((category) => category.trainingCategoryGroup === null);
  }

  private setupForm(): void {
    this.form = this.formBuilder.group(
      {
        category: [null, Validators.required],
      },
      { updateOn: 'submit' },
    );
  }

  private setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'category',
        type: [
          {
            name: 'required',
            message: this.requiredErrorMessage,
          },
        ],
      },
    ];
  }

  private prefill(): void {
    if (this.journeyType === 'Add' && this.trainingCourseService.newTrainingCourseToBeAdded) {
      this.trainingCourseName = this.trainingCourseService?.newTrainingCourseToBeAdded?.name;
      return;
    }
    if (this.journeyType === 'Edit' && this.trainingCourseService.trainingCourseToBeUpdated) {
      const trainingCourse = this.trainingCourseService.trainingCourseToBeUpdated;
      this.trainingCourseName = trainingCourse.name;
      this.preFilledId = trainingCourse.trainingCategoryId;
      this.form.patchValue({ category: trainingCourse.trainingCategoryId });
      return;
    }

    // if could not find the data to prefill
    this.router.navigate(['../details'], { relativeTo: this.route });
  }

  public onSubmit(): void {
    this.submitted = true;

    if (!this.form.valid) {
      this.errorSummaryService.scrollToErrorSummary();
      return;
    }

    if (this.journeyType === 'Add') {
      this.createNewTrainingCourseAndReturn();
    } else if (this.journeyType === 'Edit') {
      this.updateCategoryAndReturn();
    }
  }

  private createNewTrainingCourseAndReturn(): void {
    const trainingCategoryId = this.form.get('category').value;
    const trainingCourseData = { ...this.trainingCourseService.newTrainingCourseToBeAdded, trainingCategoryId };

    this.trainingCourseService.createTrainingCourse(this.workplace.uid, trainingCourseData).subscribe(() => {
      this.router
        .navigate(['workplace', this.workplace.uid, 'training-course', 'add-and-manage-training-courses'])
        .then(() => this.alertService.addAlert({ type: 'success', message: 'Training course added' }));
    });
  }

  private updateCategoryAndReturn(): void {
    const trainingCategoryId = this.form.get('category').value;

    const updatedTrainingCourse = {
      ...this.trainingCourseService.trainingCourseToBeUpdated,
      trainingCategoryId,
    };

    this.trainingCourseService.trainingCourseToBeUpdated = updatedTrainingCourse;
    this.router.navigate(['../details'], { relativeTo: this.route });
  }
}
