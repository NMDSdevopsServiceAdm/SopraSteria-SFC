import { Component, OnInit } from '@angular/core';
import { Question } from '../question/question.component';
import { UntypedFormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertService } from '@core/services/alert.service';
import { BackService } from '@core/services/back.service';
import { CareWorkforcePathwayService } from '@core/services/care-workforce-pathway.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkplaceFlowSections } from '@core/utils/progress-bar-util';
import { DelegatedHealthcareActivity } from '@core/model/delegated-healthcare-activites.model';

@Component({
  selector: 'app-staff-what-kind-of-delegated-healthcare-activites',
  templateUrl: './staff-what-kind-of-delegated-healthcare-activites.component.html',
})
export class StaffWhatKindOfDelegatedHealthcareActivitiesComponent extends Question implements OnInit {
  public section = WorkplaceFlowSections.SERVICES;
  public delegatedHealthCareActivities: DelegatedHealthcareActivity[];
  public doNotKnowOption = { id: 99, seq: 900, title: 'I do not know' };
  public allDelegatedHealthCareActivitiesOptions: any[];
  public isDoNotKnowChecked: boolean = false;
  public delegatedHealthCareActivitiesLength: number;

  public check_box_type = {
    0: 'ACTIVITY',
    1: 'DONT_KNOW',
    2: 'NONE',
    ACTIVITY: 0,
    DONT_KNOW: 1,
    NONE: 2,
  };
  public currentlyChecked: number;
  public selectedCheckboxes: any = [];

  constructor(
    protected formBuilder: UntypedFormBuilder,
    protected router: Router,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected establishmentService: EstablishmentService,
    protected careWorkforcePathwayService: CareWorkforcePathwayService,
    protected route: ActivatedRoute,
    private alertService: AlertService,
  ) {
    super(formBuilder, router, backService, errorSummaryService, establishmentService);
  }

  init(): void {
    this.delegatedHealthCareActivities = this.route.snapshot.data.delegatedHealthcareActivities;
    this.delegatedHealthCareActivitiesLength = this.delegatedHealthCareActivities.length;
    this.doNotKnowOption = { id: this.delegatedHealthCareActivitiesLength + 1, seq: 900, title: 'I do not know' };
    this.allDelegatedHealthCareActivitiesOptions = [...this.delegatedHealthCareActivities, this.doNotKnowOption];
    this.setupForm();
    this.prefill();
    this.skipRoute = ['/workplace', this.establishment.uid, 'staff-recruitment-capture-training-requirement'];
    this.setPreviousRoute();
  }

  private setPreviousRoute(): void {
    this.previousRoute = ['/workplace', this.establishment.uid, 'staff-do-delegated-healthcare-activities'];
  }

  setupForm() {
    this.form = this.formBuilder.group(
      {
        selectedDelegatedHealthcareActivities: this.formBuilder.array(
          this.allDelegatedHealthCareActivitiesOptions.map(() => null),
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

    const { whatDelegateHealthcareActivities, activities } = staffWhatKindDelegatedHealthcareActivities;

    let previouslySaved = [];

    if (whatDelegateHealthcareActivities === "Don't know") {
      previouslySaved = [this.doNotKnowOption];
      this.isDoNotKnowChecked = true;
    } else if (whatDelegateHealthcareActivities === 'Yes' && activities && activities.length > 0) {
      previouslySaved = activities;
    }

    this.prefillCheckboxes(previouslySaved);
  }

  private prefillCheckboxes(previouslySavedOptions) {
    const selectedIds = previouslySavedOptions.map((previouslySavedOption) => previouslySavedOption.id);

    const checkboxesValue = this.allDelegatedHealthCareActivitiesOptions.map((activity) =>
      selectedIds.includes(activity.id),
    );

    this.selectedCheckboxes = selectedIds;

    this.form.patchValue({ selectedDelegatedHealthcareActivities: checkboxesValue });
  }

  checkOptionsClicked(clickedCheckbox: number) {
    if (!this.selectedCheckboxes.includes(clickedCheckbox)) {
      this.selectedCheckboxes.push(clickedCheckbox);
    } else {
      this.selectedCheckboxes = this.selectedCheckboxes.filter((selected) => {
        return selected !== clickedCheckbox;
      });
    }
  }

  onCheckboxClick(target: HTMLInputElement): void {
    const clickedId = Number(target.value);

    if (clickedId === this.doNotKnowOption.id) {
      this.isDoNotKnowChecked = true;
      this.selectedCheckboxes = [];
    } else {
      this.isDoNotKnowChecked = false;
      this.checkOptionsClicked(Number(target.value));
    }
  }

  protected generateUpdateProps(): any {
    const { selectedDelegatedHealthcareActivities } = this.form.value;
    if (!selectedDelegatedHealthcareActivities) {
      return null;
    }

    let whatDelegateHealthcareActivities: string;

    const activities = this.allDelegatedHealthCareActivitiesOptions
      .filter((_answer, index) => selectedDelegatedHealthcareActivities[index])
      .map((selectedActivity) => {
        if (selectedActivity.id === this.doNotKnowOption.id) {
          whatDelegateHealthcareActivities = "Don't know";
        } else if (this.delegatedHealthCareActivities.includes(selectedActivity)) {
          whatDelegateHealthcareActivities = 'Yes';
        }
        return { id: selectedActivity.id };
      });

    return { whatDelegateHealthcareActivities, activities };
  }

  protected updateEstablishment(props: any): void {
    if (!props && !props.whatDelegateHealthcareActivities) {
      return;
    }

    this.subscriptions.add(
      this.establishmentService.updateStaffKindDelegatedHealthcareActivities(this.establishment.uid, props).subscribe(
        (data) => this._onSuccess(data),
        (error) => this.onError(error),
      ),
    );
  }

  protected onSuccess(): void {
    this.nextRoute = this.skipRoute;
  }
}
