import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Establishment } from '@core/model/establishment.model';
import { Worker } from '@core/model/worker.model';
import { BackLinkService } from '@core/services/backLink.service';

import { PermissionsService } from '@core/services/permissions/permissions.service';
import dayjs from 'dayjs';

@Component({
    selector: 'app-staff-basic-record',
    templateUrl: './staff-basic-record.component.html',
    standalone: false
})
export class StaffBasicRecord implements OnInit, OnDestroy {
  public workplace: Establishment;

  public workerCount: number;
  public canEditWorker: boolean;
  public canViewWorker: boolean;
  public workerNotCompleted: Worker[];

  constructor(
    private router: Router,
    protected backLinkService: BackLinkService,
    private route: ActivatedRoute,
    private permissionsService: PermissionsService,
  ) {}

  ngOnInit(): void {
    this.workplace = this.route.snapshot.data.establishment;
    const { workersNotCompleted } = this.route.snapshot.data.workers;
    this.workerCount = workersNotCompleted?.length;
    this.canEditWorker = this.permissionsService.can(this.workplace.uid, 'canEditWorker');
    this.canViewWorker = this.permissionsService.can(this.workplace.uid, 'canViewWorker');

    this.workerNotCompleted = this.getWorkersNotCompleted(workersNotCompleted);

    this.setBackLink();
  }

  getWorkersNotCompleted(workersNotCompleted: any) {
    return workersNotCompleted.map((worker: any) => worker);
  }

  public getWorkerRecordPath(event: Event, worker: Worker) {
    event.preventDefault();
    this.router.navigate(['/workplace', this.workplace.uid, 'staff-record', worker.uid, 'staff-record-summary']);
  }

  public lastUpdated(timestamp: string): string {
    const lastUpdated: dayjs.Dayjs = dayjs(timestamp);
    const isToday: boolean = dayjs().isSame(lastUpdated, 'day');
    return isToday ? 'Today' : lastUpdated.format('D MMM YYYY');
  }

  protected setBackLink(): void {
    this.backLinkService.showBackLink();
  }

  ngOnDestroy(): void {}
}
