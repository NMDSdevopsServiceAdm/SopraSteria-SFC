import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, UntypedFormBuilder, UntypedFormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DialogComponent } from '@core/components/dialog.component';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { Establishment } from '@core/model/establishment.model';
import { GetWorkplacesResponse, Workplace } from '@core/model/my-workplaces.model';
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
  public availableWorkPlaces: Array<Workplace>;
  public workplaceNameOrPostCode: string;
  public autoCompleteDataProvider: () => Array<string>;

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
    this.autoCompleteDataProvider = () => this.workplaceNameOrPostCodeFilter();
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
        (allEstablishments: GetWorkplacesResponse) => {
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

  private getValidEstablishments(establishments: GetWorkplacesResponse, currentWorkplaceUid: string) {
    const establishmentArray = this.constructEstablishmentsArray(establishments);

    const validEstablishments = establishmentArray
      .filter((wp) => wp.uid !== currentWorkplaceUid)
      .filter((wp) => (wp.dataOwner === 'Parent' && wp.ustatus !== 'PENDING') || wp.isParent === true)
      .map((wp) => this.addNameAndPostcodeAttribute(wp));

    return validEstablishments;
  }

  private constructEstablishmentsArray(response: GetWorkplacesResponse) {
    if (response?.subsidaries?.establishments?.length > 0) {
      return [response.primary, ...response.subsidaries.establishments];
    }

    return [response.primary];
  }

  private addNameAndPostcodeAttribute(establishment: Workplace): Workplace {
    establishment.nameAndPostCode = establishment.name + ', ' + establishment.postCode;

    return establishment;
  }

  public getFirstErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  public close(event: Event) {
    event?.preventDefault();
    this.dialog.close();
  }

  public onSubmit() {
    this.submitted = true;
    this.errorSummaryService.syncFormErrorsEvent.next(true);

    if (!this.form.valid) {
      this.errorSummaryService.scrollToErrorSummary();
      return;
    }
    const newEstablishmentId = this.getWorkplaceEstablishment(this.form.value.workplaceNameOrPostCode)?.id;
    this.subscriptions.add(
      this.workerService
        .updateWorker(this.data.workplace.uid, this.data.worker.uid, { establishmentId: newEstablishmentId })
        .subscribe(
          () => this.onSuccess(),
          (error) => this.onError(error),
        ),
    );
  }

  private onSuccess(): void {
    const nameAndPostCode = this.form.value.workplaceNameOrPostCode;
    const newEstablishmentName = this.getWorkplaceEstablishment(nameAndPostCode)?.name;

    this.dialog.close();
    this.navigateToStaffRecords().then(() => {
      this.alertService.addAlert({
        type: 'success',
        message: `${this.data.worker.nameOrId} has been moved to ${newEstablishmentName}.`,
      });
    });
  }

  private onError(error): void {
    console.log(error);
  }

  private setupForm(): void {
    this.form = this.formBuilder.group({
      workplaceNameOrPostCode: [null, [Validators.required, this.workplaceNameOrPostCodeValidator()]],
    });
  }

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

  public workplaceNameOrPostCodeValidator(): ValidatorFn {
    const validator = (control: FormControl) => {
      if (!control.value || !this.availableWorkPlaces) {
        return null;
      }

      const workplaceNameOrPostCodeLowerCase = control.value.toLowerCase();
      const inputMatchesRecord: boolean = this.availableWorkPlaces.some(
        (wp) => wp.nameAndPostCode.toLowerCase() === workplaceNameOrPostCodeLowerCase,
      );
      return inputMatchesRecord ? null : { validNameOrPostCode: true };
    };

    return validator;
  }

  public navigateToStaffRecords(): Promise<boolean> {
    const currentWorkplaceIsSubsidairy = !!this.data.workplace.parentUid;

    if (currentWorkplaceIsSubsidairy) {
      return this.router.navigate(['/subsidiary', this.data.workplace.uid, 'staff-records']);
    } else {
      return this.router.navigate(['/dashboard'], { fragment: 'staff-records' });
    }
  }

  public workplaceNameOrPostCodeFilter(): string[] {
    const workplaceNameOrPostCode = this.form.value.workplaceNameOrPostCode;
    if (!this.availableWorkPlaces || !workplaceNameOrPostCode?.length) {
      return [];
    }

    const workplaceNameOrPostCodeLowerCase = workplaceNameOrPostCode.toLowerCase();

    const nameOrPostcodeMatchInput = (wp: Workplace) => {
      return (
        wp.name.toLowerCase().startsWith(workplaceNameOrPostCodeLowerCase) ||
        wp.postCode.toLowerCase().startsWith(workplaceNameOrPostCodeLowerCase) ||
        wp.nameAndPostCode.toLowerCase().startsWith(workplaceNameOrPostCodeLowerCase)
      );
    };

    return this.availableWorkPlaces
      .filter(nameOrPostcodeMatchInput)
      .filter((wp) => wp.nameAndPostCode.toLowerCase() !== workplaceNameOrPostCodeLowerCase)
      .map((wp) => wp.nameAndPostCode);
  }

  public getWorkplaceEstablishment(nameAndPostCode: string): Workplace {
    if (nameAndPostCode) {
      const workplace = this.availableWorkPlaces.find(
        (wp) => wp.nameAndPostCode.toLowerCase() === nameAndPostCode.toLowerCase(),
      );
      return workplace;
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
