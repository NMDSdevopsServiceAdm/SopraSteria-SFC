import { Component, Input, OnInit } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
import { Roles } from '@core/model/roles.enum';
import { UserDetails, UserStatus } from '@core/model/userDetails.model';
import { AuthService } from '@core/services/auth.service';
import { UserService } from '@core/services/user.service';
import { combineLatest } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-user-accounts-summary',
  templateUrl: './user-accounts-summary.component.html',
})
export class UserAccountsSummaryComponent implements OnInit {
  @Input() workplace: Establishment;

  public users: Array<UserDetails> = [];
  public canAddUser: boolean;

  constructor(private authService: AuthService, private userService: UserService) { }

  ngOnInit() {
    combineLatest(this.authService.auth$, this.userService.getAllUsersForEstablishment(this.workplace.uid))
      .pipe(take(1))
      .subscribe(([auth, users]) => {
        this.users = users;
        this.canAddUser = auth && auth.role === Roles.Edit && this.userSlotsAvailable(users);
      });
  }

  public getUserType(user: UserDetails) {
    return user.isPrimary ? 'Primary' : user.role;
  }

  public isPending(user: UserDetails) {
    return user.status === UserStatus.Pending;
  }

  private userSlotsAvailable(users: Array<UserDetails>) {
    const editUsers = users.filter(user => user.role === Roles.Edit);
    const readOnlyUsers = users.filter(user => user.role === Roles.Read);
    return editUsers.length < 3 || readOnlyUsers.length < 3;
  }
}
