import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { Establishment, mandatoryTrainingJobOption } from '@core/model/establishment.model';
import { Job } from '@core/model/job.model';
import { allMandatoryTrainingCategories, TrainingCategory } from '@core/model/training.model';
import { URLStructure } from '@core/model/url.model';
import { AlertService } from '@core/services/alert.service';
import { BackLinkService } from '@core/services/backLink.service';
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
  @ViewChild('formEl') formEl: ElementRef;
  public form: FormGroup;
  public renderAsEditMandatoryTraning: boolean;
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
  public allOrSelectedJobRoleOptions = [
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
    protected backLinkService: BackLinkService,
    private trainingService: TrainingService,
    protected formBuilder: FormBuilder,
    protected errorSummaryService: ErrorSummaryService,
    protected establishmentService: EstablishmentService,
    private jobService: JobService,
    protected router: Router,
    private route: ActivatedRoute,
    private alertService: AlertService,
  ) {}

  get selectedJobRolesArray(): FormArray {
    return this.form.get('selectedJobRoles') as FormArray;
  }

  ngOnInit(): void {
    this.primaryWorkplace = this.establishmentService.primaryWorkplace;
    this.establishment = this.route.parent.snapshot.data.establishment;
    this.renderAsEditMandatoryTraning = this.route.snapshot.url[0].path === 'edit-mandatory-training';

    this.subscriptions.add(
      this.trainingService.getAllMandatoryTrainings(this.establishment.uid).subscribe((existingMandatoryTraining) => {
        this.existingMandatoryTrainings = existingMandatoryTraining;
        this.getAllTrainingCategories();
      }),
    );

    this.getAllJobs();
    this.setUpForm();
    this.setupServerErrorsMap();
    this.backLinkService.showBackLink();
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
      allOrSelectedJobRoles: [vType],
      selectedJobRoles: this.formBuilder.array([]),
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
    this.selectedJobRolesArray.controls.forEach((selectedJobRolesItem, index) => {
      this.formErrorsMap.push({
        item: `selectedJobRoles.id.${index}`,
        type: [
          {
            name: 'required',
            message: `Select the job role (job role ${index + 1})`,
          },
        ],
      });
    });
  }

  public addVacancy(): void {
    this.selectedJobRolesArray.push(this.createVacancyControl());
    this.setupFormErrorsMap();
  }

  public filterJobList(jobIndex): Job[] {
    return this.jobs.filter(
      (job) =>
        !this.selectedJobRolesArray.controls.some(
          (jobRole) =>
            jobRole !== this.selectedJobRolesArray.controls[jobIndex] &&
            parseInt(jobRole.get('id').value, 10) === job.id,
        ),
    );
  }

  public removeVacancy(event: Event, jobIndex): void {
    event.preventDefault();
    this.selectedJobRolesArray.removeAt(jobIndex);
  }

  private createVacancyControl(jobId = null): FormGroup {
    return this.formBuilder.group({
      id: [jobId, [Validators.required]],
    });
  }

  protected generateUpdateProps(): any {
    return {
      trainingCategoryId: parseInt(this.form.get('trainingCategory').value, 10),
      allJobRoles: this.form.get('allOrSelectedJobRoles').value === mandatoryTrainingJobOption.all ? true : false,
      jobs: this.form.get('selectedJobRoles').value,
    };
  }

  protected updateMandatoryTraining(props): void {
    this.subscriptions.add(
      this.establishmentService.updateMandatoryTraining(this.establishment.uid, props).subscribe(
        () => {
          this.router.navigate([
            '/workplace',
            this.establishmentService.primaryWorkplace.uid,
            'add-and-manage-mandatory-training',
          ]);
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
    const allOrSelectedJobRoles = this.form.get('allOrSelectedJobRoles').value;
    if (allOrSelectedJobRoles === mandatoryTrainingJobOption.all) {
      while (this.selectedJobRolesArray.length > 0) {
        this.selectedJobRolesArray.removeAt(0);
      }
      this.selectedJobRolesArray.reset([], { emitEvent: false });
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
