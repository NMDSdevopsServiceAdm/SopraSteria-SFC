import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { Worker } from '@core/model/worker.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkerService } from '@core/services/worker.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-wdf-worker',
  templateUrl: './wdf-worker.component.html',
})
export class WdfWorkerComponent implements OnInit {
  public worker: Worker;
  public workplace: Establishment;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private workerService: WorkerService,
    private establishmentService: EstablishmentService
  ) {}

  ngOnInit() {
    this.workplace = this.establishmentService.establishment;
    this.workerService.setState(this.route.snapshot.data.worker);

    this.workerService.worker$.pipe(take(1)).subscribe(worker => {
      this.worker = worker;
    });
  }

  public saveAndComplete() {
    this.workerService
      .updateWorker(this.worker.uid, {
        completed: true,
      })
      .pipe(take(1))
      .subscribe(() => {
        this.router.navigate(['/workplace', this.workplace.uid, 'reports', 'wdf'], { fragment: 'staff-records' });
      });
  }
}
