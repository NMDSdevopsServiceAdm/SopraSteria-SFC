import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { BackService } from '@core/services/back.service';

@Component({
  selector: 'app-create-basic-records-start-screen',
  templateUrl: './create-basic-records-start-screen.component.html',
})
export class CreateBasicRecordsStartScreenComponent implements OnInit {
  public workplace: Establishment;
  constructor(private backService: BackService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.backService.setBackLink({ url: ['/dashboard'], fragment: 'staff-records' });
  }
}
