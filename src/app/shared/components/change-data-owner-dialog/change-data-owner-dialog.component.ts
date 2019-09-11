import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogComponent } from '@core/components/dialog.component';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { Establishment } from '@core/model/establishment.model';
import { DataPermissions, Workplace } from '@core/model/my-workplaces.model';
import { SummaryList } from '@core/model/summary-list.model';
import { Dialog, DIALOG_DATA } from '@core/services/dialog.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';

@Component({
  selector: 'app-change-data-owner-dialog',
  templateUrl: './change-data-owner-dialog.component.html',
})
export class ChangeDataOwnerDialogComponent extends DialogComponent implements OnInit {
  public dataPermissions: DataPermissions[];
  public form: FormGroup;
  public formErrorsMap: ErrorDetails[];
  public submitted = false;
  public workplace: Workplace;
  public dataPermissionsRequester: Establishment;
  public summaryList: SummaryList[];

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
}
