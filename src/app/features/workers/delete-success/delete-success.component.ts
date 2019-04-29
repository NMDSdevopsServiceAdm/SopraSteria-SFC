import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { WorkerService } from '@core/services/worker.service';

@Component({
  selector: 'app-delete-success',
  templateUrl: './delete-success.component.html',
})
export class DeleteSuccessComponent implements OnInit {
  public nameOrId: string;
  constructor(private router: Router, private backService: BackService, private workerService: WorkerService) {}

  ngOnInit() {
    this.backService.setBackLink({ url: ['/dashboard'], fragment: 'staff-records' });

    this.nameOrId = this.workerService.lastDeleted;
    // if (!this.nameOrId) {
    //   this.router.navigate(['/dashboard'], { replaceUrl: true });
    // }

    this.workerService.clearLastDeleted();
  }
}
