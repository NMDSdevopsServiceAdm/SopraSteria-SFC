import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Worker } from '@core/model/worker.model';
import { WorkerEditResponse, WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-check-staff-record',
  templateUrl: './check-staff-record.component.html',
})
export class CheckStaffRecordComponent implements OnInit {
  private worker: Worker;
  private subscriptions: Subscription = new Subscription();

  constructor(private router: Router, private workerService: WorkerService) {}

  ngOnInit() {
    this.workerService.worker$.pipe(take(1)).subscribe(worker => {
      this.worker = worker;
    });
  }

  async saveAndComplete() {
    try {
      await this.setWorkerCompleted();

      this.router.navigate(['/worker/save-success']);
    } catch (err) {
      // keep typescript transpiler silent
    }
  }

  setWorkerCompleted(): Promise<WorkerEditResponse> {
    return new Promise((resolve, reject) => {
      const props = {
        completed: true,
      };

      this.subscriptions.add(
        this.workerService.updateWorker(this.worker.uid, props).subscribe(data => {
          this.workerService.setState({ ...this.worker, ...data });
          resolve();
        }, reject)
      );
    });
  }
}
