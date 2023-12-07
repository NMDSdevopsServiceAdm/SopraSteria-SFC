import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { Establishment } from '@core/model/establishment.model';
import { DataPermissions } from '@core/model/my-workplaces.model';
import { AlertService } from '@core/services/alert.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { Subscription } from 'rxjs';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { SummaryList } from '@core/model/summary-list.model';

@Component({
  selector: 'app-change-data-owner',
  templateUrl: './change-data-owner.component.html',
  styleUrls: ['./change-data-owner.component.scss'],
})
export class ChangeDataOwnerComponent implements OnInit {
  public workplace: Establishment;
  public dataPermissions: DataPermissions[];
  public form: UntypedFormGroup;
  public formErrorsMap: ErrorDetails[];
  public submitted = false;
  public dataPermissionsRequester: Establishment;
  protected subscriptions: Subscription = new Subscription();
  public permissionType: string;
  public isOwnershipError: boolean;
  public serverError: string;
  public ownershipToName: string;
  public ownershipFromName: string;
  public isSubWorkplace: boolean;
  public ownershipToUid: string;
  public ownershipFromUid: string;

  constructor(
    private errorSummaryService: ErrorSummaryService,
    private establishmentService: EstablishmentService,
    private formBuilder: UntypedFormBuilder,
  ) {}

  ngOnInit() {
    // this.setWorkplaces();
    this.setDataPermissions();
    this.setupForm();
    this.setupFormErrorsMap();
    this.workplace = this.establishmentService.primaryWorkplace;
  }

  // private setWorkplaces(): void {
  //   this.dataPermissionsRequester = this.establishmentService.primaryWorkplace;
  //   this.isSubWorkplace =
  //     !this.workplace.isParent && this.workplace.uid === this.establishmentService.primaryWorkplace.uid ? true : false;

  //   if (this.workplace.dataOwner === 'Workplace') {
  //     this.ownershipToName = this.isSubWorkplace ? this.workplace.parentName : this.dataPermissionsRequester.name;
  //     this.ownershipToUid = this.isSubWorkplace ? this.workplace.uid : this.dataPermissionsRequester.uid;
  //     this.ownershipFromName = this.workplace.name;
  //     this.ownershipFromUid = this.workplace.uid;
  //   } else {
  //     this.ownershipToName = this.workplace.name;
  //     this.ownershipToUid = this.workplace.uid;
  //     this.ownershipFromName = this.isSubWorkplace ? this.workplace.parentName : this.dataPermissionsRequester.name;
  //     this.ownershipFromUid = this.isSubWorkplace ? this.workplace.parentUid : this.dataPermissionsRequester.parentUid;
  //   }
  // }

  private setDataPermissions(): void {
    this.dataPermissions = [DataPermissions.Workplace, DataPermissions.WorkplaceAndStaff, DataPermissions.None];
  }

  private setupForm(): void {
    this.form = this.formBuilder.group({
      dataPermission: [null, Validators.required],
    });
  }

  public getFirstErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  public onSubmit(): void {
    this.submitted = true;
    this.errorSummaryService.syncFormErrorsEvent.next(true);

    if (this.form.invalid) {
      this.errorSummaryService.scrollToErrorSummary();
      return;
    } else {
      console.log('form valid');
    }
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

  // public changeOwnership() {
  //   if (this.form.valid) {
  //     this.permissionType = this.form.value.dataPermission;
  //     const requestedPermission = {
  //       permissionRequest: this.permissionType,
  //       notificationRecipientUid: this.ownershipToUid,
  //     };
  //     this.subscriptions.add(
  //       this.establishmentService.changeOwnership(this.workplace.uid, requestedPermission).subscribe(
  //         (data) => {
  //           if (data) {
  //             //this.close(event, true);
  //           }
  //         },
  //         (error) => {
  //           this.isOwnershipError = true;
  //           if (error.error.message) {
  //             this.serverError = error.error.message;
  //           }
  //         },
  //       ),
  //     );
  //   }
  // }
  // public ngOnDestroy(): void {
  //   this.subscriptions.unsubscribe();
  // }
}
