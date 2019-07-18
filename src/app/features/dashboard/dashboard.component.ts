import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { AuthService } from '@core/services/auth.service';
import { UserService } from '@core/services/user.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  public establishment: Establishment;
  public lastLoggedIn: string;

  constructor(private authService: AuthService, private userService: UserService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.establishment = this.route.snapshot.data.establishment;
    this.lastLoggedIn = this.authService.lastLoggedIn;
    this.userService.updateReturnUrl({
      url: ['/dashboard'],
      fragment: 'user-accounts',
    });
  }
}
