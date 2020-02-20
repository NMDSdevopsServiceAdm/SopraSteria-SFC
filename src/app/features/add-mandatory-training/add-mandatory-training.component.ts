import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { Establishment, jobOptionsEnum, UpdateJobsRequest } from '@core/model/establishment.model';
import { Job } from '@core/model/job.model';
import { TrainingCategory } from '@core/model/training.model';
import { URLStructure } from '@core/model/url.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { JobService } from '@core/services/job.service';
import { TrainingService } from '@core/services/training.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/internal/operators/take';

@Component({
  selector: 'app-add-mandatory-training',
  templateUrl: './add-mandatory-training.component.html',
})
export class AddMandatoryTrainingComponent implements OnInit {
  public form: FormGroup;
  public submitted = false;
  public categories: TrainingCategory[];
  private subscriptions: Subscription = new Subscription();
  public jobs: Job[] = [];
  public trainings: TrainingCategory[] = [];
  public establishment: Establishment;
  public primaryWorkplace: Establishment;
  public formErrorsMap: Array<ErrorDetails> = [];
  public serverError: string;
  public serverErrorsMap: Array<ErrorDefinition> = [];
  public return: URLStructure;
  public vacanciesOptions = [
    {
      label: 'For all job roles',
      value: jobOptionsEnum.ALL,
    },
    {
      label: `For selected job roles only.`,
      value: jobOptionsEnum.SELECTED,
    },
  ];

  constructor(
    private breadcrumbService: BreadcrumbService,
    private trainingService: TrainingService,
    protected formBuilder: FormBuilder,
    protected errorSummaryService: ErrorSummaryService,
    protected establishmentService: EstablishmentService,
    private jobService: JobService
  ) {}

  get categoriesArray(): FormArray {
    return this.form.get('categories') as FormArray;
  }

  get allTrainingsSelected(): boolean {
    return this.categoriesArray.length >= this.trainings.length;
  }

  /*get vacanciesArray(): FormArray {
    return this.form.get('vacancies') as FormArray;
  } */
  isAllJobsSelected(index): boolean {
    /* const vacanciesArray = <FormArray>(<FormGroup>this.categoriesArray.controls[index]).controls.vacancies;
    if (vacanciesArray) {
      return vacanciesArray.length >= this.jobs.length;
    }*/
    return false;
  }

  ngOnInit(): void {
    this.breadcrumbService.show(JourneyType.MANDATORY_TRAINING);
    this.return = { url: ['/dashboard'], fragment: 'staff-training-and-qualifications' };
    this.getTrainings();
    this.getJobs();
    this.setupForm();
    this.prefill();

    this.subscriptions.add(
      this.establishmentService.establishment$.subscribe(establishment => {
        this.establishment = establishment;
        this.primaryWorkplace = this.establishmentService.primaryWorkplace;
      })
    );

    //for job role
    // this.subscriptions.add(
    // this.vacanciesArray.valueChanges.subscribe(() => {
    // this.vacanciesArray.controls[0].get('jobRole').setValidators([Validators.required]);
    // })
    // );
    //training category
    this.subscriptions.add(
      this.categoriesArray.valueChanges.subscribe(() => {
        this.categoriesArray.controls[0].get('trainingCategory').setValidators([Validators.required]);
      })
    );
  }

  private setupForm(): void {
    this.form = this.formBuilder.group({
      categories: this.formBuilder.array([]),
    });
  }
  private getJobs(): void {
    this.subscriptions.add(
      this.jobService
        .getJobs()
        .pipe(take(1))
        .subscribe(jobs => (this.jobs = jobs))
    );
  }

  private getTrainings(): void {
    this.subscriptions.add(
      this.trainingService
        .getCategories()
        .pipe(take(1))
        .subscribe(trainings => (this.trainings = trainings))
    );
  }

  private prefill(): void {
    /*if(Array.isArray(this.establishment.vacancies) && this.establishment.vacancies.length) {
      this.establishment.vacancies.forEach(vacancy =>
        this.vacanciesArray.push(this.createVacancyControl(vacancy.jobId))
      );
    } else {
      this.vacanciesArray.push(this.createVacancyControl());
    }*/
    this.categoriesArray.push(this.createCategoryControl());
    // this.vacanciesArray.push(this.createVacancyControl());
  }

