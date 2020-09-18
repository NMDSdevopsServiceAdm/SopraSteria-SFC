import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { Worker } from '@core/model/worker.model';
import { WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-check-staff-record',
  templateUrl: './check-staff-record.component.html',
})
export class CheckStaffRecordComponent implements OnInit {
  public worker: Worker;
  public workplace: Establishment;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private workerService: WorkerService,
  ) {}

  ngOnInit() {
    this.workplace = this.route.parent.snapshot.data.establishment;
    this.workerService.worker$.pipe(take(1)).subscribe((worker) => {
      this.worker = worker;
    });
  }

  saveAndComplete() {
    const props = {
      completed: true,
    };

    this.subscriptions.add(
      this.workerService.updateWorker(this.workplace.uid, this.worker.uid, props).subscribe(
        (data) => {
          this.workerService.setState({ ...this.worker, ...data });
          this.router.navigate(['/workplace', this.workplace.uid, 'staff-record', this.worker.uid, 'save-success']);
        },
        (error) => {
          console.log(error);
        },
      ),
    );
  }

  goBack(event) {
    event.preventDefault();
    this.location.back();
  }
}
