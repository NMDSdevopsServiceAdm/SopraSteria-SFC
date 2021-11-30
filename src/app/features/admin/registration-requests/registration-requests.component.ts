import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-registration-requests',
  templateUrl: './registration-requests.component.html',
  styleUrls: ['../admin-links.scss'],
})
export class RegistrationRequestsComponent implements OnInit {
  public pendingRegistrationsCount: number;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.pendingRegistrationsCount = this.route.snapshot.data.registrations.length;
  }
}
