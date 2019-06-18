import { Component, OnInit } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { LoggedInEstablishment } from '@core/model/logged-in.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  public establishment: LoggedInEstablishment | null;
  public lastLoggedIn: string | null;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.establishment = this.authService.establishment;
    this.lastLoggedIn = this.authService.lastLoggedIn;
  }
}
