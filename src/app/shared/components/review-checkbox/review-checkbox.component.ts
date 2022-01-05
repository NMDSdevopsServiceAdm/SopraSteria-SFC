import { Component, Input } from '@angular/core';
import { CqcStatusChangeService } from '@core/services/cqc-status-change.service';
import { ParentRequestsService } from '@core/services/parent-requests.service';
import { RegistrationsService } from '@core/services/registrations.service';

@Component({
  selector: 'app-review-checkbox',
  templateUrl: './review-checkbox.component.html',
})
export class ReviewCheckboxComponent {
  @Input() public toggleCheckbox: (args: HTMLInputElement) => void;
  @Input() public getUpdatedRegistration: () => void;
  @Input() public registration;
  @Input() public userFullName: string;
  @Input() public checkBoxError: string;

  constructor(
    public registrationsService: RegistrationsService,
    public cqcStatusChangeService: CqcStatusChangeService,
    public parentRequestsService: ParentRequestsService,
  ) {}

  public setStatusClass(): string {
    return this.registration.establishment.inReview ? 'govuk-tag--blue' : 'govuk-tag--grey';
  }
}
