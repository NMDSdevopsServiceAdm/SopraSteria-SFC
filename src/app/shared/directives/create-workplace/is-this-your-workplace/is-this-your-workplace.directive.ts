import { AfterViewInit, Directive, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { Establishment } from '@core/model/establishment.model';
import { LocationAddress } from '@core/model/location.model';
import { URLStructure } from '@core/model/url.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkplaceInterfaceService } from '@core/services/workplace-interface.service';

@Directive()
export class IsThisYourWorkplaceDirective implements OnInit, AfterViewInit {
  @ViewChild('formEl') formEl: ElementRef;
  public form: FormGroup;
  public formErrorsMap: Array<ErrorDetails>;
  protected serverErrorsMap: Array<ErrorDefinition>;
  public submitted = false;
  protected flow: string;
  public locationData: LocationAddress;
  public serverError: string;
  public workplace: Establishment;
  public isParent: boolean;
  public searchMethod: string;
  public returnToConfirmDetails: URLStructure;

  constructor(
    protected errorSummaryService: ErrorSummaryService,
    protected establishmentService: EstablishmentService,
    public backService: BackService,
    protected route: ActivatedRoute,
    protected router: Router,
    protected workplaceInterfaceService: WorkplaceInterfaceService,
    protected formBuilder: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.flow = this.route.snapshot.parent.url[0].path;
    this.returnToConfirmDetails = this.workplaceInterfaceService.returnTo$.value;
    this.setupForm();
    this.setBackLink();
    this.locationData = this.workplaceInterfaceService.locationAddresses$.value[0];
    this.searchMethod = this.workplaceInterfaceService.searchMethod$.value;
    this.workplace = this.establishmentService.primaryWorkplace;
    this.workplace?.isParent ? (this.isParent = true) : (this.isParent = false);
    this.setupFormErrorsMap();
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

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected setupFormErrorsMap(): void {}

  public getErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  public setBackLink(): void {
    this.backService.setBackLink({ url: [`/${this.flow}`, 'find-workplace'] });
  }

  public onSubmit(): void {
    const yourWorkplace = this.form.get('yourWorkplace');
    this.submitted = true;

    if (this.form.valid) {
      if (yourWorkplace.value === 'yes') {
        this.workplaceInterfaceService.manuallyEnteredWorkplace$.next(false);
        this.setCurrentLocationToSelectedAddress();
        this.router.navigate([this.flow, this.getNextRoute()]);
      } else {
        this.router.navigate([this.flow, 'find-workplace']);
      }
    } else {
      this.errorSummaryService.scrollToErrorSummary();
    }
  }

  private setCurrentLocationToSelectedAddress(): void {
    this.workplaceInterfaceService.selectedLocationAddress$.next(this.locationData);
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected getNextRoute(): void {}
}
