import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { RegistrationsService } from '@core/services/registrations.service';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
})
export class RegistrationComponent implements OnInit {
  @Output() handleRegistration: EventEmitter<any> = new EventEmitter<any>();
  @Input() index: number;
  @Input() registration: any;
  public registrationForm: FormGroup;
  public username: string;
  public approve: boolean;

  constructor(
    public registrationsService: RegistrationsService,
  ) {}
  ngOnInit() {
    this.registrationForm = new FormGroup({
      nmdsId: new FormControl(this.registration.establishment.nmdsId, [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(8),
      ]),
    });
  }

  get nmdsid() {
    return this.registrationForm.get('nmdsId');
  }

  public approveRegistration(username: string, approve: boolean) {
    this.username = username;
    this.approve = approve;
  }
  public onSubmit() {
    if (this.registrationForm.valid) {
      let data;
      data = {
        username: this.username,
        nmdsId: this.registrationForm.get('nmdsId').value,
        approve: this.approve,
      };

      if (!this.registration.email) {
        data = {
          establishmentId: this.username,
          nmdsId: this.registrationForm.get('nmdsId').value,
          approve: this.approve,
        };
      }

      this.registrationsService.registrationApproval(data).subscribe(
        () => {
          this.handleRegistration.emit(this.index);
        },
        (err) => {
          if (err instanceof HttpErrorResponse) {
            this.populateErrorFromServer(err);
          }
        }
      );
    }
  }

  private populateErrorFromServer(err) {
    const validationErrors = err.error;

    Object.keys(validationErrors).forEach((prop) => {
      const formControl = this.registrationForm.get(prop);
      if (formControl) {
        formControl.setErrors({
          serverError: validationErrors[prop],
        });
      }
    });
  }
}
