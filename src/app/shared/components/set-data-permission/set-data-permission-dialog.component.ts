import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DialogComponent } from '@core/components/dialog.component';
import { ErrorDefinition } from '@core/model/errorSummary.model';
import { Establishment } from '@core/model/establishment.model';
import { DataPermissions, Workplace } from '@core/model/my-workplaces.model';
import { Dialog, DIALOG_DATA } from '@core/services/dialog.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-set-data-permission-dialog',
  templateUrl: './set-data-permission-dialog.component.html',
})
export class SetDataPermissionDialogComponent extends DialogComponent implements OnInit, OnDestroy {
  public dataPermissions: DataPermissions[];
  public form: FormGroup;
  public submitted = false;
  public workplace: Workplace;
  public dataPermissionsRequester: Establishment;
  protected subscriptions: Subscription = new Subscription();
  public permissionType: string;
  public serverError: string;
  public serverErrorsMap: Array<ErrorDefinition>;
  public readOnlyPermissionTo: string;

  constructor(
    @Inject(DIALOG_DATA) public data,
    private establishmentService: EstablishmentService,
    private formBuilder: FormBuilder,
    private errorSummaryService: ErrorSummaryService,
    public dialog: Dialog<SetDataPermissionDialogComponent>,
  ) {
    super(data, dialog);
  }

  ngOnInit() {
    this.setWorkplaces();
    this.setDataPermissions();
    this.setupForm();
    this.setupServerErrorsMap();
  }

  private setWorkplaces(): void {
    this.workplace = this.data;

    this.readOnlyPermissionTo =
      this.workplace.dataOwner === 'Workplace' ? this.workplace.parentName : this.workplace.name;
  }

  private setDataPermissions(): void {
    this.dataPermissions = [DataPermissions.Workplace, DataPermissions.WorkplaceAndStaff, DataPermissions.None];
  }

  private setupForm(): void {
    this.form = this.formBuilder.group({
      dataPermission: [null],
    });
  }

  private setupServerErrorsMap(): void {
    this.serverErrorsMap = [
      {
        name: 503,
        message: 'We could not set data permission. You can try again or contact us.',
      },
      {
        name: 400,
        message: 'Unable to set data permission.',
      },
      {
        name: 404,
        message: 'Set data permission service not found. You can try again or contact us.',
      },
    ];
  }

  public onSubmit(): void {
    this.submitted = true;
  }

  close(event: Event, confirm: boolean) {
    event.preventDefault();
    this.dialog.close(confirm);
  }

  public setPermissions() {
    this.permissionType = this.form.value.dataPermission;
    const setPermission = {
      permissionToSet: this.permissionType,
    };
    this.subscriptions.add(
      this.establishmentService.setDataPermission(this.workplace.uid, setPermission).subscribe(
        data => {
          if (data) {
            this.workplace.dataPermissions = data.dataPermissions;
            this.close(event, true);
          }
        },
        error => {
          this.serverError = this.errorSummaryService.getServerErrorMessage(error.status, this.serverErrorsMap);
        },
      ),
    );
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
