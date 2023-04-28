import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { Worker } from '@core/model/worker.model';

@Component({
  selector: 'app-staff-basic-record',
  templateUrl: './staff-basic-record.component.html',
})
export class StaffBasicRecord implements OnInit, OnDestroy {
  public workers: Worker[];
  public workplace: Establishment;

  public workerCount: number;
  public workerNotCompleted: Worker[];

  constructor(
    private router: Router,

    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.workplace = this.route.snapshot.data.primaryWorkplace;
    const { workers, workerCount = 0 } = this.route.snapshot.data.workers;
    this.workers = workers;

    this.workerCount = workerCount;

    this.getWorkersCompleted();
  }

  getWorkersCompleted() {
    this.workerNotCompleted = this.workers.filter((worker) => worker.completed === false);
    return this.workerNotCompleted;
  }

  public returnToHome(): void {
    const returnLink = this.router.navigate(['/dashboard'], { fragment: 'home' });
  }

  ngOnDestroy(): void {}
}
