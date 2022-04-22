import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BackService } from '@core/services/back.service';

@Component({
  selector: 'app-cannot-create-account',
  templateUrl: './cannot-create-account.component.html',
})
export class CannotCreateAccountComponent implements OnInit {
  private returnTo: string;
  private flow: string;

  constructor(public backService: BackService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.returnTo = history.state?.returnTo;
    this.flow = this.route.snapshot.data.flow;
    this.setBackLink();
  }

  public setBackLink(): void {
    const returnUrl = this.returnTo ? this.returnTo : `${this.flow}/create-account`;
    this.backService.setBackLink({ url: [returnUrl] });
  }
}
