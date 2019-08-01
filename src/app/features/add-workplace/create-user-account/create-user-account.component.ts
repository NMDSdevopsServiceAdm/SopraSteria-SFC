import { Component, OnDestroy, OnInit } from '@angular/core';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { combineLatest, Subscription } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { Router } from '@angular/router';
import { WorkplaceService } from '@core/services/workplace.service';
import { Service } from '@core/model/services.model';
import { HttpErrorResponse } from '@angular/common/http';
import { EstablishmentService } from '@core/services/establishment.service';
import { LocationAddress } from '@core/model/location.model';

@Component({
  selector: 'app-create-user-account',
  templateUrl: './create-user-account.component.html',
})
export class CreateUserAccountComponent implements OnInit, OnDestroy {
  private flow: string;
  private locationAddress: LocationAddress;
  private serverErrorsMap: ErrorDefinition[] = this.workplaceService.serverErrorsMap;
  private subscriptions: Subscription = new Subscription();
  public form: FormGroup;
  public formControlsMap: string[] = ['Yes', 'No'];
  public formErrorsMap: Array<ErrorDetails>;
  public serverError: string;
  public submitted = false;
  public workplace: Service;

  constructor(
    private backService: BackService,
    private errorSummaryService: ErrorSummaryService,
    private establishmentService: EstablishmentService,
    private formBuilder: FormBuilder,
    private router: Router,
    private workplaceService: WorkplaceService,
  ) {}

  ngOnInit() {
    this.flow = '/add-workplace';
    this.setBackLink();
    this.setupForm();
    this.setupFormErrorsMap();
    this.getWorkplaceData();
  }

  private setBackLink(): void {
    this.backService.setBackLink({ url: [`${this.flow}/confirm-workplace-details`] });
  }

  protected setupForm(): void {
    this.form = this.formBuilder.group({
      createUserAccount: [null, Validators.required],
    });
  }

  protected setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'createUserAccount',
        type: [
          {
            name: 'required',
            message: 'Please specify if you want to create a user account.',
          },
        ],
      },
    ];
  }

  private getWorkplaceData(): void {
    this.subscriptions.add(
      combineLatest(
        this.workplaceService.selectedLocationAddress$,
        this.workplaceService.selectedWorkplaceService$
      ).subscribe(([locationAddress, workplace]) => {
        this.locationAddress = locationAddress;
        this.workplace = workplace;
      })
    );
  }

  public getFirstErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  public onSubmit(): void {
    this.submitted = true;
    this.errorSummaryService.syncFormErrorsEvent.next(true);

    if (this.form.valid) {
      this.addWorkplace();
    } else {
      this.errorSummaryService.scrollToErrorSummary();
    }
  }

  private addWorkplace(): void {
    this.subscriptions.add(
      this.workplaceService
        .addWorkplace(
          this.establishmentService.primaryWorkplace.uid,
          this.workplaceService.generateAddWorkplaceRequest(this.locationAddress, this.workplace)
        )
        .subscribe(
          () => this.router.navigate([`${this.flow}/complete`]),
          (response: HttpErrorResponse) => {
            this.serverError = this.errorSummaryService.getServerErrorMessage(response.status, this.serverErrorsMap);
            this.errorSummaryService.scrollToErrorSummary();
          }
        )
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
