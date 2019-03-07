import { Component, OnInit } from '@angular/core';
import { AuthService } from '@core/services/auth-service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  public establishment: any;
  public fullname: string;

  constructor(private authService: AuthService) {}

  get isFirstLoggedIn(): boolean {
    return this.authService.isFirstLogin == null ? false : this.authService.isFirstLogin;
  }

  ngOnInit() {
    this.establishment = this.authService.establishment;
    console.log(this.establishment);
    this.fullname = this.authService.fullname;
  }
}
