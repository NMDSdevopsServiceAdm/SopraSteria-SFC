import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, ValidatorFn } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Vacancy } from '@core/model/establishment.model';
import { Job, JobGroup } from '@core/model/job.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { JobService } from '@core/services/job.service';
import { Question } from '@features/workplace/question/question.component';
import { AccordionGroupComponent } from '@shared/components/accordions/generic-accordion/accordion-group/accordion-group.component';

@Component({
  selector: 'app-vacancies-job-roles-selection',
  templateUrl: './vacancies-job-roles-selection.component.html',
})
export class VacanciesJobRolesSelectionComponent extends Question implements OnInit, OnDestroy {
  @ViewChild('accordion') accordion: AccordionGroupComponent;
  public section = 'Vacancies and turnover';
  public jobsAvailable: Job[] = [];
  public jobGroups: JobGroup[] = [];
  public errorMessageOnEmptyInput = 'Select job roles for all your current staff vacancies';
  public jobIdOfCareProvidingRoleOther = 20;
  private vacancies: Vacancy[] = [];
  private prefilledJobIds: number[] = [];
  private jobGroupsToOpenAtStart: string[] = [];

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

  protected init() {
    this.getJobs();
    this.setupForm();
    this.prefill();

    this.nextRoute = ['/workplace', `${this.establishment.uid}`, 'vacancies-number'];
    this.previousRoute = ['/workplace', `${this.establishment.uid}`, 'vacancies'];
  }

  private setupForm(): void {
    this.form = this.formBuilder.group({
      selectedJobRoles: [[], this.validateForm()],
      otherCareProvidingRoleName: ['', null],
    });
  }

  private prefill(): void {
    if (Array.isArray(this.establishment.vacancies) && this.establishment.vacancies.length) {
      this.vacancies = this.establishment.vacancies;
      this.prefilledJobIds = this.establishment.vacancies.map((vacancy) => Number(vacancy.jobId));
      this.jobGroupsToOpenAtStart = this.jobGroups
        .filter((group) => group.items.some((job) => this.prefilledJobIds.includes(job.id)))
        .map((group) => group.title);

      const otherCareProvidingRole = this.vacancies.find(
        (vacancy) => vacancy.jobId === this.jobIdOfCareProvidingRoleOther,
      );
      this.form.patchValue({
        selectedJobRoles: this.prefilledJobIds,
        otherCareProvidingRoleName: otherCareProvidingRole?.other ?? null,
      });
    }
  }

  private validateForm(): ValidatorFn {
    const validatorFunction = (formControl) => {
      if (formControl.value?.length > 0) {
        return null;
      } else {
        return { selectedNone: true };
      }
    };

    return validatorFunction;
  }

  public onCheckboxClick(target: HTMLInputElement) {
    const jobId = Number(target.value);
    const selectedJobRoles = this.form.get('selectedJobRoles');
    const currentSelectedIds: number[] = this.form.get('selectedJobRoles').value;

    if (currentSelectedIds.includes(jobId)) {
      const updatedSelection = currentSelectedIds.filter((id) => id !== jobId);
      selectedJobRoles.setValue(updatedSelection);
    } else {
      selectedJobRoles.setValue([...currentSelectedIds, jobId]);
    }
  }

  public onSubmit(): void {
    if (this.form.invalid) {
      this.accordion.showAll();
    }
    super.onSubmit();
  }

  private getJobs(): void {
    this.jobsAvailable = this.route.snapshot.data.jobs;
    this.jobGroups = JobService.sortJobsByJobGroup(this.jobsAvailable);
  }

  private storeSelectedJobRolesInLocalStorage(): void {
    const selectedJobIds: number[] = this.form.get('selectedJobRoles').value;
    const updatedVacancies: Vacancy[] = selectedJobIds.map((jobId) => {
      const job = this.jobsAvailable.find((job) => job.id === jobId);
      const vacancyNumber = this.vacancies.find((vacancy) => vacancy.jobId === jobId)?.total ?? null;
      return { jobId, title: job.title, total: vacancyNumber };
    });
    localStorage.setItem('updated-vacancies', JSON.stringify(updatedVacancies));
  }

  protected setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'selectedJobRoles',
        type: [
          {
            name: 'selectedNone',
            message: this.errorMessageOnEmptyInput,
          },
        ],
      },
    ];
  }

  protected onSuccess(): void {}

  protected generateUpdateProps() {
    // suppress the default action of making calls to backend
    return null;
  }
}
