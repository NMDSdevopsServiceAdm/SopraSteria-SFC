import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DialogComponent } from '@core/components/dialog.component';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { DataPermissions, Workplace } from '@core/model/my-workplaces.model';
import { AlertService } from '@core/services/alert.service';
import { Dialog, DIALOG_DATA } from '@core/services/dialog.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
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
  public availableParentWorkPlaces;
  public parentNameOrPostCode: string;
  public formErrorsMap: Array<ErrorDetails>;

  constructor(
    @Inject(DIALOG_DATA) public data,
    private establishmentService: EstablishmentService,
    private formBuilder: FormBuilder,
    private errorSummaryService: ErrorSummaryService,
    public dialog: Dialog<LinkToParentDialogComponent>,
    private alertService: AlertService,
    private router: Router,
  ) {
    super(data, dialog);
    this.parentNameOrPostCodeValidator = this.parentNameOrPostCodeValidator.bind(this);
    this.parentNameOrPostCodeFilter = this.parentNameOrPostCodeFilter.bind(this);
    this.setupForm();
  }

  ngOnInit() {
    this.getAvailableParentWorkPlaces();
    this.setWorkplaces();
    this.setDataPermissions();
    this.setupFormErrorsMap();
    this.setupServerErrorsMap();
  }

  //function is use to get all available parent workplaces name, uid and Postcode
  private getAvailableParentWorkPlaces() {
    this.subscriptions.add(
      this.establishmentService.getAllParentWithPostCode().subscribe(
        (parentsWithPostCode) => {
          this.availableParentWorkPlaces = parentsWithPostCode;
        },
        (error) => {
          if (error.error.message) {
            this.serverError = error.error.message;
          }
        },
      ),
    );
  }

  //set wokplace reference in modal window
  private setWorkplaces(): void {
    this.workplace = this.data;
  }

  //set the data permission array
  private setDataPermissions(): void {
    this.dataPermissions = [DataPermissions.Workplace, DataPermissions.WorkplaceAndStaff, DataPermissions.None];
  }

  //Set the form fields and validator
  private setupForm(): void {
    this.form = this.formBuilder.group({
      parentNameOrPostCode: [null, [Validators.required, this.parentNameOrPostCodeValidator]],
      dataPermission: [null, Validators.required],
    });
  }

  //setup  form error message
  public setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'parentNameOrPostCode',
        type: [
          {
            name: 'required',
            message: 'Enter parent name or post code.',
          },
          {
            name: 'validNameOrPostCode',
            message: 'Enter correct parent name or post code',
          },
        ],
      },
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

  //setup server error message
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

  /**
   * Pass in formGroup or formControl name
   * Then return error message
   * @param error item
   */
  public getFirstErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  //sync the form error event and if form is invlid then scroll to error summary
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

  /**
   * Function is used to close dialog window after successful confirmation
   * @param {any} true to close dialog after response or null to close without action
   * @return {void}
   */
  public closeDialogWindow(event: Event, confirm: any) {
    event.preventDefault();
    this.dialog.close(confirm);
  }

  /**
   * Function is used to send request to server for parent linking with request payload selected parent's uid and permission type
   * @param {void}
   * @return {void}
   */
  public sendRequestToParent() {
    if (this.form.valid) {
      this.permissionType = this.form.value.dataPermission;
      this.parentWorkplaceId = this.getParentUidOrName(this.form.value.parentNameOrPostCode, 'uid') || null;
      const setLinkAndPermission = {
        parentWorkplaceId: this.parentWorkplaceId,
        permissionToSet: this.permissionType,
        requestStatus: 'REQUESTED',
      };
      this.subscriptions.add(
        this.establishmentService.setRequestToParentForLink(this.workplace.uid, setLinkAndPermission).subscribe(
          (data) => {
            if (data) {
              const parentName = this.getParentUidOrName(this.form.value.parentNameOrPostCode, 'parentName') || null;
              this.router.navigate(['/dashboard']);
              this.alertService.addAlert({
                type: 'success',
                message: `Request to link to ${parentName} has been sent.`,
              });
              this.closeDialogWindow(event, true);
            }
          },
          (error) => {
            this.serverError = this.errorSummaryService.getServerErrorMessage(error.status, this.serverErrorsMap);
          },
        ),
      );
    }
  }

  /**
   * Function is used to validate input parent name or Post code is  valid or not.
   * if valid then return null otherwise return object {validNameOrPostCode:true}
   * @param {void}
   * @return {void}
   */
  public parentNameOrPostCodeValidator() {
    if (this.form && this.availableParentWorkPlaces) {
      const { parentNameOrPostCode } = this.form.controls;
      if (parentNameOrPostCode.value !== null) {
        const parentNameOrPostCodeLowerCase = parentNameOrPostCode.value.toLowerCase();
        return this.availableParentWorkPlaces.some(
          (wp) => wp.parentNameAndPostalcode.toLowerCase() === parentNameOrPostCodeLowerCase,
        )
          ? null
          : { validNameOrPostCode: true };
      }
    }

    return null;
  }
  /**
   * Function is used to filter parent name and Post code array based on input keys.
   * if matched found the return combition of name and Post code's array of string
   * @param {void}
   * @return {array}  array of string
   */
  public parentNameOrPostCodeFilter(): string[] {
    const parentNameOrPostCode = this.form.value.parentNameOrPostCode;
    if (this.availableParentWorkPlaces && parentNameOrPostCode && parentNameOrPostCode.length) {
      const parentNameOrPostCodeLowerCase = parentNameOrPostCode.toLowerCase();
      return this.availableParentWorkPlaces
        .filter(
          (wp) =>
            wp.parentName.toLowerCase().startsWith(parentNameOrPostCodeLowerCase) ||
            wp.postcode.toLowerCase().startsWith(parentNameOrPostCodeLowerCase) ||
            wp.parentNameAndPostalcode.toLowerCase().startsWith(parentNameOrPostCodeLowerCase),
        )
        .filter((wp) => wp.parentNameAndPostalcode.toLowerCase() !== parentNameOrPostCodeLowerCase)
        .map((wp) => wp.parentNameAndPostalcode);
    }

    return [];
  }
  /**
   * Function is used to get selected parent's uid.
   * @param {string} nameAndPostCode of selected parent
   * @param {string} desired nameOrUid of selected parent
   * @return {array}  array of string
   */
  public getParentUidOrName(nameAndPostCode: string, nameOrUid: string) {
    if (nameAndPostCode) {
      const filterArray = this.availableParentWorkPlaces.filter(
        (wp) => wp.parentNameAndPostalcode.toLowerCase() === nameAndPostCode.toLowerCase(),
      );
      if (nameOrUid === 'uid') {
        return filterArray[0].uid;
      }
      return filterArray[0].parentName;
    }
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
