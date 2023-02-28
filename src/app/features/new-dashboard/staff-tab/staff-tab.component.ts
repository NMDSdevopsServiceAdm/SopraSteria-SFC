import { Component, Input, OnInit } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';

@Component({
  selector: 'app-new-staff-tab',
  templateUrl: './staff-tab.component.html',
})
export class NewStaffTabComponent implements OnInit {
  @Input() workplace: Establishment;

  ngOnInit(): void {
    console.log('***** new staff tab *****');
  }
}
