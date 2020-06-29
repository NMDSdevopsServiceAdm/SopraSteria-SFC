import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { LocationAddress } from '@core/model/location.model';
import { Service } from '@core/model/services.model';
import { AddWorkplaceFlow, AddWorkplaceResponse } from '@core/model/workplace.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkplaceService } from '@core/services/workplace.service';
import { combineLatest, Subscription } from 'rxjs';

@Component({
  selector: 'app-create-user-account',
  templateUrl: './create-user-account.component.html',
})
export class CreateUserAccountComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('formEl') formEl: ElementRef;
  private flow: string;
  private serverErrorsMap: ErrorDefinition[] = this.workplaceService.serverErrorsMap;
  private subscriptions: Subscription = new Subscription();
  public form: FormGroup;
  public formControlsMap: string[] = ['Yes', 'No'];
  public formErrorsMap: Array<ErrorDetails>;
  public locationAddress: LocationAddress;
  public serverError: string;
  public submitted = false;
  public workplace: Service;

  constructor(
    private backService: BackService,
    private errorSummaryService: ErrorSummaryService,
    private establishmentService: EstablishmentService,
    private formBuilder: FormBuilder,
    private router: Router,
    private workplaceService: WorkplaceService
  ) {}

  ngOnInit() {
    this.flow = '/add-workplace';
    this.setBackLink();
    this.setupForm();
    this.setupFormErrorsMap();
    this.getWorkplaceData();
  }

  ngAfterViewInit() {
    this.errorSummaryService.formEl$.next(this.formEl);
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
      combineLatest([
        this.workplaceService.selectedLocationAddress$,
        this.workplaceService.selectedWorkplaceService$,
      ]).subscribe(([locationAddress, workplace]) => {
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
      if (this.form.get('createUserAccount').value === 'yes') {
        this.router.navigate([`${this.flow}/change-your-details`]);
      } else {
        this.addWorkplace();
      }
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
          (response: AddWorkplaceResponse) => {
            this.workplaceService.newWorkplaceUid = response.establishmentUid;
            this.workplaceService.addWorkplaceFlow$.next(AddWorkplaceFlow.CQC_NO_USER);
            this.router.navigate([`${this.flow}/complete`]);
          },
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
