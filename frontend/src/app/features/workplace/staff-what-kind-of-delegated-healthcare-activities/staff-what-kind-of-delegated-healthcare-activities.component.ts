import { Component, OnInit } from '@angular/core';
import { Question } from '../question/question.component';
import { FormArray, FormControl, UntypedFormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertService } from '@core/services/alert.service';
import { BackService } from '@core/services/back.service';
import { CareWorkforcePathwayService } from '@core/services/care-workforce-pathway.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkplaceFlowSections } from '@core/utils/progress-bar-util';
import { DelegatedHealthcareActivity } from '@core/model/delegated-healthcare-activities.model';
import { DelegatedHealthcareActivitiesService } from '@core/services/delegated-healthcare-activities.service';
import { PreviousRouteService } from '@core/services/previous-route.service';

@Component({
  selector: 'app-staff-what-kind-of-delegated-healthcare-activities',
  templateUrl: './staff-what-kind-of-delegated-healthcare-activities.component.html',
  standalone: false,
})
export class StaffWhatKindOfDelegatedHealthcareActivitiesComponent extends Question implements OnInit {
  public section = WorkplaceFlowSections.SERVICES;
  public delegatedHealthcareActivities: DelegatedHealthcareActivity[];
  public doNotKnowOption: any = {};
  public allDelegatedHealthcareActivitiesOptions: any[];
  public isDoNotKnowChecked: boolean = false;
  public delegatedHealthcareActivitiesLength: number;
  public selectedActivitiesCheckboxes: any = [];
  public dhaDefinition: string;

  constructor(
    protected formBuilder: UntypedFormBuilder,
    protected router: Router,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected establishmentService: EstablishmentService,
    protected careWorkforcePathwayService: CareWorkforcePathwayService,
    protected route: ActivatedRoute,
    private alertService: AlertService,
    private delegatedHealthcareActivitiesService: DelegatedHealthcareActivitiesService,
    private previousRouteService: PreviousRouteService,
  ) {
    super(formBuilder, router, backService, errorSummaryService, establishmentService);
  }

  init(): void {
    this.dhaDefinition = this.delegatedHealthcareActivitiesService.dhaDefinition;
    this.delegatedHealthcareActivities = this.route.snapshot.data.delegatedHealthcareActivities;
    this.delegatedHealthcareActivitiesLength = this.delegatedHealthcareActivities.length;
    this.doNotKnowOption = { id: this.delegatedHealthcareActivitiesLength + 1, seq: 900, title: 'I do not know' };
    this.allDelegatedHealthcareActivitiesOptions = [...this.delegatedHealthcareActivities, this.doNotKnowOption];
    this.setupForm();
    this.prefill();
    this.skipRoute = ['/workplace', this.establishment.uid, 'do-you-have-vacancies'];
    this.setPreviousRoute();
    this.nextRoute = this.skipRoute;
  }

  private setPreviousRoute(): void {
    this.previousRoute = ['/workplace', this.establishment.uid, 'staff-do-delegated-healthcare-activities'];
  }

  setupForm() {
    this.form = this.formBuilder.group(
      {
        selectedDelegatedHealthcareActivities: this.formBuilder.array(
          this.allDelegatedHealthcareActivitiesOptions.map(() => null),
        ),
      },
      { updateOn: 'submit' },
    );
  }

  private prefill(): void {
    const staffWhatKindDelegatedHealthcareActivities = this.establishment.staffWhatKindDelegatedHealthcareActivities;

    if (!staffWhatKindDelegatedHealthcareActivities) {
      return;
    }

    const { knowWhatActivities, activities } = staffWhatKindDelegatedHealthcareActivities;

    let previouslySaved = [];

    if (knowWhatActivities === "Don't know") {
      previouslySaved = [this.doNotKnowOption];
      this.isDoNotKnowChecked = true;
    } else if (knowWhatActivities === 'Yes' && activities && activities.length > 0) {
      previouslySaved = activities;
    }

    this.prefillCheckboxes(previouslySaved);
  }

