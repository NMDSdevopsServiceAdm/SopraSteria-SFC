import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Registration } from '@core/model/registrations.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { SwitchWorkplaceService } from '@core/services/switch-workplace.service';

@Component({
  selector: 'app-registration-requests',
  templateUrl: './registration-requests.component.html',
  styleUrls: ['./registration-requests.component.scss'],
})
export class RegistrationRequestsComponent implements OnInit {
  public registrations: Registration[];
  public pendingRegistrations: Registration[];
  public rejectedRegistrations: Registration[];
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
    this.pendingRegistrations = this.registrations.filter((registration) => {
      return registration.establishment.status === 'PENDING' || registration.establishment.status === 'IN PROGRESS';
    });
  }

  public getRejectedRegistrations(): void {
    this.rejectedRegistrations = this.registrations.filter((registration) => {
      return registration.establishment.status === 'REJECTED';
    });
  }

  public displayPendingRegistrations(event: Event, bool: boolean): void {
    event.preventDefault();
    this.showPendingRegistrations = bool;
  }

  public navigateToParentPage(id: string, username: string, nmdsId: string, event: Event): void {
    event.preventDefault();
    this.switchWorkplaceService.navigateToWorkplace(id, username, nmdsId);
  }

  public setStatusClass(status: string): string {
    return status === 'PENDING' ? 'govuk-tag--grey' : 'govuk-tag--blue';
  }
}
