import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { Establishment } from '@core/model/establishment.model';
import { DataPermissions } from '@core/model/my-workplaces.model';
import { AlertService } from '@core/services/alert.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-change-data-owner',
    templateUrl: './change-data-owner.component.html',
    styleUrls: ['./change-data-owner.component.scss'],
    standalone: false
})
export class ChangeDataOwnerComponent implements OnInit, AfterViewInit {
  @ViewChild('formEl') formEl: ElementRef;
  protected subscriptions: Subscription = new Subscription();
  public primaryWorkplace: Establishment;
  public dataPermissions: DataPermissions[];
  public form: UntypedFormGroup;
  public formErrorsMap: Array<ErrorDetails>;
  public serverErrorsMap: Array<ErrorDefinition>;
  public submitted = false;
  public dataPermissionsRequester: Establishment;
  public permissionType: string;
  public isOwnershipError: boolean;
  public serverError: string;
  public ownershipToName: string;
  public ownershipFromName: string;
  public isSubWorkplace: boolean;
  public ownershipToUid: string;
  public ownershipFromUid: string;
  public ownershipFromPostCode: string;
  public isParent: boolean;
  public workplace: Establishment;
  public changeDataOwnerFromSubsidiaryUid: string;

  constructor(
    private errorSummaryService: ErrorSummaryService,
    private establishmentService: EstablishmentService,
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    public route: ActivatedRoute,
    private breadcrumbService: BreadcrumbService,
    private alertService: AlertService,
  ) {}

  ngAfterViewInit() {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  ngOnInit() {
    this.setDataPermissions();
    this.setupForm();
    this.setupFormErrorsMap();
    this.setupServerErrorsMap();

    this.primaryWorkplace = this.route.snapshot.data.establishment;
    this.isParent = this.primaryWorkplace?.isParent;
    this.changeDataOwnerFromSubsidiaryUid = this.route.snapshot.queryParams?.changeDataOwnerFrom;

    this.getSubsidiaryWorkplace();

    this.breadcrumbService.show(this.showJourneyType());
  }

  public getSubsidiaryWorkplace() {
    if (this.changeDataOwnerFromSubsidiaryUid) {
      this.subscriptions.add(
        this.establishmentService.getEstablishment(this.changeDataOwnerFromSubsidiaryUid).subscribe((workplace) => {
          if (workplace) {
            this.setWorkplaces(workplace);
          }
        }),
      );
    } else {
      this.setWorkplaces(this.primaryWorkplace);
    }
  }

  public showJourneyType(): any {
    return this.isParent ? JourneyType.ALL_WORKPLACES : JourneyType.CHANGE_DATA_OWNER;
  }

  public setWorkplaces(workplace): void {
    this.workplace = workplace;
    this.dataPermissionsRequester = this.primaryWorkplace;

    this.isSubWorkplace = !this.workplace.isParent && this.workplace.uid === this.primaryWorkplace.uid ? true : false;

    if (this.workplace.dataOwner === 'Workplace') {
      this.ownershipToName = this.isSubWorkplace ? this.workplace.parentName : this.dataPermissionsRequester.name;
      this.ownershipToUid = this.isSubWorkplace ? this.workplace.uid : this.dataPermissionsRequester.uid;
      this.ownershipFromName = this.workplace.name;
      this.ownershipFromUid = this.workplace.uid;
      this.ownershipFromPostCode = this.workplace.postcode;
    } else {
      this.ownershipToName = this.workplace.name;
      this.ownershipToUid = this.workplace.uid;
      this.ownershipFromName = this.isSubWorkplace ? this.workplace.parentName : this.dataPermissionsRequester.name;
      this.ownershipFromUid = this.isSubWorkplace ? this.workplace.parentUid : this.dataPermissionsRequester.parentUid;
      this.ownershipFromPostCode = this.isSubWorkplace
        ? this.workplace.parentPostcode
        : this.dataPermissionsRequester.parentPostcode;
    }
  }

  private setDataPermissions(): void {
    this.dataPermissions = [DataPermissions.Workplace, DataPermissions.WorkplaceAndStaff, DataPermissions.None];
  }

  private setupForm(): void {
    this.form = this.formBuilder.group({
      dataPermission: ['', { validators: [Validators.required], updateOn: 'submit' }],
    });
  }

  /**
   * Pass in formGroup or formControl name
   * Then return error message
   * @param error item
   */
  public getFormErrorMessage(item: string, errorType: string): string {
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  private setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'dataPermission',
        type: [
          {
            name: 'required',
            message: 'Select which data permission you want them to have',
          },
        ],
      },
    ];
  }

  private setupServerErrorsMap(): void {
    this.serverErrorsMap = [
      {
        name: 500,
        message: 'We could not send request to change data owner. You can try again or contact us.',
      },
      {
        name: 400,
        message: 'Unable to send request to change data owner.',
      },
      {
        name: 404,
        message: 'Send request to change data owner service not found. You can try again or contact us.',
      },
    ];
  }

  public sendAlert(): void {
    this.alertService.addAlert({ type: 'success', message: "You've sent a change data owner request" });
  }

  public onSubmit(): void {
    this.submitted = true;
    this.errorSummaryService.syncFormErrorsEvent.next(true);
    if (this.form.invalid) {
      this.errorSummaryService.scrollToErrorSummary();
      return;
    } else {
      this.changeOwnership();
    }
  }

  /**
   * @param {void}
   * @return {void}
   */

  public changeOwnership(): void {
    if (this.form.valid) {
      this.permissionType = this.form.value.dataPermission;
      const requestedPermission = {
        permissionRequest: this.permissionType,
        notificationRecipientUid: this.ownershipToUid,
      };

      this.subscriptions.add(
        this.establishmentService.changeOwnership(this.workplace.uid, requestedPermission).subscribe(
          (data) => {
            if (data) {
              if (this.isParent) {
                this.router
                  .navigate(['/workplace/view-all-workplaces'], {
                    state: { changeDataOwnerStatus: true },
                  })
                  .then(() => {
                    this.sendAlert();
                  });
              } else {
                this.router
                  .navigate(['/dashboard'], {
                    state: { changeDataOwnerStatus: true },
                  })
                  .then(() => {
                    this.sendAlert();
                  });
              }
            }
          },
          (error) => {
            this.isOwnershipError = true;
            if (error.error.message) {
              this.serverError = error.error.message;
            }
          },
        ),
      );
    }
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
