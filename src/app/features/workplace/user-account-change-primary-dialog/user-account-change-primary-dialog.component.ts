import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogComponent } from '@core/components/dialog.component';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { Roles } from '@core/model/roles.enum';
import { UserDetails } from '@core/model/userDetails.model';
import { Dialog, DIALOG_DATA } from '@core/services/dialog.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { UserService } from '@core/services/user.service';
import { filter, find } from 'lodash';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-account-change-primary-dialog',
  templateUrl: './user-account-change-primary-dialog.component.html',
})
export class UserAccountChangePrimaryDialogComponent extends DialogComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  public users: UserDetails[];
  public form: FormGroup;
  public submitted = false;
  public formErrorsMap: Array<ErrorDetails>;

  constructor(
    @Inject(DIALOG_DATA) public data: { workplaceUid: string; currentUserUid: string },
    public dialog: Dialog<UserAccountChangePrimaryDialogComponent>,
    private formBuilder: FormBuilder,
    private errorSummaryService: ErrorSummaryService,
    private userService: UserService
  ) {
    super(data, dialog);

    this.form = this.formBuilder.group({
      user: [null, Validators.required],
    });
  }

  ngOnInit() {
    this.subscriptions.add(
      this.userService.getAllUsersForEstablishment(this.data.workplaceUid).subscribe(users => {
        this.users = filter(
          users,
          user => user.role === (Roles.Edit || Roles.Admin) && user.uid !== this.data.currentUserUid
        );
      })
    );

    this.setupFormErrorsMap();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public close(userFullname: string = null) {
    this.dialog.close(userFullname);
  }

  public onSubmit() {
    this.submitted = true;

    this.errorSummaryService.syncFormErrorsEvent.next(true);

    if (!this.form.valid) {
      this.errorSummaryService.scrollToErrorSummary();
      return;
    }

    const { user } = this.form.value;
    const selectedUser = find(this.users, ['uid', user]);

    const props = {
      role: selectedUser.role,
      isPrimary: true,
    };

    this.subscriptions.add(
      this.userService
        .updateUserDetails(this.data.workplaceUid, selectedUser.uid, { ...selectedUser, ...props })
        .subscribe(
          data => {
            this.close(selectedUser.fullname);
          },
          error => console.log(error)
        )
    );
  }

  public getFirstErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  private setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'user',
        type: [
          {
            name: 'required',
            message: 'Please select a user',
          },
        ],
      },
    ];
  }
}
