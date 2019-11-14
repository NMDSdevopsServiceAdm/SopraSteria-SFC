import { Component, Input, OnInit } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import * as moment from 'moment';

@Component({
  selector: 'app-training-and-qualifications-summary',
  templateUrl: './training-and-qualifications-summary.component.html',
})
export class TrainingAndQualificationsSummaryComponent implements OnInit {
  @Input() workplace: Establishment;
  @Input() workers: Array<Worker>;
  @Input() wdfView = false;
  public canViewWorker: boolean;
  public canEditWorker: boolean;
  public sortStaffOptions;
  public workersData: Array<Worker>;

  constructor(private permissionsService: PermissionsService) {}

  public lastUpdated(timestamp: string): string {
    const lastUpdated: moment.Moment = moment(timestamp);
    const isToday: boolean = moment().isSame(lastUpdated, 'day');
    return isToday ? 'Today' : lastUpdated.format('D MMMM YYYY');
  }

  public getWorkerRecordPath(worker: Worker) {
    //const path = ['/workplace', this.workplace.uid, 'staff-record', worker.uid];
    return '#';
  }
  ngOnInit() {
    this.canViewWorker = this.permissionsService.can(this.workplace.uid, 'canViewWorker');
    this.canEditWorker = this.permissionsService.can(this.workplace.uid, 'canEditWorker');
  }
}
