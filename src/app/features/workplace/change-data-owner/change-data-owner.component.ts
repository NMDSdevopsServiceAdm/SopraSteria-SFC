import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { Establishment } from '@core/model/establishment.model';
import { DataPermissions } from '@core/model/my-workplaces.model';
import { AlertService } from '@core/services/alert.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { Subscription } from 'rxjs';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';

@Component({
  selector: 'app-change-data-owner',
  templateUrl: './change-data-owner.component.html',
  styleUrls: ['./change-data-owner.component.scss'],
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
  public journeyType;
  public alertMessage: any;
  public isParent: boolean;
  public subWorkplace: Establishment;

  constructor(
    private errorSummaryService: ErrorSummaryService,
    private establishmentService: EstablishmentService,
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    protected route: ActivatedRoute,
    private breadcrumbService: BreadcrumbService,
  ) {}

  ngAfterViewInit(): void {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  ngOnInit() {
    this.setDataPermissions();
    this.setupForm();
    this.setupFormErrorsMap();

    this.primaryWorkplace = this.establishmentService.primaryWorkplace;
    this.isParent = this.primaryWorkplace?.isParent;
    //this.getSubWorkplace();
    this.setWorkplaces();
    this.breadcrumbService.show(this.showJourneyType(), this.primaryWorkplace.name);
    this.alertMessage = {
      alertMessage: "You've sent a change data owner request",
      changeDataOwnerStatus: true,
    };
  }

  public getSubWorkplace(): void {
    const indexOfChild = this.route.snapshot.queryParams?.changeDataOwner;
    if (indexOfChild) {
      const childWorkplaces = this.route.snapshot.data.childWorkplaces.childWorkplaces;
      this.subWorkplace = childWorkplaces[indexOfChild];
    } else {
      this.subWorkplace = this.establishmentService.primaryWorkplace;
    }
  }

  public showJourneyType(): any {
    this.journeyType = this.primaryWorkplace.isParent ? JourneyType.ALL_WORKPLACES : JourneyType.CHANGE_DATA_OWNER;
    return this.journeyType;
  }

  private setWorkplaces(): void {
    this.getSubWorkplace();
    this.dataPermissionsRequester = this.establishmentService.primaryWorkplace;
    this.isSubWorkplace =
      !this.subWorkplace.isParent && this.subWorkplace.uid === this.establishmentService.primaryWorkplace.uid
        ? true
        : false;

    if (this.subWorkplace.dataOwner === 'Workplace') {
      this.ownershipToName = this.isSubWorkplace ? this.subWorkplace.parentName : this.dataPermissionsRequester.name;
      this.ownershipToUid = this.isSubWorkplace ? this.subWorkplace.uid : this.dataPermissionsRequester.uid;
      this.ownershipFromName = this.subWorkplace.name;
      this.ownershipFromUid = this.subWorkplace.uid;
      this.ownershipFromPostCode = this.subWorkplace.postcode;
    } else {
      this.ownershipToName = this.subWorkplace.name;
      this.ownershipToUid = this.subWorkplace.uid;
      this.ownershipFromName = this.isSubWorkplace ? this.subWorkplace.parentName : this.dataPermissionsRequester.name;
      this.ownershipFromUid = this.isSubWorkplace
        ? this.subWorkplace.parentUid
        : this.dataPermissionsRequester.parentUid;
      this.ownershipFromPostCode = this.isSubWorkplace
        ? this.subWorkplace.parentPostcode
        : this.dataPermissionsRequester.parentPostcode;
    }
  }

  private setDataPermissions(): void {
    this.dataPermissions = [DataPermissions.Workplace, DataPermissions.WorkplaceAndStaff, DataPermissions.None];
  }

  private setupForm(): void {
    this.form = this.formBuilder.group(
      {
        dataPermission: [null, Validators.required],
      },
      { updateOn: 'submit' },
    );
  }

  /**
   * Pass in formGroup or formControl name
   * Then return error message
   * @param error item
   */

  public getFirstErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
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

  public onSubmit(): void {
    this.submitted = true;
    this.errorSummaryService.syncFormErrorsEvent.next(true);
    if (this.form.invalid) {
      this.errorSummaryService.scrollToErrorSummary();
      return;
    }
  }

  /**
   * @param {void}
   * @return {void}
   */

  public changeOwnership() {
    if (this.form.valid) {
      this.permissionType = this.form.value.dataPermission;
      const requestedPermission = {
        permissionRequest: this.permissionType,
        notificationRecipientUid: this.ownershipToUid,
      };
      this.subscriptions.add(
        this.establishmentService.changeOwnership(this.subWorkplace.uid, requestedPermission).subscribe(
          (data) => {
            if (data) {
              if (this.isParent) {
                this.router.navigate(['/workplace/view-all-workplaces'], {
                  state: this.alertMessage,
                });
              } else {
                this.router.navigate(['/dashboard'], {
                  state: this.alertMessage,
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
