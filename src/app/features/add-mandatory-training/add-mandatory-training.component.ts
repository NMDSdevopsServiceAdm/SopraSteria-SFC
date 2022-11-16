import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { allMandatoryTrainingCategories, Establishment, mandatoryTrainingJobOption } from '@core/model/establishment.model';
import { Job } from '@core/model/job.model';
import { TrainingCategory } from '@core/model/training.model';
import { URLStructure } from '@core/model/url.model';
import { AlertService } from '@core/services/alert.service';
import { BackService } from '@core/services/back.service';
import { DialogService } from '@core/services/dialog.service';
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
      label: 'All job roles',
      value: mandatoryTrainingJobOption.all,
    },
    {
      label: `Only selected job roles`,
      value: mandatoryTrainingJobOption.selected,
    },
  ];
  constructor(
    private alertService: AlertService,
    protected backService: BackService,
    private dialogService: DialogService,
    private trainingService: TrainingService,
    protected formBuilder: FormBuilder,
    protected errorSummaryService: ErrorSummaryService,
    protected establishmentService: EstablishmentService,
    private jobService: JobService,
    protected router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.primaryWorkplace = this.establishmentService.primaryWorkplace;
    this.establishment = this.route.parent.snapshot.data.establishment;
    this.setBackLink();
    this.getAllTrainingCategories();
    this.getAlJobs();
    this.setupFormErrorsMap();
    this.setupServerErrorsMap();
    this.setUpForm();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public setBackLink(): void {
    const url =
      this.establishment.uid === this.primaryWorkplace.uid ? ['/dashboard'] : ['/workplace', this.establishment.uid];
    this.return = { url: url, fragment: 'training-and-qualifications' };
    this.backService.setBackLink(this.return);
  }

  private getAllTrainingCategories(): void {
    this.subscriptions.add(
      this.trainingService
        .getCategories()
        .pipe(take(1))
        .subscribe((trainings) => (this.trainings = trainings)),
    );
  }

  private getAlJobs(): void {
    this.subscriptions.add(
      this.jobService
        .getJobs()
        .pipe(take(1))
        .subscribe((jobs) => (this.jobs = jobs)),
    );
  }

  //setup form error message
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
      {
        item: 'vacancies.id',
        type: [
          {
            name: 'required',
            message: 'Select the job role',
          },
        ],
      },
    ];
  }

  //setup server error message
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

  //get form error
  public getFormErrorMessage(item: string, errorType: string): string {
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  // create training category contral to add new training
  private setUpForm(trainingId = null, vType = mandatoryTrainingJobOption.all): void {
    this.form = this.formBuilder.group({
      trainingCategory: [trainingId, [Validators.required]],
      vacancyType: [vType, [Validators.required]],
      vacancies: this.formBuilder.array([]),
    });
  }

  // add new job role
  public addVacancy(): void {
    const vacancyArray = <FormArray>(<FormGroup>this.form).controls.vacancies;
    vacancyArray.push(this.createVacancyControl());
  }

  // remove vacancy contral
  public removeVacancy(event: Event, jobIndex): void {
    event.preventDefault();
    const vacanciesArray = <FormArray>(<FormGroup>this.form).controls.vacancies;
    vacanciesArray.removeAt(jobIndex);
  }

  // create vacancy contral to add new job
  private createVacancyControl(jobId = null): FormGroup {
    return this.formBuilder.group({
      id: [jobId, [Validators.required]],
    });
  }

  //Generate training object arrording to server requirement
  protected generateUpdateProps(): any {
    return {
      trainingCategoryId: parseInt(this.form.get('trainingCategory').value, 10),
      allJobRoles: this.form.get('vacancyType').value === mandatoryTrainingJobOption.all ? true : false,
      jobs: this.form.get('vacancies').value,
    };
  }

  //Send updated training object to server
  protected updateMandatoryTraining(props): void {
    this.subscriptions.add(
      this.establishmentService.updateMandatoryTraining(this.establishment.uid, props).subscribe(
        (success) => {
          this.router.navigate(this.return.url, { fragment: this.return.fragment });
        },
        (error) => {
          this.serverError = this.errorSummaryService.getServerErrorMessage(error.status, this.serverErrorsMap);
        },
      ),
    );
  }

  //update vacancy array on vanancy type change
  public onVacancyTypeSelectionChange() {
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

  //check form validity and set mandatory traing
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
