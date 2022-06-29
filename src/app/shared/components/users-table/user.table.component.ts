import { Component, Input } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
import { UserDetails, UserPermissionsType, UserStatus } from '@core/model/userDetails.model';

@Component({
  selector: 'app-user-table',
  templateUrl: './user-table.component.html',
})
export class UserTableComponent {
  @Input() users: UserDetails[] = [];
  @Input() canViewUser = true;
  @Input() workplace: Establishment;
  @Input() userPermissionsTypes: UserPermissionsType[];

  public isPending(user: UserDetails): boolean {
    return user.status === UserStatus.Pending;
  }

  public getUserType(user: UserDetails): string {
    if (this.workplace) {
      const userType = this.userPermissionsTypes.find(
        (type) =>
          type.role === user.role &&
          type.canManageWdfClaims === user.canManageWdfClaims &&
          !!user.isPrimary === !!type.isPrimary,
      );

      return userType?.userTableValue;
    }
    return user.role;
  }
}
