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
  public staffRecordsDifference: number;

  ngOnInit() {
    this.setMessage();
    this.setIcon();
  }

  ngOnChanges() {
    this.setMessage();
    this.setIcon();
  }

  public setMessage(): void {
    this.calculateStaffRecordsDifference();
    if (this.workplace.numberOfStaff > this.workerCount) {
      this.staffMismatchMessage = `You've ${this.staffRecordsDifference} more staff than staff records.`;
      return;
    }
    if (this.workplace.numberOfStaff < this.workerCount) {
      this.staffMismatchMessage = `You've ${
        this.staffRecordsDifference
      } more staff ${this.pluralizeRecords()} than staff.`;
      return;
    }
  }

  public setIcon(): void {
    if (this.overallWdfEligibility == true) {
      this.icon = 'flag-orange';
      return;
    }
    if (this.overallWdfEligibility == false) {
      this.icon = 'cross-icon';
      return;
    }
  }

  private calculateStaffRecordsDifference(): void {
    if (this.workplace.numberOfStaff > this.workerCount) {
      this.staffRecordsDifference = this.workplace.numberOfStaff - this.workerCount;
      return;
    }
    if (this.workplace.numberOfStaff < this.workerCount) {
      this.staffRecordsDifference = this.workerCount - this.workplace.numberOfStaff;
      return;
    }
  }

  private pluralizeRecords() {
    return this.staffRecordsDifference > 1 ? 'records' : 'record';
  }
}
