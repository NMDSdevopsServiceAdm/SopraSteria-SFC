import { Component, OnDestroy, OnInit } from '@angular/core';
import { QuestionComponent } from '../question/question.component';
import { Job } from '@core/model/job.model';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { WorkerService } from '@core/services/worker.service';
import { EstablishmentService } from '@core/services/establishment.service';

@Component({
  selector: 'app-main-job-role.component',
  templateUrl: './main-job-role.component.html',
})
export class MainJobRoleComponent extends QuestionComponent implements OnInit, OnDestroy {
  public jobsAvailable: Job[] = [];
  public jobGroups = [];
  public preFilledId: number;
  public canExit = true;
  public editFlow: boolean;
  public inMandatoryDetailsFlow: boolean;
  public summaryContinue: boolean;

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
    this.inMandatoryDetailsFlow = this.route.parent.snapshot.url[0].path === 'mandatory-details';
    this.summaryContinue = !this.insideFlow && !this.inMandatoryDetailsFlow;
    this.editFlow = this.inMandatoryDetailsFlow || this.wdfEditPageFlag || !this.insideFlow;

    this.getJobs();
    this.prefillForm();
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
      this.form.get('mainJob').updateValueAndValidity();
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
  }

  generateUpdateProps() {
    const { mainJob } = this.form.controls;

    const props = {
      mainJob: {
        jobId: mainJob.value,
      },
    };

    if (this.worker && mainJob.value !== 23) {
      this.worker.registeredNurse = null;
      if (this.worker.nurseSpecialism) {
        this.worker.nurseSpecialism.specialism = null;
      }
    }
    return props;
  }

  protected onSuccess(): void {
    this.router.navigate(this.returnUrl);
  }
}
