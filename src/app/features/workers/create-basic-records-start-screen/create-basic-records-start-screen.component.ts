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
    const url =
      this.route.snapshot.data.primaryWorkplace &&
      this.route.snapshot.data.establishment.uid === this.route.snapshot.data.primaryWorkplace.uid
        ? ['/dashboard']
        : ['/workplace', this.route.snapshot.data.establishment.uid];

    this.backService.setBackLink({ url, fragment: 'staff-records' });
  }
}
