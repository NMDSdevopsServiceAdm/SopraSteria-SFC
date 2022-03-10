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
  selector: 'app-move-workplace-dialog',
  templateUrl: './move-workplace-dialog.component.html',
})
export class MoveWorkplaceDialogComponent extends DialogComponent implements OnInit, OnDestroy {
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
    public dialog: Dialog<MoveWorkplaceDialogComponent>,
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
    ];
  }

  //setup server error message
  private setupServerErrorsMap(): void {
    this.serverErrorsMap = [
      {
        name: 403,
        message: 'Invalid request parameters.',
      },
      {
        name: 406,
        message: 'The requested parent is not a parent.',
      },
      {
        name: 404,
        message: 'Parent or Sub not found.',
      },
      {
        name: 500,
        message: 'Failed to save updates.',
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
      this.moveWorkplaceAdmin();
    }
  }

  private moveWorkplaceAdmin(): void {
    const parentAndSubWorkplaces = {
      parentUid: this.getParentUidOrName(this.form.value.parentNameOrPostCode, 'uid'),
      subUid: this.workplace.uid,
    };

    this.subscriptions.add(
      this.establishmentService.adminMoveWorkplace(parentAndSubWorkplaces).subscribe(
        () => {
          {
            this.router.navigate(['/dashboard']);
            const parentName = this.getParentUidOrName(this.form.value.parentNameOrPostCode, 'parentName') || null;
            this.alertService.addAlert({
              type: 'success',
              message: `${this.workplace.name} is now linked to ${parentName}.`,
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
