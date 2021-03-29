import { Component, OnInit } from '@angular/core';
import { URLStructure } from '@core/model/url.model';
import { BackService } from '@core/services/back.service';

@Component({
  selector: 'app-thank-you',
  templateUrl: './thank-you.component.html',
})
export class ThankYouComponent implements OnInit {
  public nextPage: URLStructure = { url: ['/dashboard'] };
  public return: URLStructure = { url: ['/registration-survey'] };

  constructor(protected backService: BackService) {}

  ngOnInit(): void {
    this.setBackLink(this.return);
  }

  protected setBackLink(returnTo): void {
    this.backService.setBackLink(returnTo);
  }
}
