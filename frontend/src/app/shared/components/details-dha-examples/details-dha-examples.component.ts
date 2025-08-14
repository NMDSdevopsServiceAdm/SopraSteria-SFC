import { Component, Input } from '@angular/core';
import { DelegatedHealthcareActivity } from '@core/model/delegated-healthcare-activities.model';
import { lowerFirst } from 'lodash';
import lodash from 'lodash';

@Component({
  selector: 'app-details-dha-examples',
  templateUrl: './details-dha-examples.component.html',
  styleUrl: './details-dha-examples.component.scss',
})
export class DetailsDhaExamplesComponent {
  @Input() allDHAs: Array<DelegatedHealthcareActivity>;
  @Input() staffWhatKindDelegatedHealthcareActivities: any;

  public title: string;
  public shouldShowSelectedActivities: boolean = false;
  public selectedActivities: Array<DelegatedHealthcareActivity>;

  ngOnInit(): void {
    const activitiesFromWorkplaceAnswer = this.staffWhatKindDelegatedHealthcareActivities?.activities;

    if (Array.isArray(activitiesFromWorkplaceAnswer) && activitiesFromWorkplaceAnswer.length > 0) {
      this.showSelectedActivities(activitiesFromWorkplaceAnswer);
    } else {
      this.showAllExampleActivities();
    }
  }

  private showSelectedActivities(activitiesFromWorkplaceAnswer: Array<Partial<DelegatedHealthcareActivity>>): void {
    this.title = 'See the delegated healthcare activities that your staff carry out';
    this.shouldShowSelectedActivities = true;

    const idsOfSelectedActivities = activitiesFromWorkplaceAnswer.map((activity) => activity.id);
    this.selectedActivities = this.allDHAs
      .filter((activity) => idsOfSelectedActivities.includes(activity.id))
      .map((activity) => ({
        ...activity,
        title: lodash.lowerFirst(activity.title),
      }));
  }

  private showAllExampleActivities(): void {
    this.title = 'See delegated healthcare activities that your staff might carry out';
  }
}
