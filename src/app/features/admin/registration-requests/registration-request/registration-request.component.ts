import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { AlertService } from '@core/services/alert.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { RegistrationsService } from '@core/services/registrations.service';
import { SwitchWorkplaceService } from '@core/services/switch-workplace.service';

@Component({
  selector: 'app-registration-request',
  templateUrl: './registration-request.component.html',
})
export class RegistrationRequestComponent implements OnInit {
  public registration;
  public workplaceIdForm: FormGroup;
  public invalidWorkplaceIdEntered: boolean;

  constructor(
    public registrationsService: RegistrationsService,
    private breadcrumbService: BreadcrumbService,
    private route: ActivatedRoute,
    private switchWorkplaceService: SwitchWorkplaceService,
    private alertService: AlertService,
  ) {}

  ngOnInit(): void {
    this.setBreadcrumbs();
    this.getRegistration();
    this.setupForm();
  }

  get nmdsId(): AbstractControl {
    return this.workplaceIdForm.get('nmdsId');
  }

  private getRegistration(): void {
    this.registration = this.route.snapshot.data.registration;
  }

  private setupForm(): void {
    this.workplaceIdForm = new FormGroup({
      nmdsId: new FormControl(this.registration.establishment.nmdsId, [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(8),
      ]),
    });
  }

  public updateWorkplaceId(): void {
    if (this.nmdsId.invalid) {
      this.invalidWorkplaceIdEntered = true;
      return;
    }

    const body = {
      uid: this.registration.establishment.uid,
      nmdsId: this.nmdsId.value,
    };

    this.registrationsService.updateWorkplaceId(body).subscribe(
      () => {
        this.showWorkplaceIdUpdatedAlert();
      },
      (err) => {
        this.invalidWorkplaceIdEntered = true;
        if (err instanceof HttpErrorResponse) {
          this.populateErrorFromServer(err);
        }
      },
    );
  }

  private populateErrorFromServer(err) {
    const validationErrors = err.error;

    Object.keys(validationErrors).forEach((prop) => {
      const formControl = this.workplaceIdForm.get(prop);
      if (formControl) {
        formControl.setErrors({
          serverError: validationErrors[prop],
        });
      }
    });
  }

  private setBreadcrumbs(): void {
    this.breadcrumbService.show(JourneyType.ADMIN_REGISTRATIONS);
  }

  public navigateToParentAccount(e: Event): void {
    e.preventDefault();
    this.switchWorkplaceService.navigateToWorkplace(
      this.registration.establishment.parentUid,
      '',
      this.registration.establishment.parentEstablishmentId,
    );
  }

  private showWorkplaceIdUpdatedAlert(): void {
    this.alertService.addAlert({
      type: 'success',
      message: `The workplace ID has been successfully updated to ${this.nmdsId.value}`,
    });
  }
}
