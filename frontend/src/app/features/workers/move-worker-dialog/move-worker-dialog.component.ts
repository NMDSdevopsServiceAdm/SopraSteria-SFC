import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DialogComponent } from '@core/components/dialog.component';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { Establishment } from '@core/model/establishment.model';
import { Worker } from '@core/model/worker.model';
import { AlertService } from '@core/services/alert.service';
import { Dialog, DIALOG_DATA } from '@core/services/dialog.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { UserService } from '@core/services/user.service';
import { WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-move-worker-dialog',
  templateUrl: './move-worker-dialog.component.html',
})
export class MoveWorkerDialogComponent extends DialogComponent implements OnInit, OnDestroy {
  public form: UntypedFormGroup;
  public submitted = false;
  private formErrorsMap: Array<ErrorDetails>;
  private subscriptions: Subscription = new Subscription();
  public parentWorkplaceId: string;
  public serverError: string;
  public serverErrorsMap: Array<ErrorDefinition>;
  public availableWorkPlaces;
  public workplaceNameOrPostCode: string;

  constructor(
    @Inject(DIALOG_DATA) public data: { worker: Worker; workplace: Establishment; primaryWorkplaceUid: string },
    public dialog: Dialog<MoveWorkerDialogComponent>,
    private router: Router,
    private formBuilder: UntypedFormBuilder,
    private alertService: AlertService,
    private errorSummaryService: ErrorSummaryService,
    private workerService: WorkerService,
    private userService: UserService,
  ) {
    super(data, dialog);
    this.workplaceNameOrPostCodeValidator = this.workplaceNameOrPostCodeValidator.bind(this);
    this.workplaceNameOrPostCodeFilter = this.workplaceNameOrPostCodeFilter.bind(this);
    this.setupForm();
  }

  ngOnInit() {
    this.getAllValidWorkplaces();
    this.setupFormErrorsMap();
    this.setupServerErrorsMap();
  }

  private getAllValidWorkplaces() {
    this.subscriptions.add(
      this.userService.getEstablishments().subscribe(
        (allEstablishments) => {
          this.availableWorkPlaces = this.getValidEstablishments(allEstablishments, this.data.workplace.uid);
        },
        (error) => {
          if (error.error.message) {
            this.serverError = error.error.message;
          }
        },
      ),
    );
  }

  private getValidEstablishments(establishments, currentWorkplaceUid) {
    const establishmentArray = this.constructEstablishmentsArray(establishments);

    const validEstablishments = establishmentArray
      .filter((wp) => wp.uid !== currentWorkplaceUid)
      .filter((wp) => (wp.dataOwner === 'Parent' && wp.ustatus !== 'PENDING') || wp.isParent === true)
      .map((wp) => this.addNameAndPostcodeAttribute(wp));

    return validEstablishments;
  }

  private constructEstablishmentsArray({ primary, subsidaries }) {
    const establishmentArray = [];

    establishmentArray.push(primary);
    subsidaries.establishments?.forEach((establishment) => establishmentArray.push(establishment));

    return establishmentArray;
  }

