import { Component, Input, OnInit } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
import { UserDetails, UserPermissionsType, UserStatus } from '@core/model/userDetails.model';
import { UserService } from '@core/services/user.service';

@Component({
  selector: 'app-user-table',
  templateUrl: './user-table.component.html',
  standalone: false,
})
export class UserTableComponent implements OnInit {
  @Input() users: UserDetails[] = [];
  @Input() canViewUser = true;
  @Input() workplace: Establishment;
  @Input() userPermissionsTypes: UserPermissionsType[];

  public lastLoggedInFromLogin: string;
  public loggedUserUid: string;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.loggedInUser$.subscribe((user) => {
      this.lastLoggedInFromLogin = user?.lastLoggedInFromLogin;
      this.loggedUserUid = user?.uid;
    });
  }

  private isLoggedUser(user: UserDetails): boolean {
    return this.loggedUserUid === user.uid;
  }

  /**
   * Use locally stored last login for logged-in user,
   * otherwise use API value.
   */
  public getUserLastLogin(user: UserDetails): string {
    return this.isLoggedUser(user) ? this.lastLoggedInFromLogin : user.lastLoggedIn;
  }

  public isPending(user: UserDetails): boolean {
    return user.status === UserStatus.Pending;
  }

  public getUserType(user: UserDetails): string {
    if (this.workplace) {
      const userType = this.userPermissionsTypes.find(
        (type) => type.role === user.role && !!user.isPrimary === !!type.isPrimary,
      );

      return userType?.userTableValue;
    }
    return user.role === 'AdminManager' ? 'Admin manager' : user.role;
  }
}
