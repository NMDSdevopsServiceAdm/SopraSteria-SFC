import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WorkerService } from '@core/services/worker.service';

@Component({
  selector: 'app-basic-records-save-success',
  templateUrl: './basic-records-save-success.component.html',
})
export class BasicRecordsSaveSuccessComponent implements OnInit, OnDestroy {
  public total: number;
  public returnToWDF = false;

  constructor(private router: Router, private workerService: WorkerService) {}

  ngOnInit() {
    this.total = this.workerService.getCreateStaffResponse();
    if (this.total === 0) {
      this.router.navigate(['/dashboard'], { fragment: 'staff-records', replaceUrl: true });
    }
    this.returnToWDF = this.workerService.returnTo && [...this.workerService.returnTo.url].pop() === 'wdf';
  }

  ngOnDestroy() {
    this.workerService.setReturnTo(null);
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
      link: ['/dashboard'],
      fragment: 'staff-records',
      label: 'Go to staff records',
    };
  }
}
