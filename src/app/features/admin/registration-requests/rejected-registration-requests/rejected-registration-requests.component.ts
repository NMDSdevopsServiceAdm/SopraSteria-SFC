import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Registration } from '@core/model/registrations.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';

@Component({
  selector: 'app-registration-requests',
  templateUrl: './rejected-registration-requests.component.html',
})
export class RejectedRegistrationRequestsComponent implements OnInit {
  public rejectedRegistrations: Registration[];

  constructor(private route: ActivatedRoute, private breadcrumbService: BreadcrumbService) {}

  ngOnInit(): void {
    this.rejectedRegistrations = this.route.snapshot.data.registrations;
    this.breadcrumbService.show(JourneyType.ADMIN_REJECTED_REGISTRATIONS);
  }
}
