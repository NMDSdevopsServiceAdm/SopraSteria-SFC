import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { Worker } from '@core/model/worker.model';
import { BackService } from '@core/services/back.service';
import { BackLinkService } from '@core/services/backLink.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkerService } from '@core/services/worker.service';
import { ProgressBarUtil } from '@core/utils/progress-bar-util';
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
  public staffRecordSections: ProgressBarUtil;

  constructor(
    private backService: BackService,
    protected backLinkService: BackLinkService,
    private route: ActivatedRoute,
    private workerService: WorkerService,
    private router: Router,
    private establishmentService: EstablishmentService,
  ) {}

  ngOnInit(): void {
    this.workplace = this.route.parent.snapshot.data.establishment;
    this.primaryWorkplace = this.route.parent.snapshot.data.primaryWorkplace;
    this.staffRecordSections = ProgressBarUtil.staffRecordProgressBarSections();

    this.subscriptions.add(
      this.workerService.worker$.pipe(take(1)).subscribe((worker) => {
        this.worker = worker;
      }),
    );

    this.setBackLink();
  }

  public setBackLink(): void {
    this.backLinkService.showBackLink();
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
    this.router.navigate([url, 'date-of-birth']);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
