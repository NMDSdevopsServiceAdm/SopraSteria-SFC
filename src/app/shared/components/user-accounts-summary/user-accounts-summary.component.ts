import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { Roles } from '@core/model/roles.enum';
import { UserDetails, UserStatus } from '@core/model/userDetails.model';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import orderBy from 'lodash/orderBy';

@Component({
  selector: 'app-user-accounts-summary',
  templateUrl: './user-accounts-summary.component.html',
})
export class UserAccountsSummaryComponent implements OnInit {
  @Input() workplace: Establishment;
  @Input() showSecondUserBanner: boolean;

  public users: Array<UserDetails> = [];
  public canAddUser: boolean;
  public canViewUser: boolean;

  constructor(private route: ActivatedRoute, private permissionsService: PermissionsService) {}

  ngOnInit(): void {
    this.canViewUser = this.permissionsService.can(this.workplace.uid, 'canViewUser');

    const users = this.route.snapshot.data.users ? this.route.snapshot.data.users : [];
    this.canAddUser = this.permissionsService.can(this.workplace.uid, 'canAddUser') && this.userSlotsAvailable(users);

    this.users = orderBy(
      users,
      ['status', 'isPrimary', 'role', (user: UserDetails) => (user.fullname ? user.fullname.toLowerCase() : 'a')],
      ['desc', 'desc', 'asc', 'asc'],
    );
  }

  public getUserType(user: UserDetails): string {
    const userTypes = [
      {
        value: 'Primary edit and WDF',
        role: 'Edit',
        canManageWdfClaims: true,
        isPrimary: true,
      },
      {
        value: 'Primary edit',
        role: 'Edit',
        canManageWdfClaims: false,
        isPrimary: true,
      },
      {
        value: 'Edit and WDF',
        role: 'Edit',
        canManageWdfClaims: true,
      },
      {
        value: 'Edit',
        role: 'Edit',
        canManageWdfClaims: false,
      },
      {
        value: 'Read only and WDF',
        role: 'Read',
        canManageWdfClaims: true,
      },
      {
        value: 'Read only',
        role: 'Read',
        canManageWdfClaims: false,
      },
      {
        value: 'WDF',
        role: 'None',
        canManageWdfClaims: true,
      },
    ];

    const userType = userTypes.find(
      (type) =>
        type.role === user.role &&
        type.canManageWdfClaims === user.canManageWdfClaims &&
        !!user.isPrimary === !!type.isPrimary,
    );
    return userType?.value;
  }

  public isPending(user: UserDetails): boolean {
    return user.status === UserStatus.Pending;
  }

  private userSlotsAvailable(users: Array<UserDetails>): boolean {
    const readOnlyLimit = this.workplace.isParent ? 20 : 3;
    const editUsers = users.filter((user) => user.role === Roles.Edit);
    const readOnlyUsers = users.filter((user) => user.role === Roles.Read);
    return editUsers.length < 3 || readOnlyUsers.length < readOnlyLimit;
  }
}
