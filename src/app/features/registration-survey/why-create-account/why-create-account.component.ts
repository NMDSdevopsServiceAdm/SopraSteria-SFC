import { Component, OnInit } from '@angular/core';
import { URLStructure } from '@core/model/url.model';
import { BackService } from '@core/services/back.service';

@Component({
  selector: 'app-why-create-account',
  templateUrl: './why-create-account.component.html',
})
export class WhyCreateAccountComponent implements OnInit {
  public nextPage: URLStructure;
  public return: URLStructure;

  constructor(protected backService: BackService) {}

  ngOnInit(): void {
    this.nextPage = { url: ['/registration-survey', 'how-did-you-hear-about'] };
    this.return = { url: ['/registration-survey'] };
    this.setBackLink(this.return);
  }

  protected setBackLink(returnTo): void {
    this.backService.setBackLink(returnTo);
  }
}
