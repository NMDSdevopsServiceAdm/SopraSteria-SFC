import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
import { Roles } from '@core/model/roles.enum';
import { UserDetails, UserStatus } from '@core/model/userDetails.model';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { orderBy } from 'lodash';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-accounts-summary',
  templateUrl: './user-accounts-summary.component.html',
})
export class UserAccountsSummaryComponent implements OnInit, OnDestroy {
  @Input() workplace: Establishment;

  private subscriptions: Subscription = new Subscription();
  public users: Array<UserDetails> = [];
  public canAddUser: boolean;

  constructor(private userService: UserService, private permissionsService: PermissionsService) {}

  ngOnInit() {
    this.subscriptions.add(
      this.userService.getAllUsersForEstablishment(this.workplace.uid).subscribe(users => {
        this.users = orderBy(
          users,
          ['status', 'isPrimary', 'role', (user: UserDetails) => user.fullname.toLowerCase()],
          ['desc', 'desc', 'asc', 'asc']
        );
        this.canAddUser =
          this.permissionsService.can(this.workplace.uid, 'canAddUser') && this.userSlotsAvailable(users);
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public getUserType(user: UserDetails) {
    return user.isPrimary ? 'Primary' : user.role;
  }

  public isPending(user: UserDetails) {
    return user.status === UserStatus.Pending;
  }

  private userSlotsAvailable(users: Array<UserDetails>) {
    const readOnlyLimit = this.workplace.isParent ? 20 : 3;
    const editUsers = users.filter(user => user.role === Roles.Edit);
    const readOnlyUsers = users.filter(user => user.role === Roles.Read);
    return editUsers.length < 3 || readOnlyUsers.length < readOnlyLimit;
  }
}
