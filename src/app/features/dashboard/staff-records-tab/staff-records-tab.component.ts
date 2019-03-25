import { Component, OnDestroy, OnInit } from '@angular/core';
import { Worker } from '@core/model/worker.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-staff-records-tab',
  templateUrl: './staff-records-tab.component.html',
})
export class StaffRecordsTabComponent implements OnInit, OnDestroy {
  public createStaffResponse = null;
  public workers: Worker[];
  public totalStaff: number;
  public errors;
  public incomplete = 0;
  private subscriptions: Subscription = new Subscription();

  constructor(private establishmentService: EstablishmentService, private workerService: WorkerService) {}

  get addMore() {
    return `
      You said you have ${this.totalStaff} members of staff.<br />
      You need to update your Number of Staff or complete ${this.totalStaff - this.workers.length} more staff records.
    `;
  }

  get removeRecords() {
    return `
      You have created more staff records than you have members of staff (${this.totalStaff}).<br />
      You need to update your Number of Staff to ${this.workers.length} or delete some records.
    `;
  }

  ngOnInit() {
    this.subscriptions.add(
      this.workerService.getAllWorkers().subscribe(data => {
        this.workers = data;
        this.incomplete = this.workers.filter(worker => !worker.completed).length;
      })
    );

    this.subscriptions.add(
      this.establishmentService.getStaff().subscribe(totalStaff => {
        this.totalStaff = totalStaff;
      })
    );

    this.createStaffResponse = this.workerService.getCreateStaffResponse();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
