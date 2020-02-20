import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { Establishment, jobOptionsEnum, mandatoryTrainings } from '@core/model/establishment.model';
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
  public existingMandatoryTrainings: mandatoryTrainings;
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
    private jobService: JobService,
    protected router: Router
  ) {}

  get categoriesArray(): FormArray {
    return this.form.get('categories') as FormArray;
  }

  get allTrainingsSelected(): boolean {
    return this.categoriesArray.length >= this.trainings.length;
  }

  ngOnInit(): void {
    this.breadcrumbService.show(JourneyType.MANDATORY_TRAINING);
    this.return = { url: ['/dashboard'], fragment: 'staff-training-and-qualifications' };
    this.getTrainings();
    this.getJobs();
    this.setupForm();
    this.subscriptions.add(
      this.establishmentService.establishment$.subscribe(establishment => {
        this.establishment = establishment;
        this.establishmentService.getAllMandatoryTrainings(this.establishment.uid).subscribe(
          trainings => {
            this.prefill(trainings);
          },
          error => {
            if (error.error.message) {
              this.serverError = error.error.message;
            }
          }
        );
      })
    );

    //training category
    this.subscriptions.add(
      this.categoriesArray.valueChanges.subscribe(() => {
        this.categoriesArray.controls[0].get('trainingCategory').setValidators([Validators.required]);
      })
    );

    this.subscriptions.add();
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

  private prefill(trainings): void {
    if (trainings.mandatoryTrainingCount > 0) {
      // let categoryIndex = 0;
      trainings.mandatoryTraining.forEach((trainingCategory, categoryIndex) => {
        const vacancyType =
          trainings.allJobRolesCount === trainingCategory.jobs.length ? jobOptionsEnum.ALL : jobOptionsEnum.SELECTED;
        const jobs = vacancyType === jobOptionsEnum.ALL ? [] : trainingCategory.jobs;
        this.categoriesArray.push(this.createCategoryControl(trainingCategory.trainingCategoryId, vacancyType));
        this.setVacancy(categoryIndex, jobs);
        // categoryIndex++;
      });
    } else {
      this.categoriesArray.push(this.createCategoryControl());
    }
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
        item: 'vacancies.id',
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
          vacancy => vacancy !== vacanciesArray.controls[jobIndex] && parseInt(vacancy.get('id').value, 10) === job.id
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

  public setVacancy(index, jobs: any[]) {
    jobs.forEach(job => {
      (<FormArray>(<FormGroup>this.categoriesArray.controls[index]).controls.vacancies).push(
        this.createVacancyControl(job.id)
      );
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

  private createVacancyControl(jobId = null): FormGroup {
    return this.formBuilder.group({
      id: [jobId, [Validators.required]],
    });
  }

  protected generateUpdateProps(): any {
    if (this.categoriesArray.length) {
      return {
        categories: this.categoriesArray.value.map(category => ({
          trainingCategoryId: parseInt(category.trainingCategory, 10),
          allJobRoles: category.vacancyType === jobOptionsEnum.ALL ? true : false,
          jobs: category.vacancies,
        })),
      };
    }
    return null;
  }

  protected updateEstablishment(props: any): void {
    this.subscriptions.add(
      this.establishmentService.updateMandatoryTraining(this.establishment.uid, props.categories).subscribe(
        data => {
          this.router.navigate(this.return.url, { fragment: this.return.fragment });
        },
        error => console.log(error)
      )
    );
  }

  public getFormErrorMessage(item: string, errorType: string): string {
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  private clearValidators(index: number) {
    this.categoriesArray.controls[index].get('trainingCategory').clearValidators();
    // this.vacanciesArray.controls[index].get('id').clearValidators();
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
    const props = this.generateUpdateProps();
    this.updateEstablishment(props);
  }
}
