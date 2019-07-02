import { Component, OnInit } from '@angular/core';
import { BackService } from '@core/services/back.service';

@Component({
  selector: 'app-create-staff-record-start-screen',
  templateUrl: './create-staff-record-start-screen.component.html',
})
export class CreateStaffRecordStartScreenComponent implements OnInit {
  constructor(private backService: BackService) {}

  ngOnInit() {
    this.backService.setBackLink({ url: ['/dashboard'], fragment: 'staff-records' });
  }
}
