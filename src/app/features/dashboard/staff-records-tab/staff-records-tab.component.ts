import { Component, OnDestroy, OnInit } from '@angular/core';
import { Worker } from '@core/model/worker.model';
import { WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-staff-records-tab',
  templateUrl: './staff-records-tab.component.html',
})
export class StaffRecordsTabComponent implements OnInit, OnDestroy {
  public createStaffResponse = null;
  public workers: Worker[];
  public incomplete = 0;
  private subscriptions: Subscription = new Subscription();

  constructor(private workerService: WorkerService) {}

  ngOnInit() {
    this.subscriptions.add(
      this.workerService.getAllWorkers().subscribe(data => {
        this.workers = data;
        this.incomplete = this.workers.filter(worker => worker.created === worker.updated).length;
      })
    );

    this.createStaffResponse = this.workerService.getCreateStaffResponse();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
