import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EstablishmentService } from '@core/services/establishment.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-confirm-starters',
  templateUrl: './confirm-starters.component.html',
})
export class ConfirmStartersComponent implements OnInit, OnDestroy {
  private subscriptions = [];

  total: number;

  constructor(private router: Router, private establishmentService: EstablishmentService) {}

  makeChangeHandler() {
    this.router.navigate(['/workplace', 'starters']);
  }

  submitHandler() {
    this.router.navigate(['/workplace', 'leavers']);
  }

  ngOnInit() {
    this.subscriptions.push(
      this.establishmentService
        .getJobs()
        .pipe(map(jobs => jobs.TotalStarters))
        .subscribe(total => (this.total = total))
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}