  private addNameAndPostcodeAttribute(establishment) {
    establishment.nameAndPostCode = establishment.name + ', ' + establishment.postCode;

    return establishment;
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

  public close(event: Event) {
    event.preventDefault();
    this.dialog.close();
  }

  //function is use to move worker in selected  workplace
  public onSubmit() {
    this.submitted = true;
    this.errorSummaryService.syncFormErrorsEvent.next(true);

    if (!this.form.valid) {
      this.errorSummaryService.scrollToErrorSummary();
      return;
    }
    const newEstablishmentId = this.getWorkplaceEstablishmentIdOrName(this.form.value.workplaceNameOrPostCode, 'id');
    this.subscriptions.add(
      this.workerService
        .updateWorker(this.data.workplace.uid, this.data.worker.uid, { establishmentId: newEstablishmentId })
        .subscribe(
          () => this.onSuccess(this.form.value.workplaceNameOrPostCode),
          (error) => this.onError(error),
        ),
    );
  }
  /**
   * Function is used to move worker in selected workplace.
   * @param {string} nameOrPostCode of selected workplace
   * @return {void}
   **/

  private onSuccess(nameAndPostCode: string): void {
    const newEstablishmentName = this.getWorkplaceEstablishmentIdOrName(nameAndPostCode, 'name');
    const url = this.data.workplace.parentUid !== null ? ['/workplace', this.data.workplace.uid] : ['/dashboard'];
    this.router.navigate(url, { fragment: 'staff-records' });
    this.alertService.addAlert({
      type: 'success',
      message: `${this.data.worker.nameOrId} has been moved to ${newEstablishmentName}.`,
    });
    this.close(event);
  }

  private onError(error): void {
    console.log(error);
  }

  //Set the form fields and validator
  private setupForm(): void {
    this.form = this.formBuilder.group({
      workplaceNameOrPostCode: [null, [Validators.required, this.workplaceNameOrPostCodeValidator]],
    });
  }

  //setup  form error message
  public setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'workplaceNameOrPostCode',
        type: [
          {
            name: 'required',
            message: 'Enter workplace name or post code.',
          },
          {
            name: 'validNameOrPostCode',
            message: 'Enter correct workplace name or post code.',
          },
        ],
      },
    ];
  }

  //setup server error message
  private setupServerErrorsMap(): void {
    this.serverErrorsMap = [
      {
        name: 500,
        message: 'We could not send request to move worker. You can try again or contact us.',
      },
      {
        name: 400,
        message: 'Unable to send request to move worker.',
      },
      {
        name: 404,
        message: 'Send request to move werker service not found. You can try again or contact us.',
      },
    ];
  }

  /**
   * Function is used to validate input workplace name or Post code is  valid or not.
   * if valid then return null otherwise return object {validNameOrPostCode:true}
   * @param {void}
   * @return {void}
   */
  public workplaceNameOrPostCodeValidator() {
    if (this.form && this.availableWorkPlaces) {
      const { workplaceNameOrPostCode } = this.form.controls;
      if (workplaceNameOrPostCode.value !== null) {
        const workplaceNameOrPostCodeLowerCase = workplaceNameOrPostCode.value.toLowerCase();
        return this.availableWorkPlaces.some(
          (wp) => wp.nameAndPostCode.toLowerCase() === workplaceNameOrPostCodeLowerCase,
        )
          ? null
          : { validNameOrPostCode: true };
      }
    }

    return null;
  }
  /**
   * Function is used to filter workplace name and Post code array based on input keys.
   * if matched found the return combition of name and Post code's array of string
   * @param {void}
   * @return {array}  array of string
   */
  public workplaceNameOrPostCodeFilter(): string[] {
    const workplaceNameOrPostCode = this.form.value.workplaceNameOrPostCode;
    if (this.availableWorkPlaces && workplaceNameOrPostCode && workplaceNameOrPostCode.length) {
      const workplaceNameOrPostCodeLowerCase = workplaceNameOrPostCode.toLowerCase();
      return this.availableWorkPlaces
        .filter((wp) => {
          return (
            wp.name.toLowerCase().startsWith(workplaceNameOrPostCodeLowerCase) ||
            wp.postCode.toLowerCase().startsWith(workplaceNameOrPostCodeLowerCase) ||
            wp.nameAndPostCode.toLowerCase().startsWith(workplaceNameOrPostCodeLowerCase)
          );
        })
        .filter((wp) => wp.nameAndPostCode.toLowerCase() !== workplaceNameOrPostCodeLowerCase)
        .map((wp) => wp.nameAndPostCode);
    }

    return [];
  }

  /**
   * Function is used to get selected parent's uid.
   * @param {string} nameAndPostCode of selected parent
   * @param {string} nameOrId of selected parent
   * @return {array}  array of string
   */
  public getWorkplaceEstablishmentIdOrName(nameAndPostCode: string, nameOrId: string) {
    if (nameAndPostCode) {
      const filterArray = this.availableWorkPlaces.filter(
        (wp) => wp.nameAndPostCode.toLowerCase() === nameAndPostCode.toLowerCase(),
      );
      if (nameOrId === 'id') {
        return filterArray[0].id;
      }
      return filterArray[0].name;
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
