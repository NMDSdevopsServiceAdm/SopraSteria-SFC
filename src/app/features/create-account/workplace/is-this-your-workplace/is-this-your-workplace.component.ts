import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { Establishment } from '@core/model/establishment.model';
import { LocationAddress } from '@core/model/location.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
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
  public workplace: Establishment;
  public isParent: boolean;
  public searchMethod: string;

  constructor(
    private errorSummaryService: ErrorSummaryService,
    private establishmentService: EstablishmentService,
    public backService: BackService,
    private route: ActivatedRoute,
    private router: Router,
    private registrationService: RegistrationService,
    private formBuilder: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.flow = this.route.snapshot.parent.url[0].path;
    this.setupForm();
    this.setupFormErrorsMap();
    this.setBackLink();
    this.locationData = this.registrationService.locationAddresses$.value[0];
    console.log(this.locationData);
    this.searchMethod = this.registrationService.searchMethod$.value;
    console.log('****************');
    console.log(this.searchMethod);
    this.workplace = this.establishmentService.primaryWorkplace;
    this.workplace?.isParent ? (this.isParent = true) : (this.isParent = false);
  }

  public ngAfterViewInit(): void {
    this.errorSummaryService.formEl$.next(this.formEl);
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

  public setBackLink(): void {
    this.backService.setBackLink({ url: [`/${this.flow}`, 'find-workplace'] });
  }

  onSubmit(): void {
    const yourWorkplace = this.form.get('yourWorkplace');
    this.submitted = true;

    if (this.form.valid) {
      if (yourWorkplace.value === 'yes') {
        this.router.navigate([this.flow, 'select-main-service']);
      } else {
        this.router.navigate([this.flow, 'find-workplace']);
      }
    } else {
      this.errorSummaryService.scrollToErrorSummary();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
