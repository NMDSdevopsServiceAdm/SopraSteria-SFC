/* eslint-disable @typescript-eslint/no-empty-function */
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { Worker } from '@core/model/worker.model';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { TrainingService } from '@core/services/training.service';
import { WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-main-job',
  templateUrl: './main-job.component.html',
})
export class MainJobComponent implements OnInit, AfterViewInit {
  @ViewChild('formEl') formEl: ElementRef;
  public form: FormGroup;
  public submitted: boolean = false;
  public subscriptions: Subscription = new Subscription();
  public title: string;
  public section: string;
  public buttonText: string;
  public jobRoleGroups: any;
  public jobRoles;
  public otherCategory: any;
  public worker: Worker;
  public establishmentUid: string;
  public workerId: any;
  public formErrorsMap: Array<ErrorDetails>;
  public previousUrl: string[];
  public preFilledId: number;

  private summaryText = {
    'Care providing roles': "care worker, community support, nursing assistant",
    'IT, digital and date roles': "data analyst, IT and digital support, IT manager",
    'Managerial and Supervisory roles': "registered manager, supervisor, team leader",
    'Professional and related roles': "occupational therapist, registered nurse, social worker",
    'Other roles': "admin, care co-ordinator, learning and development",
  };
  submitButtonText: string = 'Continue';

  constructor(
    protected formBuilder: FormBuilder,
    protected trainingService: TrainingService,
    protected router: Router,
    protected backLinkService: BackLinkService,
    protected workerService: WorkerService,
    protected route: ActivatedRoute,
    protected errorSummaryService: ErrorSummaryService,
  ) {}

  ngOnInit(): void {
    this.init();
    this.setTitle();
    this.setSectionHeading();
    this.setBackLink();
    this.getJobRoles();
    this.setupForm();
    this.prefillForm();
    this.setupFormErrorsMap();
  }

  protected init(): void {
    this.route.params.subscribe((params) => {
      if (params) {
        this.establishmentUid = params.establishmentuid;
      }
    });
  }

  protected prefillForm(): void {
    // let selectedCategory = this.trainingService.selectedTraining?.trainingCategory;

    // if (selectedCategory) {
    //   this.form.setValue({ category: selectedCategory?.id });
    //   this.preFilledId = selectedCategory?.id;
    //   this.form.get('category').updateValueAndValidity();
    // }
  }

  protected submit(selectedJobRole): void {
    // this.trainingService.setSelectedTrainingCategory(selectedJobRole);
    this.router.navigate([
      `workplace/${this.establishmentUid}/staff-record/create-staff-record/staff-details`,
    ]);
  }

  protected setTitle(): void {
    this.title = 'Select their main job role';
  }

  protected setSectionHeading(): void {
        this.section = 'Mandatory information';
  }

  private getJobRoles(): void {
    this.jobRoles = this.route.snapshot.data.jobRoles;
    this.sortJobrolesByGroup(this.jobRoles);
  }

  private sortJobrolesByGroup(jobRoles) {
    this.jobRoleGroups = [];
    for (const group of Object.keys(this.summaryText)) {
      let jobRoleGroup = {
        title: group,
        descriptionText: '',
        items: [],
      };
      const jobRoleArray = [];
      jobRoles.map((x) => {
        if (x.jobRoleGroup === group) {
          jobRoleArray.push({
            label: x.title,
            id: x.id,
            seq: x.seq,
          });
        }
      });
      jobRoleGroup.items = jobRoleArray;
      jobRoleGroup.descriptionText = this.getTrainingGroupSummary(jobRoleGroup);
      this.jobRoleGroups.push(jobRoleGroup);
    }
  }

  ngAfterViewInit(): void {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  public onSubmit(event: Event): void {
    event.preventDefault();
    this.submitted = true;
    this.errorSummaryService.syncFormErrorsEvent.next(true);

    let jobRoleIdSelected = this.form.value.jobRole;

    let selectedjobRole = this.jobRoles.filter((jobRole) => {
      if (jobRole.id === jobRoleIdSelected) {
        return jobRole;
      }
    });

    if (this.form.valid) {
      this.submit(selectedjobRole[0]);
    } else {
      this.errorSummaryService.scrollToErrorSummary();
      return;
    }
  }

  public onCancel(event: Event) {}

  public setBackLink(): void {
    this.backLinkService.showBackLink();
  }

  private getTrainingGroupSummary(jobRoleGroup) {
    return `Job roles like ${this.summaryText[jobRoleGroup.title]}`;
  }

  private setupForm(): void {
    this.form = this.formBuilder.group(
      {
        jobRole: [null, Validators.required],
      },
      { updateOn: 'submit' },
    );
  }

  private setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'jobRole',
        type: [
          {
            name: 'required',
            message: 'Select the job role',
          },
        ],
      },
    ];
  }
}
