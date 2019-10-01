import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogComponent } from '@core/components/dialog.component';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { Establishment } from '@core/model/establishment.model';
import { DataPermissions, Workplace } from '@core/model/my-workplaces.model';
import { SummaryList } from '@core/model/summary-list.model';
import { Dialog, DIALOG_DATA } from '@core/services/dialog.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-change-data-owner-dialog',
  templateUrl: './change-data-owner-dialog.component.html',
})
export class ChangeDataOwnerDialogComponent extends DialogComponent implements OnInit, OnDestroy {
  public dataPermissions: DataPermissions[];
  public form: FormGroup;
  public formErrorsMap: ErrorDetails[];
  public submitted = false;
  public workplace: Workplace;
  public dataPermissionsRequester: Establishment;
  public summaryList: SummaryList[];
  protected subscriptions: Subscription = new Subscription();
  public permissionType: string;
  public isOwnershipError: boolean;
  public serverError: string;

  constructor(
    @Inject(DIALOG_DATA) public data,
    private errorSummaryService: ErrorSummaryService,
    private establishmentService: EstablishmentService,
    private formBuilder: FormBuilder,
    public dialog: Dialog<ChangeDataOwnerDialogComponent>
  ) {
    super(data, dialog);
  }

  ngOnInit() {
    this.setWorkplaces();
    this.setDataPermissions();
    this.setupSummaryList();
    this.setupForm();
    this.setupFormErrorsMap();
  }

  private setWorkplaces(): void {
    this.workplace = this.data;
    this.dataPermissionsRequester = this.establishmentService.primaryWorkplace;
  }

  private setDataPermissions(): void {
    this.dataPermissions = [
      DataPermissions.Workplace,
      DataPermissions.WorkplaceAndStaff,
      DataPermissions.None,
    ];
  }

  private setupSummaryList(): void {
    this.summaryList = [
      {
        label: 'From',
        data: this.workplace.name,
      },
      {
        label: 'To',
        data: this.dataPermissionsRequester.name,
      },
    ];
  }

  private setupForm(): void {
    this.form = this.formBuilder.group({
      dataPermission: [null, Validators.required],
    });
  }

  close(confirm: boolean) {
    this.dialog.close(confirm);
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
            message: 'Select data permissions',
          },
        ],
      },
    ];
  }
  public changeOwnership() {
    if (this.form.valid) {
      this.permissionType = this.form.value.dataPermission;
      let requestedPermission = {
        permissionRequest: this.permissionType,
      };
      this.subscriptions.add(
        this.establishmentService
          .changeOwnership(this.workplace.uid, requestedPermission)
          .subscribe(data => {
            if (data) {
              this.close(true);
            }
          },
            error => {
              this.isOwnershipError = true;
              this.serverError = error.error.message;
            })
      );
    }
  }
  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
