import { Component, OnInit } from '@angular/core';
import { URLStructure } from '@core/model/url.model';
import { BackService } from '@core/services/back.service';

@Component({
  selector: 'app-why-create-account',
  templateUrl: './why-create-account.component.html',
})
export class WhyCreateAccountComponent implements OnInit {
  public nextPage: URLStructure = { url: ['/registration-survey', 'how-did-you-hear-about'] };
  public return: URLStructure = { url: ['/registration-survey'] };
  public responses = [
    'To help the Department of Health and Social Care and others to better understand the adult social care sector',
    'To get access to the Workforce Development Fund',
    'To help us with the Care Quality Commission',
    'To help us with our local authority',
    'To record and manage staff training and qualifications',
    'To record and manage staff records',
    'To benchmark our workplace against others',
    'To help us understand our workforce better',
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
