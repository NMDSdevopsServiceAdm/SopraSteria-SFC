import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Registrations } from '@core/model/registrations.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { SwitchWorkplaceService } from '@core/services/switch-workplace.service';

@Component({
  selector: 'app-registration-requests',
  templateUrl: './registration-requests.component.html',
  styleUrls: ['./registration-requests.component.scss'],
})
export class RegistrationRequestsComponent implements OnInit {
  public registrations: Registrations[];
  public pendingRegistrations: Registrations[];
  public rejectedRegistrations: Registrations[];
  public showPendingRegistrations: boolean;

  constructor(
    private route: ActivatedRoute,
    private breadcrumbService: BreadcrumbService,
    private switchWorkplaceService: SwitchWorkplaceService,
  ) {}

  ngOnInit(): void {
    this.registrations = this.route.snapshot.data.registrations;
    this.breadcrumbService.show(JourneyType.ADMIN);
    this.getPendingRegistrations();
    this.getRejectedRegistrations();
    this.showPendingRegistrations = true;
  }

  public getPendingRegistrations(): void {
    this.pendingRegistrations = this.registrations;
    // this.pendingRegistrations = this.registrations.filter((registration, index) => {
    //   return registration.establishment.status === 'PENDING';
    // });
  }

  public getRejectedRegistrations(): void {
    this.rejectedRegistrations = [];
    // this.rejectedRegistrations = this.registrations.filter((registration, index) => {
    //   return registration.establishment.status === 'REJECTED';
    // });
  }

  public displayPendingRegistrations(event: Event, bool: boolean): void {
    event.preventDefault();
    this.showPendingRegistrations = bool;
  }

  public setEstablishmentId(id: string, username: string, nmdsId: string, event: Event): void {
    event.preventDefault();
    this.switchWorkplaceService.navigateToWorkplace(id, username, nmdsId);
  }
  public conditionalClass(status: string): string {
    return status === 'PENDING' ? 'govuk-tag--grey' : 'govuk-tag--blue';
  }
}
