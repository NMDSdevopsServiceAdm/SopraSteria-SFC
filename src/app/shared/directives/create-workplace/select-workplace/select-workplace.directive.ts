import { AfterViewInit, Directive, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { LocationAddress } from '@core/model/location.model';
import { URLStructure } from '@core/model/url.model';
import { BackService } from '@core/services/back.service';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { WorkplaceInterfaceService } from '@core/services/workplace-interface.service';
import { ProgressBarUtil } from '@core/utils/progress-bar-util';
import { compact, isEqual } from 'lodash';
import filter from 'lodash/filter';
import { Subscription } from 'rxjs';

@Directive()
export class SelectWorkplaceDirective implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('formEl') formEl: ElementRef;
  public flow: string;
  public locationAddresses: Array<LocationAddress>;
  public form: FormGroup;
  public formErrorsMap: Array<ErrorDetails>;
  public submitted = false;
  public isCQCLocationUpdate: boolean;
  public enteredPostcode: string;
  public returnToConfirmDetails: URLStructure;
  public selectedLocationAddress: LocationAddress;
  public title: string;
  protected subscriptions: Subscription = new Subscription();
  protected nextRoute: string;
  protected errorMessage: string;
  public workplaceSections: string[];
  public userAccountSections: string[];
  public insideFlow: boolean;
  public isParent = false;

  constructor(
    protected backService: BackService,
    protected backLinkService: BackLinkService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected route: ActivatedRoute,
    protected workplaceInterfaceService: WorkplaceInterfaceService,
  ) {}

  ngOnInit(): void {
    this.workplaceSections = ProgressBarUtil.workplaceProgressBarSections();
    this.userAccountSections = ProgressBarUtil.userProgressBarSections();
    this.setErrorMessage();
    this.setupForm();
    this.setLocationAddresses();
    this.init();
    this.setupFormErrorsMap();
    this.setSelectedLocationAddress();
    this.prefillForm();
    this.setBackLink();
    this.setNextRoute();
  }

  ngAfterViewInit(): void {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  protected init(): void {} // eslint-disable-line @typescript-eslint/no-empty-function

  protected setBackLink(): void {
    this.backLinkService.showBackLink();
  }

  protected setErrorMessage(): void {
    this.errorMessage = `Select your workplace if it's displayed`;
  }

  public setNextRoute(): void {} // eslint-disable-line @typescript-eslint/no-empty-function

  protected setupForm(): void {
    this.form = this.formBuilder.group({
      workplace: [
        '',
        {
          validators: [Validators.required],
          updateOn: 'submit',
        },
      ],
    });
  }

  protected setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'workplace',
        type: [
          {
            name: 'required',
            message: this.errorMessage,
          },
        ],
      },
    ];
  }

  protected setLocationAddresses(): void {
    this.subscriptions.add(
      this.workplaceInterfaceService.locationAddresses$.subscribe((locationAddresses: Array<LocationAddress>) => {
        if (locationAddresses) {
          this.enteredPostcode = locationAddresses[0].postalCode;
          this.locationAddresses = locationAddresses;
        }
      }),
    );
  }

  protected setSelectedLocationAddress(): void {
    this.subscriptions.add(
      this.workplaceInterfaceService.selectedLocationAddress$.subscribe(
        (locationAddress: LocationAddress) => (this.selectedLocationAddress = locationAddress),
      ),
    );
  }

  public prefillForm(): void {
    if (this.indexOfSelectedLocationAddress() >= 0) {
      this.form.setValue({
        workplace: this.indexOfSelectedLocationAddress().toString(),
      });
    }
  }

  protected indexOfSelectedLocationAddress(): number {
    return this.locationAddresses?.findIndex((address) => {
      return isEqual(address, this.selectedLocationAddress);
    });
  }

  protected getSelectedLocation(): LocationAddress {
    const selectedLocationId = this.selectedLocationAddress.locationId;
    return filter(this.locationAddresses, ['locationId', selectedLocationId])[0];
  }

  public onSubmit(): void {
    this.submitted = true;
    this.errorSummaryService.syncFormErrorsEvent.next(true);

    if (this.form.valid) {
      this.setSelectedAddress(this.form.get('workplace').value);
      this.checkIfEstablishmentExist();
    } else {
      this.errorSummaryService.scrollToErrorSummary();
    }
  }

  private checkIfEstablishmentExist(): void {
    const { locationId } = this.getSelectedLocation();
    this.subscriptions.add(
      this.workplaceInterfaceService.checkIfEstablishmentExists(locationId).subscribe(
        (establishmentExists) => {
          if (establishmentExists.exists) {
            this.router.navigate([this.flow, 'cannot-create-account'], {
              state: { returnTo: `${this.flow}/select-workplace` },
            });
          } else {
            this.save();
          }
        },
        () => this.router.navigate(['/problem-with-the-service']),
      ),
    );
  }

  protected save(): void {
    this.workplaceInterfaceService.manuallyEnteredWorkplace$.next(false);
    this.workplaceInterfaceService.selectedLocationAddress$.next(this.getSelectedLocation());
    this.navigateToNextPage();
  }

  protected navigateToNextPage(): void {
    const url = this.returnToConfirmDetails ? [this.flow] : [this.flow, 'type-of-employer'];
    this.router.navigate(url);
  }

  private setSelectedAddress(index: number): void {
    this.selectedLocationAddress = this.locationAddresses[index];
  }

  public getLocationName(location: LocationAddress): string {
    const address = [
      location.locationName,
      location.addressLine1,
      location.addressLine2,
      location.addressLine3,
      location.townCity,
      location.postalCode,
    ];
    return compact(address).join(', ');
  }

  /**
   * Pass in formGroup or formControl name and errorType
   * Then return error message
   * @param item
   * @param errorType
   */
  public getFormErrorMessage(item: string, errorType: string): string {
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
