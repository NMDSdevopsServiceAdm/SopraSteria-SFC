import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { StarterLeaverVacancy } from '@core/model/establishment.model';
import { Job, JobGroup } from '@core/model/job.model';
import { BackLinkService } from '@core/services/backLink.service';
import { JobService } from '@core/services/job.service';
import { VacanciesAndTurnoverService } from '@core/services/vacancies-and-turnover.service';
import { AccordionGroupComponent } from '@shared/components/accordions/generic-accordion/accordion-group/accordion-group.component';

@Component({
    selector: 'app-select-job-roles-to-add',
    templateUrl: './select-job-roles-to-add.component.html',
    standalone: false
})
export class SelectJobRolesToAddComponent implements OnInit {
  @ViewChild('formEl') formEl: ElementRef;
  @ViewChild('accordion') accordion: AccordionGroupComponent;

  public jobRoleType: JobRoleType;
  private selectedFieldStatesInService = {
    [JobRoleType.Vacancies]: 'selectedVacancies',
    [JobRoleType.Starters]: 'selectedStarters',
    [JobRoleType.Leavers]: 'selectedLeavers',
  };
  private selectedFieldState: string;

  public form: UntypedFormGroup;
  public submitted = false;

  public jobGroups: JobGroup[] = [];
  public jobsAvailable: Job[] = [];
  public disabledJobIds: number[] = [];
  public jobGroupsToOpenAtStart: string[] = [];

  protected prefillData: Array<StarterLeaverVacancy> = [];
  protected selectedJobIds: number[] = [];

  constructor(
    protected formBuilder: UntypedFormBuilder,
    protected router: Router,
    protected backlinkService: BackLinkService,
    protected vacanciesAndTurnoverService: VacanciesAndTurnoverService,
    protected route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.getJobs();
    this.setupJobRoleType();
    this.setupForm();
    this.setBackLink();
    this.prefill();
  }

  private getJobs(): void {
    this.jobsAvailable = this.route.snapshot.data.jobs;
    this.jobGroups = JobService.sortJobsByJobGroup(this.jobsAvailable);
  }

  private setupJobRoleType(): void {
    this.jobRoleType = this.route.snapshot?.data?.jobRoleType;
    this.selectedFieldState = this.selectedFieldStatesInService[this.jobRoleType];
  }

  private setupForm(): void {
    this.form = this.formBuilder.group({
      selectedJobRoles: [[]],
    });
  }

  private setBackLink(): void {
    this.backlinkService.showBackLink();
  }

  private prefill(): void {
    this.prefillData = this.vacanciesAndTurnoverService[this.selectedFieldState] || [];

    this.disabledJobIds = this.prefillData.map((jobRole) => jobRole.jobId) ?? [];
    this.jobGroupsToOpenAtStart = this.jobGroups
      .filter((group) => {
        return group.items.some((job) => this.disabledJobIds.includes(job.id));
      })
      .map((group) => group.title);
  }

  public onCheckboxClick(target: HTMLInputElement): void {
    const jobId = Number(target.value);

    if (this.selectedJobIds.includes(jobId)) {
      this.selectedJobIds = this.selectedJobIds.filter((id) => id !== jobId);
    } else {
      this.selectedJobIds = [...this.selectedJobIds, jobId];
    }
  }

  public onSubmit(): void {
    this.form.patchValue({ selectedJobRoles: this.selectedJobIds });
    this.submitted = true;

    this.onSuccess();
  }

  private onSuccess(): void {
    this.storeUpdatedJobRoles();
    this.returnToPreviousPage();
  }

  public onCancel(event: Event): void {
    event.preventDefault();
    this.returnToPreviousPage();
  }

  private storeUpdatedJobRoles(): void {
    const updatedJobRoles = this.getUpdatedJobRoles();

    this.vacanciesAndTurnoverService[this.selectedFieldState] = updatedJobRoles;
  }

  private getUpdatedJobRoles(): Array<StarterLeaverVacancy> {
    const selectedJobIds = this.form.get('selectedJobRoles').value;
    const jobRolesToAdd = this.jobsAvailable
      .filter((job) => selectedJobIds.includes(job.id))
      .map((job) => {
        return { jobId: job.id, title: job.title, total: 1 };
      });
    const jobRolesSelectedBefore = this.prefillData;
    return [...jobRolesSelectedBefore, ...jobRolesToAdd];
  }

  private returnToPreviousPage(): void {
    this.router.navigate([`../update-${this.jobRoleType}`], { relativeTo: this.route });
  }
}

export enum JobRoleType {
  Vacancies = 'vacancies',
  Starters = 'starters',
  Leavers = 'leavers',
}
