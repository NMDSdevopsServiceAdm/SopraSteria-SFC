import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { Establishment, mandatoryTrainingJobOption } from '@core/model/establishment.model';
import { Job } from '@core/model/job.model';
import { allMandatoryTrainingCategories, TrainingCategory } from '@core/model/training.model';
import { URLStructure } from '@core/model/url.model';
import { AlertService } from '@core/services/alert.service';
import { BackService } from '@core/services/back.service';
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
export class AddMandatoryTrainingComponent implements OnInit, OnDestroy {
  public form: FormGroup;
  public submitted = false;
  public categories: TrainingCategory[];
  public filteredTrainingCategories: TrainingCategory[];
  private subscriptions: Subscription = new Subscription();
  public jobs: Job[] = [];
  public filteredJobs: Array<Job[]> = [];
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
      label: 'All job roles',
      value: mandatoryTrainingJobOption.all,
    },
    {
      label: `Only selected job roles`,
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
    private route: ActivatedRoute,
    private alertService: AlertService,
  ) {}

  ngOnInit(): void {
    this.primaryWorkplace = this.establishmentService.primaryWorkplace;
    this.establishment = this.route.parent.snapshot.data.establishment;

    this.subscriptions.add(
      this.trainingService.getAllMandatoryTrainings(this.establishment.uid).subscribe((existingMandatoryTraining) => {
        this.existingMandatoryTrainings = existingMandatoryTraining;
        this.getAllTrainingCategories();
      }),
    );

    this.getAllJobs();
    this.setUpForm();
    this.setupServerErrorsMap();
    this.setBackLink();
  }

  private getAllTrainingCategories(): void {
    this.subscriptions.add(
      this.trainingService
        .getCategories()
        .pipe(take(1))
        .subscribe((trainings) => {
          this.trainings = this.filterTrainingCategories(trainings);
        }),
    );
  }

  public filterTrainingCategories(trainings): TrainingCategory[] {
    const preSelectedIds = this.existingMandatoryTrainings.mandatoryTraining.map(
      (existingMandatoryTrainings) => existingMandatoryTrainings.trainingCategoryId,
    );

    return trainings.filter((training) => {
      return !preSelectedIds.includes(training.id);
    });
  }

  private getAllJobs(): void {
    this.subscriptions.add(
      this.jobService
        .getJobs()
        .pipe(take(1))
        .subscribe((jobs) => (this.jobs = jobs)),
    );
  }

  private setUpForm(trainingId = null, vType = mandatoryTrainingJobOption.all): void {
    this.form = this.formBuilder.group({
      trainingCategory: [trainingId, [Validators.required]],
      vacancyType: [vType, [Validators.required]],
      vacancies: this.formBuilder.array([]),
    });
  }

  protected setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'trainingCategory',
        type: [
          {
            name: 'required',
            message: 'Select the mandatory training',
          },
        ],
      },
    ];
    const vacanciesArray = this.form.get('vacancies') as FormArray;
    vacanciesArray.controls.forEach((vacanciesItem, index) => {
      this.formErrorsMap.push({
        item: `vacancies.id.${index}`,
        type: [
          {
            name: 'required',
            message: `Select the job role (job role ${index + 1})`,
          },
        ],
      });
    });
  }

  private setupServerErrorsMap(): void {
    const serverErrorMessage = 'There has been a problem saving your mandatory training. Please try again.';
    this.serverErrorsMap = [
      {
        name: 500,
        message: serverErrorMessage,
      },
      {
        name: 400,
        message: serverErrorMessage,
      },
      {
        name: 404,
        message: serverErrorMessage,
      },
    ];
  }

  public setBackLink(): void {
    this.return = {
      url: ['/workplace', this.establishmentService.primaryWorkplace.uid, 'add-and-manage-mandatory-training'],
    };
    this.backService.setBackLink(this.return);
  }

  public addVacancy(): void {
    const vacancyArray = <FormArray>(<FormGroup>this.form).controls.vacancies;
    vacancyArray.push(this.createVacancyControl());
    this.setupFormErrorsMap();
    this.filteredJobs.push(this.filterJobList());
  }

  public filterJobList(): Job[] {
    const vacanciesArray = this.form.get('vacancies') as FormArray;
    const vacanciesArrayNumbers = vacanciesArray.value.map((str) => {
      return parseInt(str.id, 10);
    });
    return this.jobs.filter((job) => {
      return !vacanciesArrayNumbers.includes(job.id);
    });
  }

  public removeVacancy(event: Event, jobIndex): void {
    event.preventDefault();
    const vacanciesArray = <FormArray>(<FormGroup>this.form).controls.vacancies;
    vacanciesArray.removeAt(jobIndex);
  }

  private createVacancyControl(jobId = null): FormGroup {
    return this.formBuilder.group({
      id: [jobId, [Validators.required]],
    });
  }

  protected generateUpdateProps(): any {
    return {
      trainingCategoryId: parseInt(this.form.get('trainingCategory').value, 10),
      allJobRoles: this.form.get('vacancyType').value === mandatoryTrainingJobOption.all ? true : false,
      jobs: this.form.get('vacancies').value,
    };
  }

  protected updateMandatoryTraining(props): void {
    this.subscriptions.add(
      this.establishmentService.updateMandatoryTraining(this.establishment.uid, props).subscribe(
        () => {
          this.router.navigate(this.return.url, { fragment: this.return.fragment });
          this.alertService.addAlert({
            type: 'success',
            message: 'Mandatory training category added',
          });
        },
        (error) => {
          this.serverError = this.errorSummaryService.getServerErrorMessage(error.status, this.serverErrorsMap);
        },
      ),
    );
  }

  public onVacancyTypeSelectionChange(): void {
    const vacancyType = this.form.get('vacancyType').value;
    const vacanciesArray = <FormArray>(<FormGroup>this.form).controls.vacancies;
    if (vacancyType === mandatoryTrainingJobOption.all) {
      while (vacanciesArray.length > 0) {
        vacanciesArray.removeAt(0);
      }
      vacanciesArray.reset([], { emitEvent: false });
    } else {
      this.addVacancy();
    }
  }

  public onSubmit(): void {
    this.submitted = true;
    this.setupFormErrorsMap();
    if (!this.form.valid) {
      this.errorSummaryService.scrollToErrorSummary();
      return;
    }
    const props = this.generateUpdateProps();
    this.updateMandatoryTraining(props);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
