import { Component, Input, OnInit } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';

@Component({
  selector: 'app-wdf-staff-mismatch-message',
  templateUrl: './wdf-staff-mismatch-message.component.html',
})
export class WdfStaffMismatchMessageComponent implements OnInit {
  @Input() workplace: Establishment;
  @Input() workerCount: number;
  @Input() overallWdfEligibility: boolean;
  public staffMismatchMessage: string;
  public icon: string;

  ngOnInit() {
    this.setMessage();
    this.setIcon();
  }

  ngOnChanges() {
    if (this.workerCount) {
      this.setMessage();
    }
  }

  public setMessage(): void {
    if (this.workplace.numberOfStaff > this.workerCount) {
      this.staffMismatchMessage = "You've more staff than staff records.";
      return;
    }
    if (this.workplace.numberOfStaff < this.workerCount) {
      this.staffMismatchMessage = "You've more staff records than staff.";
      return;
    }
  }

  public setIcon(): void {
    if (this.overallWdfEligibility == true) {
      this.icon = 'flag-orange';
      return;
    }
    if (this.overallWdfEligibility == false) {
      this.icon = 'flag-red';
      return;
    }
  }
}
