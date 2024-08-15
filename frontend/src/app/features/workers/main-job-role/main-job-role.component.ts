import { Component, OnDestroy, OnInit } from '@angular/core';
import { QuestionComponent } from '../question/question.component';
import { Job } from '@core/model/job.model';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { WorkerService } from '@core/services/worker.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { AlertService } from '@core/services/alert.service';
import { JobService } from '@core/services/job.service';

@Component({
  selector: 'app-main-job-role.component',
  templateUrl: './main-job-role.component.html',
})
export class MainJobRoleComponent extends QuestionComponent implements OnInit, OnDestroy {
  public jobsAvailable: Job[] = [];
  public jobGroups = [];
  public preFilledId: number;
  //public submitTitle: 'Save'

  private summaryText = {
    'Care providing roles': 'care worker, community support, support worker',
    'Professional and related roles': 'occupational therapist, registered nurse, nursing assistant',
    'Managerial and Supervisory roles': 'registered manager, supervisor, team leader',
    'IT, digital and date roles': 'data analyst, IT and digital support, IT manager',
    'Other roles': 'admin, care co-ordinator, learning and development',
  };

  constructor(
    protected formBuilder: UntypedFormBuilder,
    protected router: Router,
    protected route: ActivatedRoute,
    protected backLinkService: BackLinkService,
    protected errorSummaryService: ErrorSummaryService,
    public workerService: WorkerService,
    protected establishmentService: EstablishmentService,
    protected alertService: AlertService,
  ) {
    super(formBuilder, router, route, backLinkService, errorSummaryService, workerService, establishmentService);

    this.form = this.formBuilder.group(
      {
        mainJob: [null, ''],
      },
      { updateOn: 'submit' },
    );
  }

  init(): void {
    this.getJobs();
    this.prefillForm();
    console.log(this.worker);
  }

  private getJobs(): void {
    this.jobsAvailable = this.route.snapshot.data.jobs;
    this.sortJobsByJobGroup(this.jobsAvailable);
  }

  private prefillForm(): void {
    let savedMainJob = this.worker.mainJob;
    if (savedMainJob) {
      this.form.setValue({ mainJob: savedMainJob.jobId });
      this.preFilledId = savedMainJob.jobId;
    }
  }

  private getTrainingGroupSummary(jobRoleGroup) {
    return `Jobs like ${this.summaryText[jobRoleGroup.title]}`;
  }

  private sortJobsByJobGroup(jobs) {
    for (let group of Object.keys(this.summaryText)) {
      let currentJobGroup = {
        title: group,
        descriptionText: '',
        items: [],
      };

      let jobRolesArray = [];
      jobs.map((x) => {
        if (x.jobRoleGroup === group) {
          jobRolesArray.push({
            label: x.title,
            id: x.id,
          });
        }
      });
      currentJobGroup.items = jobRolesArray;
      currentJobGroup.descriptionText = this.getTrainingGroupSummary(currentJobGroup);
      this.jobGroups.push(currentJobGroup);
    }

    console.log(this.jobGroups);
  }
}
