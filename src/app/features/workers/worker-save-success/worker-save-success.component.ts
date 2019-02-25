import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  templateUrl: 'worker-save-success.component.html',
  styleUrls: ['worker-save-success.component.scss'],
})
export class WorkerSaveSuccessComponent {
  constructor(private router: Router) {}

  addAnotherRecord() {
    this.router.navigate(['/worker/create-staff-record']);
  }

  returnToDashboard() {
    this.router.navigate(['/dashboard']);
  }
}
