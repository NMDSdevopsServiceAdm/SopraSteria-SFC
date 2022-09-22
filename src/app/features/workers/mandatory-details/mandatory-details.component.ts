import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Establishment } from '@core/model/establishment.model';
import { Worker } from '@core/model/worker.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { ProgressBarUtil } from '@core/utils/progress-bar-util';
import { BackService } from '@core/services/back.service';

@Component({
  selector: 'app-mandatory-details',
  templateUrl: './mandatory-details.component.html',
})
export class MandatoryDetailsComponent implements OnInit, OnDestroy {
  public worker: Worker;
  public workplace: Establishment;
  public primaryWorkplace: Establishment;
  public subscriptions: Subscription = new Subscription();
  public staffRecordSections: ProgressBarUtil;

  constructor(
    private backService: BackService,
    private route: ActivatedRoute,
    private workerService: WorkerService,
    private router: Router,
    private establishmentService: EstablishmentService,
  ) {}

  ngOnInit(): void {
    this.workplace = this.route.parent.snapshot.data.establishment;
    this.primaryWorkplace = this.route.parent.snapshot.data.primaryWorkplace;
    this.staffRecordSections = ProgressBarUtil.staffRecordMiniFlowProgressBarSections();

    this.subscriptions.add(
      this.workerService.worker$.pipe(take(1)).subscribe((worker) => {
        this.worker = worker;
      }),
    );

    this.setBackLink();
  }

  public setBackLink(): void {
    const url = { url: ['/dashboard'], fragment: 'staff-records' };
    this.backService.setBackLink(url);
  }

  navigateToDashboard(event: Event): void {
    event.preventDefault();
    const url = this.primaryWorkplace?.uid === this.workplace.uid ? ['/dashboard'] : ['/workplace', this.workplace.uid];
    this.router.navigate(url, { fragment: 'staff-records' });
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    const urlArr = this.router.url.split('/');
    const url = urlArr.slice(0, urlArr.length - 1).join('/');
    this.router.navigate([url, 'main-job-start-date'], {
      state: {
        navigatedFrom: 'mandatory-details',
      },
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
