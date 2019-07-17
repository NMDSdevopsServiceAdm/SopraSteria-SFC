import { Component, Input, OnInit } from '@angular/core';
import { Roles } from '@core/model/roles.enum';
import { UserDetails } from '@core/model/userDetails.model';
import { AuthService } from '@core/services/auth.service';
import { UserService } from '@core/services/user.service';
import { orderBy } from 'lodash';
import { combineLatest } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-user-accounts-summary',
  templateUrl: './user-accounts-summary.component.html',
})
export class UserAccountsSummaryComponent implements OnInit {
  @Input() establishmentUid: string;

  public users: Array<UserDetails> = [];
  public canAddUser: boolean;

  constructor(private authService: AuthService, private userService: UserService) {}

  ngOnInit() {
    combineLatest(this.authService.auth$, this.userService.getAllUsersForEstablishment(this.establishmentUid))
      .pipe(take(1))
      .subscribe(([auth, users]) => {
        this.users = orderBy(users, ['status', 'role', 'username'], ['desc', 'asc', 'asc']);
        this.canAddUser = auth && auth.role === Roles.Edit && this.userSlotsAvailable(users);
      });
  }

  public isPending(user: UserDetails) {
    return user.username === null;
  }

  private userSlotsAvailable(users: Array<UserDetails>) {
    const editUsers = users.filter(user => user.role === Roles.Edit);
    const readOnlyUsers = users.filter(user => user.role === Roles.Read);
    return editUsers.length < 3 || readOnlyUsers.length < 3;
  }
}
