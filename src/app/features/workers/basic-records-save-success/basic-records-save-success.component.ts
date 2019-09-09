import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkerService } from '@core/services/worker.service';

@Component({
  selector: 'app-basic-records-save-success',
  templateUrl: './basic-records-save-success.component.html',
})
export class BasicRecordsSaveSuccessComponent implements OnInit, OnDestroy {
  public total: number;
  public returnToWDF = false;
  public returnUrl;

  constructor(private route: ActivatedRoute, private router: Router, private workerService: WorkerService) {}

  ngOnInit() {
    this.total = this.workerService.getCreateStaffResponse();

    this.returnUrl =
      this.route.snapshot.data.primaryWorkplace &&
      this.route.snapshot.data.establishment.uid === this.route.snapshot.data.primaryWorkplace.uid
        ? ['/dashboard']
        : ['/workplace', this.route.snapshot.data.establishment.uid];

    if (this.total === 0) {
      this.router.navigate(this.returnUrl, { fragment: 'staff-records', replaceUrl: true });
    }
    this.returnToWDF = this.workerService.returnTo && [...this.workerService.returnTo.url].pop() === 'wdf';
  }

  ngOnDestroy() {
    this.workerService.setReturnTo(null);
    this.workerService.addStaffRecordInProgress$.next(false);
  }

  get returnTo() {
    if (this.returnToWDF) {
      return {
        link: this.workerService.returnTo.url,
        fragment: this.workerService.returnTo.fragment,
        label: 'Return to the WDF Report',
      };
    }
    return {
      link: this.returnUrl,
      fragment: 'staff-records',
      label: 'Go to staff records',
    };
  }
}
