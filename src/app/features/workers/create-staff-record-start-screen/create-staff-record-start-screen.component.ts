import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-staff-record-start-screen',
  templateUrl: './create-staff-record-start-screen.component.html',
})
export class CreateStaffRecordStartScreenComponent {
  constructor(private router: Router) {}

  addWorker() {
    this.router.navigate(['/worker/create-staff-record']);
  }
}
