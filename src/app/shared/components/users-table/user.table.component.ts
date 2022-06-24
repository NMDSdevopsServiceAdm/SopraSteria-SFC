import { Component, Input } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
import { UserDetails, UserStatus } from '@core/model/userDetails.model';

@Component({
  selector: 'app-user-table',
  templateUrl: './user-table.component.html',
})
export class UserTableComponent {
  @Input() users: UserDetails[] = [];
  @Input() canViewUser = true;
  @Input() workplace: Establishment;

  public isPending(user: UserDetails): boolean {
    return user.status === UserStatus.Pending;
  }
}
