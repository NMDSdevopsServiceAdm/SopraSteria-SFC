import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Registration } from '@core/model/registrations.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { SwitchWorkplaceService } from '@core/services/switch-workplace.service';

@Component({
  selector: 'app-registration-requests',
  templateUrl: './pending-registration-requests.component.html',
})
export class PendingRegistrationRequestsComponent implements OnInit {
  public pendingRegistrations: Registration[];

  constructor(
    private route: ActivatedRoute,
    private breadcrumbService: BreadcrumbService,
    private switchWorkplaceService: SwitchWorkplaceService,
  ) {}

  ngOnInit(): void {
    this.pendingRegistrations = this.route.snapshot.data.registrations;
    this.breadcrumbService.show(JourneyType.ADMIN_PENDING_REGISTRATIONS);
  }

  public navigateToParentPage(id: string, username: string, nmdsId: string, event: Event): void {
    event.preventDefault();
    this.switchWorkplaceService.navigateToWorkplace(id, username, nmdsId);
  }

  public setStatusClass(status: string): string {
    return status === 'PENDING' ? 'govuk-tag--grey' : 'govuk-tag--blue';
  }
}
