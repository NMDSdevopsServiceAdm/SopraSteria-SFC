import * as moment from 'moment';
import { Component, OnDestroy, OnInit, Input } from '@angular/core';
import { EstablishmentService } from '@core/services/establishment.service';
import { Subscription } from 'rxjs';
import { Worker } from '@core/model/worker.model';
import { WorkerService } from '@core/services/worker.service';

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
  @Input() displayWDFReport;

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

  private lastUpdated(timestamp: string): string {
    const lastUpdated: moment.Moment = moment(timestamp);
    const isToday: boolean = moment().isSame(lastUpdated, 'day');

    return isToday ? 'Today' : lastUpdated.format('D MMMM YYYY');
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
