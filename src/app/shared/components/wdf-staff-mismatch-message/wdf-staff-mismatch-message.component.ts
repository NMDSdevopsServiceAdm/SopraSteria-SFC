import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { URLStructure } from '@core/model/url.model';
import { EstablishmentService } from '@core/services/establishment.service';

@Component({
  selector: 'app-wdf-staff-mismatch-message',
  templateUrl: './wdf-staff-mismatch-message.component.html',
})
export class WdfStaffMismatchMessageComponent implements OnInit, OnChanges {
  @Input() public workplace: Establishment;
  @Input() public workerCount: number;
  @Input() public overallWdfEligibility: boolean;
  public staffMismatchMessage: string;
  public addOrDeleteRecordsMessage: string;
  public icon: string;
  public staffRecordsDifference: number;
  public staffRecordsUrl: URLStructure;
  public primaryWorkplaceUid: string;

  constructor(private route: ActivatedRoute, private establishmentService: EstablishmentService) {}

  ngOnInit() {
    this.primaryWorkplaceUid = this.establishmentService.primaryWorkplace.uid;
    this.setStaffRecordsUrl();
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
      this.addOrDeleteRecordsMessage = 'add more records';
      return;
    }
    if (this.workplace.numberOfStaff < this.workerCount) {
      this.staffMismatchMessage = `You've ${
        this.staffRecordsDifference
      } more staff ${this.pluralizeRecords()} than staff.`;
      this.addOrDeleteRecordsMessage = 'delete some records';
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

  public setStaffRecordsUrl(): void {
    if (this.route.snapshot.params.establishmentuid && this.primaryWorkplaceUid !== this.workplace.uid) {
      this.staffRecordsUrl = { url: ['/workplace', this.workplace.uid], fragment: 'staff-records' };
    } else {
      this.staffRecordsUrl = { url: ['/dashboard'], fragment: 'staff-records' };
    }
  }
}
