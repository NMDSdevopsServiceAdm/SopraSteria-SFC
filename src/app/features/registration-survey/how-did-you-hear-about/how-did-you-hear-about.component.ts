import { Component, OnInit } from '@angular/core';
import { URLStructure } from '@core/model/url.model';
import { BackService } from '@core/services/back.service';

@Component({
  selector: 'app-how-did-you-hear-about',
  templateUrl: './how-did-you-hear-about.component.html',
})
export class HowDidYouHearAboutComponent implements OnInit {
  public nextPage: URLStructure = { url: ['/registration-survey', 'thank-you'] };
  public return: URLStructure = { url: ['/registration-survey', 'why-create-account'] };
  public responses = [
    'From an event we attended',
    'From the Skills for Care website',
    'From a Skills for Care staff member',
    'From the Care Quality Commission',
    'From our local authority',
    'From our trade association',
    'Other',
  ];

  constructor(protected backService: BackService) {}

  ngOnInit(): void {
    this.setBackLink(this.return);
  }

  protected setBackLink(returnTo): void {
    this.backService.setBackLink(returnTo);
  }
}
