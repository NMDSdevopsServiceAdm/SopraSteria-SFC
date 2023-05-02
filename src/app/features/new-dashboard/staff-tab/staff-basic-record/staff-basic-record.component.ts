import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Establishment } from '@core/model/establishment.model';
import { Worker } from '@core/model/worker.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';

@Component({
  selector: 'app-staff-basic-record',
  templateUrl: './staff-basic-record.component.html',
})
export class StaffBasicRecord implements OnInit, OnDestroy {
  public workplace: Establishment;

  public workerCount: number;
  public workerNotCompleted: Worker[];

  constructor(private router: Router, private breadcrumbService: BreadcrumbService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.workplace = this.route.snapshot.data.primaryWorkplace;
    const { workersNotCompleted, workerCount } = this.route.snapshot.data.workers;
    this.workerCount = workerCount;

    this.workerNotCompleted = this.getWorkersNotCompleted(workersNotCompleted);
    this.breadcrumbService.show(JourneyType.STAFF_RECORDS_MANDATORY);
  }

  getWorkersNotCompleted(workersNotCompleted: any) {
    return workersNotCompleted.map((worker: any) => worker);
  }

  public returnToHome(): void {
    this.router.navigate(['/dashboard'], { fragment: 'home' });
  }

  ngOnDestroy(): void {}
}
