import { Component, OnInit } from '@angular/core';
import { LoggedInEstablishment } from '@core/model/logged-in.model';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-view-my-workplaces',
  templateUrl: './view-my-workplaces.component.html',
})
export class ViewMyWorkplacesComponent implements OnInit {
  public establishment: LoggedInEstablishment | null;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.establishment = this.authService.establishment;
  }
}
