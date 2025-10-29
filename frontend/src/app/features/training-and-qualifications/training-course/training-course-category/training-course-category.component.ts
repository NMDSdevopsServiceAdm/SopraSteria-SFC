import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { Establishment } from '@core/model/establishment.model';
import { TrainingCategory, TrainingCategorySortedByGroup } from '@core/model/training.model';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { TrainingCourseService } from '@core/services/training-course.service';
import { TrainingCategoryService } from '../../../../core/services/training-category.service';
import { AlertService } from '@core/services/alert.service';

type JourneyType = 'Add' | 'Edit';

@Component({
  selector: 'app-training-course-category',
  templateUrl: './training-course-category.component.html',
})
export class TrainingCourseCategoryComponent implements OnInit {
  @ViewChild('formEl') formEl: ElementRef;

  public form: UntypedFormGroup;
  public formErrorsMap: Array<ErrorDetails>;
  public submitted: boolean = false;
  public workplace: Establishment;
  public isAddingNewTrainingCourse: boolean;
  public journeyType: JourneyType;
  public trainingCourseName: string;

  public requiredErrorMessage: string = 'Select the training course category';

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
    protected trainingCategoryService: TrainingCategoryService,
  ) {}

  ngOnInit(): void {
    this.workplace = this.route.parent.snapshot.data.establishment;

    this.determineJourneyType();
    this.getCategories();
    this.trainingCourseName =
      this.trainingCourseService?.newTrainingCourseToBeAdded?.name ?? 'temp training course name';

    this.setupForm();
    this.setupFormErrorsMap();
    this.prefill();
    this.backLinkService.showBackLink();
  }

  private determineJourneyType() {
    this.journeyType = this.route.snapshot?.data?.journeyType ?? 'Add';

    if (this.journeyType === 'Add' && !this.trainingCourseService.newTrainingCourseToBeAdded) {
      this.router.navigate(['..', 'details'], { relativeTo: this.route });
    }
  }

  private getCategories(): void {
    this.categories = this.route.snapshot.data.trainingCategories;
    this.trainingGroups = this.trainingCategoryService.sortTrainingCategoryByGroups(this.categories);
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
      this.prefillFromLocalData();
    }
  }

  private prefillFromLocalData() {
    this.trainingCourseName = this.trainingCourseService?.newTrainingCourseToBeAdded?.name;
  }

  public onSubmit(): void {
    this.submitted = true;

    if (!this.form.valid) {
      this.errorSummaryService.scrollToErrorSummary();
      return;
    }

    if (this.journeyType === 'Add') {
      this.createNewTrainingCourseAndReturn();
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
}
