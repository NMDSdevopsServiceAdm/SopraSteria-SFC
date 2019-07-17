import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { UserDetails } from '@core/model/userDetails.model';
import { AlertService } from '@core/services/alert.service';
import { AuthService } from '@core/services/auth.service';
import { DialogService } from '@core/services/dialog.service';
import { UserService } from '@core/services/user.service';
import { take, withLatestFrom } from 'rxjs/operators';

import { UserAccountDeleteDialogComponent } from '../user-account-delete-dialog/user-account-delete-dialog.component';

@Component({
  selector: 'app-view-user-account',
  templateUrl: './view-user-account.component.html',
})
export class ViewUserAccountComponent implements OnInit {
  public user: UserDetails;
  public establishment: Establishment;
  public canDeleteUser = false;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private authService: AuthService,
    private dialogService: DialogService,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    this.establishment = this.route.parent.snapshot.data.establishment;
    this.user = this.route.snapshot.data.user;

    this.userService
      .getAllUsersForEstablishment(this.establishment.uid)
      .pipe(
        take(1),
        withLatestFrom(this.authService.auth$)
      )
      .subscribe(([users, auth]) => {
        const editUsers = users.filter(user => user.role === 'Edit');
        // TODO users can not delete themselves, but uid for own account is not exposed so can't currently compare
        // TODO users can not delete primary user, but no primary flags are currently returned
        this.canDeleteUser = auth && auth.role === 'Edit' && editUsers.length > 1;
      });
  }

  public onDeleteUser() {
    const dialog = this.dialogService.open(UserAccountDeleteDialogComponent, { user: this.user });
    dialog.afterClosed.subscribe(deleteConfirmed => {
      if (deleteConfirmed) {
        this.deleteUser();
      }
    });
  }

  private deleteUser() {
    this.userService
      .deleteUser(this.user.uid)
      .pipe(
        withLatestFrom(this.userService.returnUrl$),
        take(1)
      )
      .subscribe(([response, returnUrl]) => {
        this.router.navigate(returnUrl.url, { fragment: 'user-accounts' });
        this.alertService.addAlert({ type: 'success', message: 'User deleted [BE NOT IMPLEMENTED]' });
      });
  }
}
