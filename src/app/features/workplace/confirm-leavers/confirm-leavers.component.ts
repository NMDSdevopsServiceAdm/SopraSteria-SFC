import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EstablishmentService } from '@core/services/establishment.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-confirm-leavers',
  templateUrl: './confirm-leavers.component.html',
})
export class ConfirmLeaversComponent implements OnInit, OnDestroy {
  private subscriptions = [];

  total: number;

  constructor(private router: Router, private establishmentService: EstablishmentService) {}

  ngOnInit() {
    this.subscriptions.push(
      this.establishmentService
        .getJobs()
        .pipe(map(jobs => jobs.TotalLeavers))
        .subscribe(total => (this.total = total))
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  makeChangeHandler() {
    this.router.navigate(['/workplace', 'leavers']);
  }

  submitHandler() {
    this.router.navigate(['/dashboard']);
  }
}
