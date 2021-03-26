import { Component, OnInit } from '@angular/core';
import { URLStructure } from '@core/model/url.model';
import { BackService } from '@core/services/back.service';

@Component({
  selector: 'app-how-did-you-hear-about',
  templateUrl: './how-did-you-hear-about.component.html',
})
export class HowDidYouHearAboutComponent implements OnInit {
  public return: URLStructure = { url: ['/registration-survey', 'why-create-account'] };

  constructor(protected backService: BackService) {}

  ngOnInit(): void {
    this.setBackLink(this.return);
  }

  protected setBackLink(returnTo): void {
    this.backService.setBackLink(returnTo);
  }
}
