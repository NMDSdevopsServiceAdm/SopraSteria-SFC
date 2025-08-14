import { Component, OnInit } from '@angular/core';
import { Question } from '../question/question.component';
import { FormArray, UntypedFormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertService } from '@core/services/alert.service';
import { BackService } from '@core/services/back.service';
import { CareWorkforcePathwayService } from '@core/services/care-workforce-pathway.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkplaceFlowSections } from '@core/utils/progress-bar-util';
import { DelegatedHealthcareActivity } from '@core/model/delegated-healthcare-activities.model';

@Component({
  selector: 'app-staff-what-kind-of-delegated-healthcare-activities',
  templateUrl: './staff-what-kind-of-delegated-healthcare-activities.component.html',
})
export class StaffWhatKindOfDelegatedHealthcareActivitiesComponent extends Question implements OnInit {
  public section = WorkplaceFlowSections.SERVICES;
  public delegatedHealthcareActivities: DelegatedHealthcareActivity[];
  public doNotKnowOption: any = {};
  public allDelegatedHealthcareActivitiesOptions: any[];
  public isDoNotKnowChecked: boolean = false;
  public delegatedHealthcareActivitiesLength: number;
  public selectedActivitiesCheckboxes: any = [];

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
    this.delegatedHealthcareActivities = this.route.snapshot.data.delegatedHealthcareActivities;
    this.delegatedHealthcareActivitiesLength = this.delegatedHealthcareActivities.length;
    this.doNotKnowOption = { id: this.delegatedHealthcareActivitiesLength + 1, seq: 900, title: 'I do not know' };
    this.allDelegatedHealthcareActivitiesOptions = [...this.delegatedHealthcareActivities, this.doNotKnowOption];
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

    const checkboxesValue = this.allDelegatedHealthcareActivitiesOptions.map((activity) =>
      selectedIds.includes(activity.id),
    );

    this.selectedActivitiesCheckboxes = selectedIds.filter((id) => {
      id !== this.doNotKnowOption.id;
    });

    this.form.patchValue({ selectedDelegatedHealthcareActivities: checkboxesValue });
  }

  checkOptionsClicked(clickedCheckbox: number) {
    if (!this.selectedActivitiesCheckboxes.includes(clickedCheckbox)) {
      this.selectedActivitiesCheckboxes.push(clickedCheckbox);
    } else {
      this.selectedActivitiesCheckboxes = this.selectedActivitiesCheckboxes.filter((selected) => {
        return selected !== clickedCheckbox;
      });
    }
  }

  onCheckboxClick(target: HTMLInputElement): void {
    const clickedId = Number(target.value);

    if (clickedId === this.doNotKnowOption.id) {
      this.isDoNotKnowChecked = true;
      this.selectedActivitiesCheckboxes = [];

      if (
        (this.form.get('selectedDelegatedHealthcareActivities') as FormArray).at(
          this.delegatedHealthcareActivitiesLength,
        ).value
      ) {
        (this.form.get('selectedDelegatedHealthcareActivities') as FormArray)
          .at(this.delegatedHealthcareActivitiesLength)
          .patchValue(false);
      } else {
        (this.form.get('selectedDelegatedHealthcareActivities') as FormArray)
          .at(this.delegatedHealthcareActivitiesLength)
          .patchValue(true);
      }

      this.delegatedHealthcareActivities.forEach((activity, index) => {
        (this.form.get('selectedDelegatedHealthcareActivities') as FormArray).at(index).patchValue(false);
      });
    } else {
      this.isDoNotKnowChecked = false;
      this.checkOptionsClicked(clickedId);

      if ((this.form.get('selectedDelegatedHealthcareActivities') as FormArray).at(clickedId - 1).value) {
        (this.form.get('selectedDelegatedHealthcareActivities') as FormArray).at(clickedId - 1).patchValue(false);
      } else {
        (this.form.get('selectedDelegatedHealthcareActivities') as FormArray).at(clickedId - 1).patchValue(true);
      }

      (this.form.get('selectedDelegatedHealthcareActivities') as FormArray)
        .at(this.delegatedHealthcareActivitiesLength)
        .patchValue(false);
    }

    console.log(this.form.value.selectedDelegatedHealthcareActivities);
  }

  protected generateUpdateProps(): any {
    const { selectedDelegatedHealthcareActivities } = this.form.value;

    if (!selectedDelegatedHealthcareActivities) {
      return null;
    }

    let whatDelegateHealthcareActivities: string;

    const activities = this.allDelegatedHealthcareActivitiesOptions
      .filter((_answer, index) => selectedDelegatedHealthcareActivities[index])
      .map((selectedActivity) => {
        if (selectedActivity.id === this.doNotKnowOption.id) {
          whatDelegateHealthcareActivities = "Don't know";
        } else if (this.delegatedHealthcareActivities.includes(selectedActivity)) {
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

    console.log(props);

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
