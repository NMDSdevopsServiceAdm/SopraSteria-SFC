import { Component, OnInit } from '@angular/core';
import { URLStructure } from '@core/model/url.model';

@Component({
  selector: 'app-participation',
  templateUrl: './participation.component.html',
})
export class ParticipationComponent implements OnInit {
  public nextPage: URLStructure;

  constructor() {
    /**/
  }

  ngOnInit(): void {
    this.nextPage = { url: ['/registration-survey', 'why-create-account'] };
  }
}
