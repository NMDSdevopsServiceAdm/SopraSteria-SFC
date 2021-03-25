import { Component, OnInit } from '@angular/core';
import { URLStructure } from '@core/model/url.model';
import { BackService } from '@core/services/back.service';

@Component({
  selector: 'app-why-create-account',
  templateUrl: './why-create-account.component.html',
})
export class WhyCreateAccountComponent implements OnInit {
  public return: URLStructure = { url: ['/registration-survey'] };

  constructor(protected backService: BackService) {}

  ngOnInit(): void {
    this.setBackLink(this.return);
  }

  protected setBackLink(returnTo): void {
    this.backService.setBackLink(returnTo);
  }
}
