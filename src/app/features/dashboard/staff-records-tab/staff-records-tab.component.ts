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
  private subscriptions: Subscription = new Subscription();
  public createStaffResponse = null;
  public errors;
  public incomplete = 0;
  public totalStaff: number;
  public workers: Worker[];

  constructor(private establishmentService: EstablishmentService, private workerService: WorkerService) {}

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
