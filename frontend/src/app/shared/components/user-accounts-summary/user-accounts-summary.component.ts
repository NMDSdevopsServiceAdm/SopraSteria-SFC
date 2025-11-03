import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { Roles } from '@core/model/roles.enum';
import { UserDetails, UserPermissionsType } from '@core/model/userDetails.model';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { getUserPermissionsTypes } from '@core/utils/users-util';
import orderBy from 'lodash/orderBy';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
    selector: 'app-user-accounts-summary',
    templateUrl: './user-accounts-summary.component.html',
    standalone: false
})
export class UserAccountsSummaryComponent implements OnInit {
  @Input() workplace: Establishment;
  @Input() showSecondUserBanner: boolean;
  @Input() isParentUsers: boolean;
  @Input() setReturnUrl: () => void;

  private subscriptions: Subscription = new Subscription();
  public users: Array<UserDetails> = [];
  public canAddUser: boolean;
  public canViewUser: boolean;
  public userPermissionsTypes: UserPermissionsType[];

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private permissionsService: PermissionsService,
  ) {}

  ngOnInit(): void {
    this.setUsers();
    this.setReturnUrl === undefined ? this.setUserServiceReturnUrl() : this.setReturnUrl();
    this.showSecondUserBanner === undefined ? this.setShowSecondUserBanner() : this.showSecondUserBanner;
  }

  public setUsers(): void {
    const users = this.route.snapshot.data.users ? this.route.snapshot.data.users : [];
    this.userPermissionsTypes = getUserPermissionsTypes(true);
    this.canViewUser = this.permissionsService.can(this.workplace.uid, 'canViewUser');
    this.canAddUser = this.permissionsService.can(this.workplace.uid, 'canAddUser') && this.userSlotsAvailable(users);

    this.users = orderBy(
      users,
      ['status', 'isPrimary', 'role', (user: UserDetails) => (user.fullname ? user.fullname.toLowerCase() : 'a')],
      ['desc', 'desc', 'asc', 'asc'],
    );
  }
  public setShowSecondUserBanner(): void {
    this.showSecondUserBanner = this.canAddUser && this.route.snapshot.data.users?.length === 1;
  }

  private userSlotsAvailable(users: Array<UserDetails>): boolean {
    const readOnlyLimit = this.workplace.isParent ? 20 : 3;
    const editUsers = users.filter((user) => user.role === Roles.Edit);
    const readOnlyUsers = users.filter((user) => user.role === Roles.Read);
    return editUsers.length < 3 || readOnlyUsers.length < readOnlyLimit;
  }

  private setUserServiceReturnUrl(): void {
    this.userService.updateReturnUrl({
      url: ['/workplace', this.workplace.uid],
      fragment: 'workplace-users',
    });
  }
}
