import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { ErrorSummaryService } from '@core/services/error-summary.service';
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

  constructor(
    private router: Router,
    private errorSummaryService: ErrorSummaryService,
    private formBuilder: FormBuilder,
    private userService: UserService
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
    this.router.navigate(['/dashboard']);
  }
}
