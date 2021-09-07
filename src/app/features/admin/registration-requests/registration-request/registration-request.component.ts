import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { RegistrationsService } from '@core/services/registrations.service';
import { SwitchWorkplaceService } from '@core/services/switch-workplace.service';

@Component({
  selector: 'app-registration-request',
  templateUrl: './registration-request.component.html',
})
export class RegistrationRequestComponent implements OnInit {
  public registration;

  constructor(
    public registrationsService: RegistrationsService,
    private breadcrumbService: BreadcrumbService,
    private route: ActivatedRoute,
    private switchWorkplaceService: SwitchWorkplaceService,
  ) {}

  ngOnInit(): void {
    this.setBreadcrumbs();
    this.getRegistration();
  }

  public getRegistration(): void {
    const establishmentUid = this.route.snapshot.paramMap.get('establishmentUid');

    this.registrationsService.getSingleRegistration(establishmentUid).subscribe(
      (data) => {
        this.registration = data;
      },
      (error) => console.log(error),
    );
  }

  private setBreadcrumbs(): void {
    this.breadcrumbService.show(JourneyType.ADMIN);
  }

  public navigateToParentAccount(e: Event): void {
    e.preventDefault();
    this.switchWorkplaceService.navigateToWorkplace(
      this.registration.establishment.parentUid,
      '',
      this.registration.establishment.parentEstablishmentId,
    );
  }
}
