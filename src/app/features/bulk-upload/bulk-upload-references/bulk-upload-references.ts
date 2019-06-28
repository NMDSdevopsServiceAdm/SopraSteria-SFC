import { OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { GetWorkplacesResponse, Workplace } from '@core/model/my-workplaces.model';
import { URLStructure } from '@core/model/url.model';
import { AuthService } from '@core/services/auth.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { UserService } from '@core/services/user.service';
import { Subscription } from 'rxjs';

export class BulkUploadReferences implements OnInit, OnDestroy {
  protected subscriptions: Subscription = new Subscription();
  public form: FormGroup;
  public formErrorsMap: ErrorDetails[] = []; // TODO look at generic error messages
  public primaryEstablishmentName: string;
  public return: URLStructure;
  public serverError: string;
  public serverErrorsMap: ErrorDefinition[] = [];
  public submitted = false;
  public references: Workplace[] = []; // TODO update to Workplace[] | StaffRecord[]

  constructor(
    protected authService: AuthService,
    protected router: Router,
    protected formBuilder: FormBuilder,
    protected errorSummaryService: ErrorSummaryService,
    protected userService: UserService,
  ) {}

  ngOnInit() {
    this.setupForm();
    this.getReferences();
    this.setPrimaryEstablishmentName();
  }

  private setPrimaryEstablishmentName(): void {
    this.primaryEstablishmentName = this.authService.establishment.name;
  }

  private setupForm(): void {
    this.form = this.formBuilder.group({});
  }

  protected getReferences(): void {}

  protected updateForm(): void {
    this.references.forEach((workplace: Workplace) => {
      this.form.addControl(`name-${workplace.uid}`, new FormControl(null, [Validators.required]));

      this.formErrorsMap.push({
        item: `name-${workplace.uid}`,
        type: [
          {
            name: 'required',
            message: 'Enter the missing workplace reference.',
          },
        ],
      });
    });
  }

  public getFirstErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  public onSubmit(): void {
    this.submitted = true;
    this.errorSummaryService.syncFormErrorsEvent.next(true);

    if (this.form.valid) {
      console.log('form valid');
    } else {
      this.errorSummaryService.scrollToErrorSummary();
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
