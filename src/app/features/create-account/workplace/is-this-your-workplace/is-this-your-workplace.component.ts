import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { LocationAddress, LocationSearchResponse } from '@core/model/location.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { LocationService } from '@core/services/location.service';
import { RegistrationService } from '@core/services/registration.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-is-this-your-workplace',
  templateUrl: './is-this-your-workplace.component.html',
})
export class IsThisYourWorkplaceComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('formEl') formEl: ElementRef;
  public form: FormGroup;
  public formErrorsMap: Array<ErrorDetails>;
  protected serverErrorsMap: Array<ErrorDefinition>;
  public submitted = false;
  private flow: string;
  public locationData: LocationAddress;
  public serverError: string;
  protected subscriptions: Subscription = new Subscription();

  constructor(
    private errorSummaryService: ErrorSummaryService,
    private backService: BackService,
    private route: ActivatedRoute,
    private router: Router,
    private registrationService: RegistrationService,
    private locationService: LocationService,
    private formBuilder: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.flow = this.route.snapshot.parent.url[0].path;
    this.setupForm();
    this.setupFormErrorsMap();
    this.setBackLink();

    if (this.registrationService.locationAddresses$.value) {
      this.locationData = this.registrationService.locationAddresses$.value[0];
    } else {
      this.subscriptions.add(
        this.locationService.getLocationByPostcodeOrLocationID(this.route.snapshot.params.id).subscribe(
          (data: LocationSearchResponse) => this.onSuccess(data),
          (error: HttpErrorResponse) => this.onError(error),
        ),
      );
    }
  }

  public ngAfterViewInit(): void {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  private onError(error: HttpErrorResponse): void {
    if (error.status === 404) {
      console.log('workplace-not-found');
      this.router.navigate([this.flow, 'workplace-not-found']);
      return;
    }
    this.serverError = this.errorSummaryService.getServerErrorMessage(error.status, this.serverErrorsMap);
    this.errorSummaryService.scrollToErrorSummary();
  }

  protected onSuccess(data: LocationSearchResponse): void {
    this.locationData = data.locationdata[0];
    this.registrationService.locationAddresses$.next(data.locationdata);
    console.log(this.locationData);
  }

  private setupForm(): void {
    this.form = this.formBuilder.group({
      yourWorkplace: [
        null,
        {
          validators: [Validators.required],
          updateOn: 'submit',
        },
      ],
    });
  }

  protected setupServerErrorsMap(): void {
    this.serverErrorsMap = [
      {
        name: 404,
        message: 'No location found.',
      },
      {
        name: 400,
        message: 'Invalid Postcode.',
      },
      {
        name: 503,
        message: 'Database Error',
      },
    ];
  }

  private setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'yourWorkplace',
        type: [
          {
            name: 'required',
            message: 'Select yes if this is your workplace',
          },
        ],
      },
    ];
  }

  public getErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  protected setBackLink(): void {
    this.backService.setBackLink({ url: [`/${this.flow}`, 'find-workplace'] });
  }

  onSubmit(): void {
    const yourWorkplace = this.form.get('yourWorkplace');
    this.submitted = true;

    if (this.form.valid) {
      if (yourWorkplace.value === 'yes') {
        console.log('You clicked Yes');
      } else {
        console.log('You clicked No');
      }
    } else {
      console.log('Please select yes or no');
      this.errorSummaryService.scrollToErrorSummary();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
