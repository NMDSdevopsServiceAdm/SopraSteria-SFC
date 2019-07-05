import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Worker } from '@core/model/worker.model';
import { WorkerService } from '@core/services/worker.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-wdf-worker',
  templateUrl: './wdf-worker.component.html',
})
export class WdfWorkerComponent implements OnInit {
  public worker: Worker;

  constructor(private router: Router, private route: ActivatedRoute, private workerService: WorkerService) {}

  ngOnInit() {
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
        this.router.navigate(['/reports', 'wdf'], { fragment: 'staff-records' });
      });
  }
}
