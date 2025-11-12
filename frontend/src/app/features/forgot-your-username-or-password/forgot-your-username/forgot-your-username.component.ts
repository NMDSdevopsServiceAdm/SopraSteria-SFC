import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AccountFound } from '@core/services/find-username.service';

import { FindAccountComponent } from './find-account/find-account.component';
import { FindUsernameComponent } from './find-username/find-username.component';

@Component({
    selector: 'app-forgot-your-username',
    templateUrl: './forgot-your-username.component.html',
    standalone: false
})
export class ForgotYourUsernameComponent implements OnInit {
  public currentForm: FindAccountComponent | FindUsernameComponent;
  public accountUid: string;
  public securityQuestion: string;

  constructor(private cd: ChangeDetectorRef) {}

  ngOnInit(): void {}

  public setCurrentForm(childForm: FindAccountComponent | FindUsernameComponent): void {
    this.currentForm = childForm;
    this.cd.detectChanges();
  }

  public onAccountFound({ accountUid, securityQuestion }: AccountFound): void {
    this.accountUid = accountUid;
    this.securityQuestion = securityQuestion;
  }
}
