import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Establishment } from '@core/model/establishment.model';
import { Worker } from '@core/model/worker.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-mandatory-details',
  templateUrl: './mandatory-details.component.html',
})
export class MandatoryDetailsComponent implements OnInit, OnDestroy {
  public worker: Worker;
  public workplace: Establishment;
  public primaryWorkplace: Establishment;
  public subscriptions: Subscription = new Subscription();

  constructor(
    private breadcrumbService: BreadcrumbService,
    private route: ActivatedRoute,
    private workerService: WorkerService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.workplace = this.route.parent.snapshot.data.establishment;
    this.primaryWorkplace = this.route.parent.snapshot.data.primaryWorkplace;

    this.subscriptions.add(
      this.workerService.worker$.pipe(take(1)).subscribe((worker) => {
        this.worker = worker;
      }),
    );

    this.breadcrumbService.show(JourneyType.MY_WORKPLACE);
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
    this.router.navigate([url, 'main-job-start-date']);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
