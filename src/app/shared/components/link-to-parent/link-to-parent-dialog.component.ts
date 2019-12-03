import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DialogComponent } from '@core/components/dialog.component';
import { ErrorDefinition } from '@core/model/errorSummary.model';
import { DataPermissions, Workplace } from '@core/model/my-workplaces.model';
import { Nationality } from '@core/model/nationality.model';
import { Dialog, DIALOG_DATA } from '@core/services/dialog.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { NationalityService } from '@core/services/nationality.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-link-to-parent-dialog',
  templateUrl: './link-to-parent-dialog.component.html',
})
export class LinkToParentDialogComponent extends DialogComponent implements OnInit, OnDestroy {
  public dataPermissions: DataPermissions[];
  public form: FormGroup;
  public submitted = false;
  public workplace: Workplace;
  protected subscriptions: Subscription = new Subscription();
  public permissionType: string;
  public parentWorkplaceId: string;
  public serverError: string;
  public serverErrorsMap: Array<ErrorDefinition>;
  public availableParentWorkPlaces: Nationality[];
  public parentWorkplaceName: string;

  constructor(
    @Inject(DIALOG_DATA) public data,
    private establishmentService: EstablishmentService,
    private formBuilder: FormBuilder,
    private nationalityService: NationalityService,
    private errorSummaryService: ErrorSummaryService,
    public dialog: Dialog<LinkToParentDialogComponent>
  ) {
    super(data, dialog);
  }

  ngOnInit() {
    this.getAvailableParentWorkPlaces();
    this.setWorkplaces();
    this.setDataPermissions();
    this.setupForm();
    this.setupServerErrorsMap();
  }

  private getAvailableParentWorkPlaces() {
    this.subscriptions.add(
      this.nationalityService
        .getNationalities()
        .subscribe(nationalities => (this.availableParentWorkPlaces = nationalities))
    );
  }

  private setWorkplaces(): void {
    this.workplace = this.data;
  }

  private setDataPermissions(): void {
    this.dataPermissions = [DataPermissions.Workplace, DataPermissions.WorkplaceAndStaff, DataPermissions.None];
  }

  private setupForm(): void {
    this.form = this.formBuilder.group({
      dataPermission: [null],
      parentWorkplaceName: [null],
    });
  }

  private setupServerErrorsMap(): void {
    this.serverErrorsMap = [
      {
        name: 503,
        message: 'We could not send request to parent. You can try again or contact us.',
      },
      {
        name: 400,
        message: 'Unable to send request to parent.',
      },
      {
        name: 404,
        message: 'Send request to parent service not found. You can try again or contact us.',
      },
    ];
  }

  public onSubmit(): void {
    this.submitted = true;
  }

  close(confirm: boolean) {
    this.dialog.close(confirm);
  }

  public sendRequestToParent() {
    this.permissionType = this.form.value.dataPermission;
    this.parentWorkplaceId = this.form.value.parentWorkplaceName;
    const setLinkAndPermission = {
      parentWorkplaceId: this.parentWorkplaceId,
      permissionToSet: this.permissionType,
    };
    this.subscriptions.add(
      this.establishmentService.setRequestToParentForLink(this.workplace.uid, setLinkAndPermission).subscribe(
        data => {
          if (data) {
            this.close(true);
          }
        },
        error => {
          this.serverError = this.errorSummaryService.getServerErrorMessage(error.status, this.serverErrorsMap);
        }
      )
    );
  }

  public parentWorkPlacesFilter(): string[] {
    const parentWorkplaceName = this.form.value.parentWorkplaceName;

    if (this.availableParentWorkPlaces && parentWorkplaceName && parentWorkplaceName.length) {
      const parentWorkplaceNameLowerCase = parentWorkplaceName.toLowerCase();
      return this.availableParentWorkPlaces
        .filter(wp => wp.nationality.toLowerCase().startsWith(parentWorkplaceNameLowerCase))
        .filter(wp => wp.nationality.toLowerCase() !== parentWorkplaceNameLowerCase)
        .map(wp => wp.nationality);
    }

    return [];
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
