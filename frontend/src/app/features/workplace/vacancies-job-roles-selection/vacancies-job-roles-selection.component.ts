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
  public errorMessageOnEmptyInput = 'Select job roles for all your current staff vacancies';
  public jobIdOfOtherCareProvidingRole = 20;
  public jobGroupsToOpenAtStart: string[] = [];
  public jobGroups: JobGroup[] = [];

  protected localStorageKey = 'updated-vacancies';

  private jobsAvailable: Job[] = [];
  private vacancies: Vacancy[] = [];
  private prefilledJobIds: number[] = [];

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

  private getJobs(): void {
    this.jobsAvailable = this.route.snapshot.data.jobs;
    this.jobGroups = JobService.sortJobsByJobGroup(this.jobsAvailable);
  }

  private setupForm(): void {
    this.form = this.formBuilder.group({
      selectedJobRoles: [[], this.validateForm()],
      otherCareProvidingRoleName: ['', null],
    });
  }

  private prefill(): void {
    this.vacancies = this.getPrefillData() ?? [];
    if (!this.vacancies?.length) {
      return;
    }

    this.prefilledJobIds = this.vacancies.map((vacancy) => Number(vacancy.jobId));
    this.jobGroupsToOpenAtStart = this.jobGroups
      .filter((group) => group.items.some((job) => this.prefilledJobIds.includes(job.id)))
      .map((group) => group.title);

    const otherCareProvidingRole = this.vacancies.find(
      (vacancy) => vacancy.jobId === this.jobIdOfOtherCareProvidingRole,
    );
    this.form.patchValue({
      selectedJobRoles: this.prefilledJobIds,
      otherCareProvidingRoleName: otherCareProvidingRole?.other ?? null,
    });
  }

  private getPrefillData() {
    const previousData = this.loadFromLocal();
    if (previousData?.establishmentUid === this.establishment.uid && Array.isArray(previousData?.vacancies)) {
      return previousData.vacancies;
    }

    if (Array.isArray(this.establishment.vacancies)) {
      return this.establishment.vacancies;
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

  protected onSuccess(): void {
    this.storeCurrentChanges();
  }

  protected storeCurrentChanges(): void {
    const selectedJobIds: number[] = this.form.get('selectedJobRoles').value;
    const otherCareProvidingRoleName: string = this.form.get('otherCareProvidingRoleName').value;

    const updatedVacancies: Vacancy[] = selectedJobIds.map((jobId) => {
      const job = this.jobsAvailable.find((job) => job.id === jobId);
      const vacancyCount = this.vacancies.find((vacancy) => vacancy.jobId === jobId)?.total ?? null;
      if (job.id === this.jobIdOfOtherCareProvidingRole && otherCareProvidingRoleName) {
        return { jobId, title: job.title, total: vacancyCount, other: otherCareProvidingRoleName };
      }

      return { jobId, title: job.title, total: vacancyCount };
    });
    const dataToStore = { establishmentUid: this.establishment.uid, vacancies: updatedVacancies };
    this.saveToLocal(dataToStore);
  }

  protected saveToLocal(dataToStore) {
    localStorage.setItem(this.localStorageKey, JSON.stringify(dataToStore));
  }

  protected loadFromLocal() {
    try {
      return JSON.parse(localStorage.getItem(this.localStorageKey));
    } catch (err) {
      return null;
    }
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

  protected generateUpdateProps() {
    // suppress the default action of making calls to backend
    return null;
  }
}
