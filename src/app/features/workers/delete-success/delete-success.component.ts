import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WorkerService } from '@core/services/worker.service';

@Component({
  selector: 'app-delete-success',
  templateUrl: './delete-success.component.html',
  styleUrls: ['./delete-success.component.scss'],
})
export class DeleteSuccessComponent implements OnInit {
  public nameOrId: string;
  constructor(private router: Router, private workerService: WorkerService) {}

  ngOnInit() {
    this.nameOrId = this.workerService.lastDeleted;
    if (!this.nameOrId) {
      this.router.navigate(['/dashboard'], { replaceUrl: true });
    }

    this.workerService.clearLastDeleted();
  }
}
