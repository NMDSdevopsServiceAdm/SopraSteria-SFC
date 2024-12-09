import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormGroupDirective, UntypedFormGroup } from '@angular/forms';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { BehaviorSubject, Subscription } from 'rxjs';
import { FindAccountComponent } from './find-account/find-account.component';
import { FindUsernameComponent } from './find-username/find-username.component';
import { FindUsernameService } from '../../../core/services/find-username.service';

@Component({
  selector: 'app-forgot-your-username',
  templateUrl: './forgot-your-username.component.html',
  styleUrls: ['./forgot-your-username.component.scss'],
})
export class ForgotYourUsernameComponent implements OnInit {
  public currentForm: FindAccountComponent | FindUsernameComponent;
  public formErrorsMap: Array<ErrorDetails>;
  public accountUid: string;
  private subscriptions = new Subscription();

  constructor(private cd: ChangeDetectorRef, private findUsernameService: FindUsernameService) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.findUsernameService.accountUid$.subscribe((accountUid) => {
        this.accountUid = accountUid;
      }),
    );
  }

  public setCurrentForm(childForm: FindAccountComponent | FindUsernameComponent): void {
    this.currentForm = childForm;
    this.formErrorsMap = childForm.formErrorsMap;
    this.cd.detectChanges();
  }
}
