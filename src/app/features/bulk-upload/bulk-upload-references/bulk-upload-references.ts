import { HttpErrorResponse } from '@angular/common/http';
import { OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { Workplace } from '@core/model/my-workplaces.model';
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
  public references: Workplace[] = []; // TODO update to Workplace[] | StaffRecord[]
  public referenceType: string;
  public return: URLStructure;
  public serverError: string;
  public serverErrorsMap: ErrorDefinition[] = [];
  public submitted = false;

  constructor(
    protected authService: AuthService,
    protected router: Router,
    protected formBuilder: FormBuilder,
    protected errorSummaryService: ErrorSummaryService,
    protected userService: UserService
  ) {}

  ngOnInit() {
    this.init();
    this.setupForm();
    this.getReferences();
    this.setPrimaryEstablishmentName();
  }

  protected init() {}

  private setPrimaryEstablishmentName(): void {
    this.primaryEstablishmentName = this.authService.establishment.name;
  }

  private setupForm(): void {
    this.form = this.formBuilder.group({});
  }

  protected getReferences(): void {}

  protected updateForm(): void {
    this.references.forEach((reference: Workplace) => {
      this.form.addControl(
        `name-${reference.uid}`,
        new FormControl(null, [Validators.required, this.uniqueValidator.bind(this)])
      );

      this.formErrorsMap.push({
        item: `name-${reference.uid}`,
        type: [
          {
            name: 'required',
            message: `Enter the missing ${this.referenceType.toLowerCase()} reference.`,
          },
          {
            name: 'unique',
            message: `Enter a different ${this.referenceType.toLowerCase()} reference.`,
          },
        ],
      });
    });
  }

  protected onError(error: HttpErrorResponse): void {
    this.serverError = this.errorSummaryService.getServerErrorMessage(error.status, this.serverErrorsMap);
    this.errorSummaryService.scrollToErrorSummary();
  }

  protected uniqueValidator(control: AbstractControl): { [key: string]: boolean } | null  {
    const formValues: string[] = Object.values(this.form.value);
    const isDuplicate: boolean = formValues.includes(control.value);
    return isDuplicate ? { unique: true } : null;
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
