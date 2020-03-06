import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import {
  allMandatoryTrainingCategories,
  Establishment,
  mandatoryTrainingCategories,
  mandatoryTrainingJobOption,
} from '@core/model/establishment.model';
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
import { BackService } from '@core/services/back.service';

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
  public existingMandatoryTrainings: allMandatoryTrainingCategories;
  public vacanciesOptions = [
    {
      label: 'For all job roles',
      value: mandatoryTrainingJobOption.all,
    },
    {
      label: `For selected job roles only`,
      value: mandatoryTrainingJobOption.selected,
    },
  ];
  constructor(
    protected backService: BackService,
    private trainingService: TrainingService,
    protected formBuilder: FormBuilder,
    protected errorSummaryService: ErrorSummaryService,
    protected establishmentService: EstablishmentService,
    private jobService: JobService,
    protected router: Router,
  ) {}

  get categoriesArray(): FormArray {
    return this.form.get('categories') as FormArray;
  }

  get allTrainingsSelected(): boolean {
    return this.categoriesArray.length >= this.trainings.length;
  }

  ngOnInit(): void {
    this.establishmentService.isMandatoryTrainingView.subscribe(value => {
      if (value === true) {
        this.return = { url: ['/workplace/view-all-mandatory-training'] };
      } else {
        this.return = { url: ['/dashboard'], fragment: 'staff-training-and-qualifications' };
      }
    });

    this.setBackLink();
    this.getAllTrainingCategories();
    this.getAlJobs();
    this.setupForm();
    this.setupFormErrorsMap();
    this.setupServerErrorsMap();
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
          },
        );
      }),
    );
  }

  private setBackLink(): void {
    this.backService.setBackLink(this.return);
  }

  //Setup form for mandatory category
  private setupForm(): void {
    this.form = this.formBuilder.group({
      categories: this.formBuilder.array([]),
    });
  }
  //get all jobs
  private getAlJobs(): void {
    this.subscriptions.add(
      this.jobService
        .getJobs()
        .pipe(take(1))
        .subscribe(jobs => (this.jobs = jobs)),
    );
  }
  //get all trainings
  private getAllTrainingCategories(): void {
    this.subscriptions.add(
      this.trainingService
        .getCategories()
        .pipe(take(1))
        .subscribe(trainings => (this.trainings = trainings)),
    );
  }
  //setup form error message
  protected setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'categories.trainingCategory',
        type: [
          {
            name: 'required',
            message: 'A training category is required.',
          },
        ],
      },
      {
        item: 'vacancies.id',
        type: [
          {
            name: 'required',
            message: 'A job role is required.',
          },
        ],
      },
    ];
  }

  //setup server error message
  private setupServerErrorsMap(): void {
    this.serverErrorsMap = [
      {
        name: 503,
        message: 'We could not send request to mandatory traning. You can try again or contact us.',
      },
      {
        name: 400,
        message: 'Unable to send request to mandatory traning.',
      },
      {
        name: 404,
        message: 'Send request to mandatory traning service not found. You can try again or contact us.',
      },
    ];
  }

  //get form error
  public getFormErrorMessage(item: string, errorType: string): string {
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  //Select training
  public selectableTrainings(index): TrainingCategory[] {
    return this.trainings.filter(
      training =>
        !this.categoriesArray.controls.some(
          category =>
            category !== this.categoriesArray.controls[index] &&
            parseInt(category.get('trainingCategory').value, 10) === training.id,
        ),
    );
  }

  //Add new training category
  public addCategory(): void {
    this.categoriesArray.push(this.createCategoryControl());
  }

  //Remove existing training
  public removeCategory(event: Event, index): void {
    event.preventDefault();
    this.categoriesArray.removeAt(index);
  }

  // create training category contral to add new training
  private createCategoryControl(trainingId = null, vType = mandatoryTrainingJobOption.all): FormGroup {
    return this.formBuilder.group({
      trainingCategory: [trainingId, [Validators.required]],
      vacancyType: [vType, [Validators.required]],
      vacancies: this.formBuilder.array([]),
    });
  }

  //select Jobs
  public selectableJobs(categoryIndex, jobIndex): Job[] {
    const vacanciesArray = <FormArray>(<FormGroup>this.categoriesArray.controls[categoryIndex]).controls.vacancies;
    return this.jobs.filter(
      job =>
        !vacanciesArray.controls.some(
          vacancy => vacancy !== vacanciesArray.controls[jobIndex] && parseInt(vacancy.get('id').value, 10) === job.id,
        ),
    );
  }

  // add new job role
  public addVacancy(index): void {
    const vacancyArray = <FormArray>(<FormGroup>this.categoriesArray.controls[index]).controls.vacancies;
    vacancyArray.push(this.createVacancyControl());
  }

  // remove vacancy contral
  public removeVacancy(event: Event, categoryIndex, jobIndex): void {
    event.preventDefault();
    const vacanciesArray = <FormArray>(<FormGroup>this.categoriesArray.controls[categoryIndex]).controls.vacancies;
    vacanciesArray.removeAt(jobIndex);
  }

  // create vacancy contral to add new job
  private createVacancyControl(jobId = null): FormGroup {
    return this.formBuilder.group({
      id: [jobId, [Validators.required]],
    });
  }

  //set vancancy
  public setVacancy(index, jobs: any[]) {
    jobs.forEach(job => {
      (<FormArray>(<FormGroup>this.categoriesArray.controls[index]).controls.vacancies).push(
        this.createVacancyControl(job.id),
      );
    });
  }

  //prefill trainings and jobs
  private prefill(trainings): void {
    if (trainings.mandatoryTrainingCount > 0) {
      trainings.mandatoryTraining.forEach((trainingCategory, categoryIndex) => {
        const vacancyType =
          trainings.allJobRolesCount === trainingCategory.jobs.length
            ? mandatoryTrainingJobOption.all
            : mandatoryTrainingJobOption.selected;
        const jobs = vacancyType === mandatoryTrainingJobOption.all ? [] : trainingCategory.jobs;
        this.categoriesArray.push(this.createCategoryControl(trainingCategory.trainingCategoryId, vacancyType));
        this.setVacancy(categoryIndex, jobs);
      });
    } else {
      this.categoriesArray.push(this.createCategoryControl());
    }
  }

  //Generate training object arrording to server requirement
  protected generateUpdateProps(): any {
    if (this.categoriesArray.length) {
      return {
        categories: this.categoriesArray.value.map(category => ({
          trainingCategoryId: parseInt(category.trainingCategory, 10),
          allJobRoles: category.vacancyType === mandatoryTrainingJobOption.all ? true : false,
          jobs: category.vacancies,
        })),
      };
    }
    return null;
  }

  //Send updateed training object to server
  protected updateMandatoryTraining(props: mandatoryTrainingCategories): void {
    this.subscriptions.add(
      this.establishmentService.updateMandatoryTraining(this.establishment.uid, props.categories).subscribe(
        data => {
          this.router.navigate(this.return.url, { fragment: this.return.fragment });
        },
        error => {
          this.serverError = this.errorSummaryService.getServerErrorMessage(error.status, this.serverErrorsMap);
        },
      ),
    );
  }

  //update vacancy array on vanancy type change
  public onVacancyTypeSelectionChange(index: number) {
    const vacancyType = this.categoriesArray.controls[index].get('vacancyType').value;
    let vacanciesArray = <FormArray>(<FormGroup>this.categoriesArray.controls[index]).controls.vacancies;
    if (vacancyType === mandatoryTrainingJobOption.all) {
      while (vacanciesArray.length > 0) {
        vacanciesArray.removeAt(0);
      }
      vacanciesArray.reset([], { emitEvent: false });
    } else {
      this.addVacancy(index);
    }
  }

  //chek form validity and set mandatory traing
  public onSubmit() {
    this.submitted = true;
    if (!this.form.valid) {
      this.errorSummaryService.scrollToErrorSummary();
      return;
    }
    const props = this.generateUpdateProps();
    this.updateMandatoryTraining(props);
  }
}