  protected setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'categories.trainingCategory',
        type: [
          {
            name: 'required',
            message: 'Training category is required',
          },
        ],
      },
      {
        item: 'categories.vacancyType',
        type: [
          {
            name: 'required',
            message: 'required',
          },
        ],
      },
      {
        item: 'vacancies.jobRole',
        type: [
          {
            name: 'required',
            message: 'Job Role is required',
          },
        ],
      },
    ];
  }

  public selectableJobs(categoryIndex, jobIndex): Job[] {
    const vacanciesArray = <FormArray>(<FormGroup>this.categoriesArray.controls[categoryIndex]).controls.vacancies;
    return this.jobs.filter(
      job =>
        !vacanciesArray.controls.some(
          vacancy =>
            vacancy !== vacanciesArray.controls[jobIndex] && parseInt(vacancy.get('jobRole').value, 10) === job.id
        )
    );
  }

  public selectableTrainings(index): TrainingCategory[] {
    return this.trainings.filter(
      training =>
        !this.categoriesArray.controls.some(
          category =>
            category !== this.categoriesArray.controls[index] &&
            parseInt(category.get('trainingCategory').value, 10) === training.id
        )
    );
  }

  public addCategory(): void {
    this.categoriesArray.push(this.createCategoryControl());
  }

  public removeCategory(event: Event, index): void {
    event.preventDefault();
    this.categoriesArray.removeAt(index);
  }

  private createCategoryControl(trainingId = null, vType = 'All'): FormGroup {
    return this.formBuilder.group({
      trainingCategory: [trainingId, [Validators.required]],
      vacancyType: [vType, [Validators.required]],
      vacancies: this.formBuilder.array([]),
    });
  }

  public addVacancy(index): void {
    (<FormArray>(<FormGroup>this.categoriesArray.controls[index]).controls.vacancies).push(this.createVacancyControl());
  }

  public removeVacancy(event: Event, categoryIndex, jobIndex): void {
    event.preventDefault();
    const vacanciesArray = <FormArray>(<FormGroup>this.categoriesArray.controls[categoryIndex]).controls.vacancies;
    vacanciesArray.removeAt(jobIndex);
  }

  private createVacancyControl(jobId = null, total = null): FormGroup {
    return this.formBuilder.group({
      jobRole: [jobId, [Validators.required]],
    });
  }

  protected generateUpdateProps(): UpdateJobsRequest {
    if (this.categoriesArray.length) {
      return {
        categories: this.categoriesArray.value.map(category => ({
          trainingId: parseInt(category.trainingCategory, 10),
          vacancyType: category.vacancyType,
        })),
      };
    }
    return null;
  }

  protected updateEstablishment(props: UpdateJobsRequest): void {
    this.subscriptions.add(
      this.establishmentService.updateJobs(this.establishment.uid, props).subscribe(
        data => console.log(data),
        error => console.log(error)
      )
    );
  }

  public getFormErrorMessage(item: string, errorType: string): string {
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  private clearValidators(index: number) {
    this.categoriesArray.controls[index].get('trainingCategory').clearValidators();
    // this.vacanciesArray.controls[index].get('jobRole').clearValidators();
  }

  public onVacancyTypeSelectionChange(index: number) {
    const vacancyType = this.categoriesArray.controls[index].get('vacancyType').value;
    if (vacancyType === 'All') {
      let vacanciesArray = <FormArray>(<FormGroup>this.categoriesArray.controls[index]).controls.vacancies;
      while (vacanciesArray.length > 0) {
        vacanciesArray.removeAt(0);
      }
      vacanciesArray.reset([], { emitEvent: false });
    } else {
      this.addVacancy(index);
    }
  }

  public onSubmit() {
    this.submitted = true;
    if (!this.form.valid) {
      this.errorSummaryService.scrollToErrorSummary();
      return;
    }

    //const props = this.generateUpdateProps();

    //this.updateEstablishment(props);
  }
}
