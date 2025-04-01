import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Leaver, Starter, Vacancy } from '@core/model/establishment.model';
import { Job, JobGroup } from '@core/model/job.model';
import { BackLinkService } from '@core/services/backLink.service';
import { JobService } from '@core/services/job.service';
import { UpdateWorkplaceAfterStaffChangesService } from '@core/services/update-workplace-after-staff-changes.service';
import { AccordionGroupComponent } from '@shared/components/accordions/generic-accordion/accordion-group/accordion-group.component';

@Component({
  selector: 'app-select-job-roles-to-add',
  templateUrl: './select-job-roles-to-add.component.html',
})
export class SelectJobRolesToAddComponent implements OnInit {
  @ViewChild('formEl') formEl: ElementRef;
  @ViewChild('accordion') accordion: AccordionGroupComponent;

  public jobRoleType: JobRoleType;

  public form: UntypedFormGroup;
  public submitted = false;

  public jobGroups: JobGroup[] = [];
  public jobsAvailable: Job[] = [];
  public disabledJobIds: number[] = [];
  public jobGroupsToOpenAtStart: string[] = [];

  protected prefillData: Array<Vacancy | Starter | Leaver> = [];
  protected selectedJobIds: number[] = [];

  constructor(
    protected formBuilder: UntypedFormBuilder,
    protected router: Router,
    protected backlinkService: BackLinkService,
    protected updateWorkplaceAfterStaffChangesService: UpdateWorkplaceAfterStaffChangesService,
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
    switch (this.jobRoleType) {
      case JobRoleType.Vacancies: {
        this.prefillData = this.updateWorkplaceAfterStaffChangesService.selectedVacancies;
      }
    }

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

    switch (this.jobRoleType) {
      case JobRoleType.Vacancies: {
        this.updateWorkplaceAfterStaffChangesService.selectedVacancies = updatedJobRoles;
      }
    }
  }

  private getUpdatedJobRoles(): Array<Vacancy | Starter | Leaver> {
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
    switch (this.jobRoleType) {
      case JobRoleType.Vacancies: {
        this.router.navigate(['../update-vacancies'], { relativeTo: this.route });
      }
    }
  }
}

export enum JobRoleType {
  Vacancies = 'vacancies',
  Starters = 'starters',
  Leavers = 'leavers',
}
