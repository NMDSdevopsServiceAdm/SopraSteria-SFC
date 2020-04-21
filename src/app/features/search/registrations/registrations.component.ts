import { Component, OnInit } from '@angular/core';
import { RegistrationsService } from '@core/services/registrations.service';

@Component({
  selector: 'app-registrations',
  templateUrl: './registrations.component.html',
})
export class RegistrationsComponent implements OnInit {
  public registrations = [];

  constructor(
    public registrationsService: RegistrationsService,
  ) {}

  ngOnInit() {
    this.getRegistrations();
  }

  public getRegistrations() {
    this.registrationsService.getRegistrations().subscribe(
      data => {
        this.registrations = data;
      },
      error => this.onError(error)
    );
  }

  public handleRegistration(index: number) {
    this.registrations.splice(index, 1);
  }

  private onError(error) {}
}
