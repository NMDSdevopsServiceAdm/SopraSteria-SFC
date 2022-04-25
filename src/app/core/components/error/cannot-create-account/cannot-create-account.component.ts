import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BackService } from '@core/services/back.service';

@Component({
  selector: 'app-cannot-create-account',
  templateUrl: './cannot-create-account.component.html',
})
export class CannotCreateAccountComponent implements OnInit {
  private returnTo: string;
  public flow: string;
  public title: string;

  constructor(public backService: BackService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.returnTo = history.state?.returnTo;
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
    const returnUrl = this.returnTo
      ? this.returnTo
      : this.flow === 'registration'
      ? `${this.flow}/create-account`
      : `workplace/view-all-workplaces`;

    this.backService.setBackLink({ url: [returnUrl] });
  }
}