  private prefillCheckboxes(previouslySavedOptions) {
    const selectedIds = previouslySavedOptions.map((previouslySavedOption) => previouslySavedOption.id);

    const checkboxesValue = this.allDelegatedHealthcareActivitiesOptions.map((activity) =>
      selectedIds.includes(activity.id),
    );

    this.selectedActivitiesCheckboxes = selectedIds.filter((selectedId) => selectedId !== this.doNotKnowOption.id);

    this.form.patchValue({ selectedDelegatedHealthcareActivities: checkboxesValue });

    this.isDoNotKnowChecked = selectedIds.includes(this.doNotKnowOption.id);
  }

  checkActivitiesOptionsClicked(clickedCheckbox: number) {
    if (!this.selectedActivitiesCheckboxes.includes(clickedCheckbox)) {
      this.selectedActivitiesCheckboxes.push(clickedCheckbox);
    } else {
      this.selectedActivitiesCheckboxes = this.selectedActivitiesCheckboxes.filter((selected) => {
        return selected !== clickedCheckbox;
      });
    }
  }

  toggleCheckbox(formIndex: any) {
    if (formIndex.value) {
      formIndex.patchValue(false);
    } else {
      formIndex.patchValue(true);
    }
  }

  onCheckboxClick(target: HTMLInputElement): void {
    const clickedId = Number(target.value);
    const formGroupArray = this.form.get('selectedDelegatedHealthcareActivities') as FormArray<FormControl>;

    const doNotKnowFormIndex = formGroupArray.at(this.delegatedHealthcareActivitiesLength);

    if (clickedId === this.doNotKnowOption.id) {
      this.selectedActivitiesCheckboxes = [];

      this.toggleCheckbox(doNotKnowFormIndex);

      this.delegatedHealthcareActivities.forEach((_activity, index) => {
        formGroupArray.at(index).patchValue(false);
      });
      this.isDoNotKnowChecked = doNotKnowFormIndex.value ? true : false;
    } else {
      this.checkActivitiesOptionsClicked(clickedId);
      const activityIndex = formGroupArray.at(clickedId - 1);

      this.toggleCheckbox(activityIndex);

      doNotKnowFormIndex.patchValue(false);
      this.isDoNotKnowChecked = false;
    }
  }

  protected generateUpdateProps(): any {
    const { selectedDelegatedHealthcareActivities } = this.form.value;
    const isNull = (currentValue) => currentValue === null;

    if (selectedDelegatedHealthcareActivities.every(isNull)) {
      return null;
    }

    let activities = this.allDelegatedHealthcareActivitiesOptions
      .filter((_answer, index) => selectedDelegatedHealthcareActivities[index])
      .map((selectedActivity) => {
        return { id: selectedActivity.id };
      });

    const knowWhatActivities = this.isDoNotKnowChecked ? "Don't know" : activities.length > 0 ? 'Yes' : null;

    if (knowWhatActivities === "Don't know" || activities.length === 0) {
      activities = null;
    }

    return { knowWhatActivities, activities };
  }

  protected updateEstablishment(props: any): void {
    if (!props) {
      return;
    }

    this.subscriptions.add(
      this.establishmentService.updateStaffKindDelegatedHealthcareActivities(this.establishment.uid, props).subscribe(
        (data) => this._onSuccess(data),
        (error) => this.onError(error),
      ),
    );
  }

  protected setBackLink(): void {
    const isInWorkflow = !this.return;

    const previousPage = this.previousRouteService.getPreviousPage();
    const previousPageWasStaffDoDHA = previousPage === 'staff-do-delegated-healthcare-activities';

    if (isInWorkflow || previousPageWasStaffDoDHA) {
      this.back = { url: this.previousRoute };
    } else {
      this.back = this.return;
    }

    this.backService.setBackLink(this.back);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
