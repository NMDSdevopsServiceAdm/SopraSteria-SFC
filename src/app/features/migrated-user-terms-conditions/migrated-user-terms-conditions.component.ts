import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { UserDetails } from '@core/model/userDetails.model';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { UserService } from '@core/services/user.service';

@Component({
  selector: 'app-migrated-user-terms-conditions',
  templateUrl: './migrated-user-terms-conditions.component.html',
  styles: [],
})
export class MigratedUserTermsConditionsComponent implements OnInit {
  public formErrorsMap: ErrorDetails[];
  public form: FormGroup;
  public submitted = false;
  protected userDetails: UserDetails;
  public serverErrorsMap: Array<ErrorDefinition>;
  public serverError: string;

  constructor(
    private router: Router,
    private errorSummaryService: ErrorSummaryService,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private establishmentService: EstablishmentService
  ) {}

  ngOnInit() {
    this.setupForm();
    this.setupFormErrorsMap();
  }

  private setupForm(): void {
    this.form = this.formBuilder.group({
      termsAndConditions: [null, Validators.required],
    });
  }

  private setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'termsAndConditions',
        type: [
          {
            name: 'required',
            message: 'Please agree to the terms and conditions.',
          },
        ],
      },
    ];
  }
  public setupServerErrorsMap(): void {
    this.serverErrorsMap = [
      {
        name: 404,
        message: 'User not found or does not belong to the given establishment.',
      },
      {
        name: 400,
        message: 'Unexpected user.',
      },
    ];
  }

  public onSubmit(): void {
    this.submitted = true;
    this.errorSummaryService.syncFormErrorsEvent.next(true);

    if (this.form.valid) {
      this.continue();
    } else {
      this.errorSummaryService.scrollToErrorSummary();
    }
  }

  public getFirstErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  private continue(): void {
    this.userService.migratedUserTermsAccepted$.next(true);
    this.userService.agreedUpdatedTerms$.next(true);
    this.userService.loggedInUser.agreedUpdatedTerms = true;
    this.userService
      .updateUserDetails(
        this.establishmentService.primaryWorkplace.uid,
        this.userService.loggedInUser.uid,
        this.userService.loggedInUser
      )
      .subscribe(
        data => {
          this.router.navigate(['/dashboard']);
        },
        (error: HttpErrorResponse) => {
          this.serverError = this.errorSummaryService.getServerErrorMessage(error.status, this.serverErrorsMap);
        }
      );
  }
}
