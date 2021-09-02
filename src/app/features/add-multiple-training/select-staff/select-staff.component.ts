import { Component, OnInit } from '@angular/core';
import { BackService } from '@core/services/back.service';

@Component({
  selector: 'app-select-staff',
  templateUrl: './select-staff.component.html',
})
export class SelectStaffComponent implements OnInit {
  constructor(public backService: BackService) {}

  ngOnInit(): void {
    this.setBackLink();
  }

  public setBackLink(): void {
    this.backService.setBackLink({ url: ['/dashboard'], fragment: 'training-and-qualifications' });
  }
}
