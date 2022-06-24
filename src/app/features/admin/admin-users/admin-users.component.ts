import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserDetails } from '@core/model/userDetails.model';

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
})
export class AdminUsersComponent implements OnInit {
  public users: UserDetails[] = [];
  public canViewUser = true;
  public flow: string;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.users = this.route.snapshot.data.adminUsers.adminUsers;
    this.flow = this.router.url;
  }

  public navigateToAddAdminUserPage(): void {
    this.router.navigate([this.flow, 'add-admin']);
  }
}
