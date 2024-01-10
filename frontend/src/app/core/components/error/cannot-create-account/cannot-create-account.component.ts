import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BackLinkService } from '@core/services/backLink.service';

@Component({
  selector: 'app-cannot-create-account',
  templateUrl: './cannot-create-account.component.html',
})
export class CannotCreateAccountComponent implements OnInit {
  private returnTo: string;
  public flow: string;
  public title: string;

  constructor(public backLinkService: BackLinkService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.flow = this.route.snapshot.data.flow;
    this.setTitle();
    this.setBackLink();
  }

  private setTitle(): void {
    this.title =
      this.flow === 'registration'
        ? 'We cannot create an account for you at the moment'
        : 'You cannot add this workplace at the moment';
  }

  public setBackLink(): void {
    this.backLinkService.showBackLink();
  }
}
