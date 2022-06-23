import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
})
export class AdminUsersComponent implements OnInit {
  public users = [];

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    console.log('Here');
    console.log(this.route.snapshot);
    // const users = this.route.snapshot.data.adminUsers;
  }
}
