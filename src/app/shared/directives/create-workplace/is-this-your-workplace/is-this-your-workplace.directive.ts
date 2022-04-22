import { AfterViewInit, Directive, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
import { Subscription } from 'rxjs';

@Directive()
export class IsThisYourWorkplaceDirective implements OnInit, AfterViewInit, OnDestroy {
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
  public revealTitle: string;
  public returnToConfirmDetails: URLStructure;
  private subscriptions: Subscription = new Subscription();

  constructor(
    protected errorSummaryService: ErrorSummaryService,
    protected establishmentService: EstablishmentService,
    public backService: BackService,
    protected route: ActivatedRoute,
    protected router: Router,
    public workplaceInterfaceService: WorkplaceInterfaceService,
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
    this.isParent = this.workplace?.isParent;
    this.revealTitle = `Spotted a mistake in ${this.isParent ? 'the' : 'your'} workplace details?`;
    this.prefillForm();
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

  protected prefillForm(): void {
    if (this.workplaceInterfaceService.selectedLocationAddress$.value?.locationId === this.locationData.locationId) {
      this.form.patchValue({
        yourWorkplace: 'yes',
      });
    }
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
        this.checkIfEstablishmentExists();
      } else {
        this.router.navigate([this.flow, 'find-workplace']);
      }
    } else {
      this.errorSummaryService.scrollToErrorSummary();
    }
  }

  private checkIfEstablishmentExists(): void {
    this.subscriptions.add(
      this.workplaceInterfaceService.checkIfEstablishmentExists(this.locationData.locationId).subscribe(
        (establishmentExists) => {
          if (establishmentExists.exists) {
            this.router.navigate([this.flow, 'cannot-create-account'], {
              state: { returnTo: `${this.flow}/your-workplace` },
            });
          } else {
            this.workplaceInterfaceService.manuallyEnteredWorkplace$.next(false);
            this.setCurrentLocationToSelectedAddress();
            this.router.navigate([this.flow, this.getNextRoute()]);
          }
        },
        () => this.router.navigate(['/problem-with-the-service']),
      ),
    );
  }

  private setCurrentLocationToSelectedAddress(): void {
    this.workplaceInterfaceService.selectedLocationAddress$.next(this.locationData);
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected getNextRoute(): void {}

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
