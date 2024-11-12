import { Component, OnDestroy, OnInit } from '@angular/core';
import { Question } from '../question/question.component';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { Job } from '@core/model/job.model';

@Component({
  selector: 'app-vacancies-job-role-selection',
  templateUrl: './vacancies-job-role-selection.component.html',
})
export class VacanciesJobRoleSelectionComponent extends Question implements OnInit, OnDestroy {
  public section = 'Vacancies and turnover';
  public jobsAvailable: Job[] = [];
  public jobGroups = [];

  constructor(
    protected formBuilder: UntypedFormBuilder,
    protected router: Router,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected establishmentService: EstablishmentService,
    private route: ActivatedRoute,
  ) {
    super(formBuilder, router, backService, errorSummaryService, establishmentService);
  }

  init() {
    this.getJobs();
    console.log();
  }

  private summaryText = {
    'Care providing roles': 'care worker, community support, support worker',
    'Professional and related roles': 'occupational therapist, registered nurse, nursing assistant',
    'Managerial and supervisory roles': 'registered manager, supervisor, team leader',
    'IT, digital and data roles': 'data analyst, IT and digital support, IT manager',
    'Other roles': 'admin, care co-ordinator, learning and development',
  };

  private getJobs(): void {
    this.jobsAvailable = this.route.snapshot.data.jobs;
    this.sortJobsByJobGroup(this.jobsAvailable);
  }

  private getTrainingGroupSummary(jobRoleGroup: { title: string }) {
    return `Jobs like ${this.summaryText[jobRoleGroup.title]}`;
  }

  private sortJobsByJobGroup(jobs: Job[]) {
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
}
