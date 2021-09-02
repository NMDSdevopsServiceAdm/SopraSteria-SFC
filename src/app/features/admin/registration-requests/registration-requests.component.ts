import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Registrations } from '@core/model/registrations.model';

@Component({
  selector: 'app-registration-requests',
  templateUrl: './registration-requests.component.html',
})
export class RegistrationRequestsComponent implements OnInit {
  public registrations: Registrations[];

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.registrations = this.route.snapshot.data.registrations;
  }

  public conditionalClass(status: string): string {
    return status === 'PENDING' ? 'govuk-tag--grey' : 'govuk-tag--blue';
  }
}
