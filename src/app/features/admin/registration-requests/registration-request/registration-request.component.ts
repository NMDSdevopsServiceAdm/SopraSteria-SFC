import { Component, OnInit } from '@angular/core';
import { RegistrationsService } from '@core/services/registrations.service';

@Component({
  selector: 'app-registration-request',
  templateUrl: './registration-request.component.html',
})
export class RegistrationRequestComponent implements OnInit {
  public registration;

  constructor(public registrationsService: RegistrationsService) {}

  ngOnInit(): void {
    this.getRegistration();
  }

  public getRegistration(): void {
    this.registrationsService.getRegistrations().subscribe(
      (data) => {
        this.registration = data[0];
      },
      (error) => console.log(error),
    );
  }
}
