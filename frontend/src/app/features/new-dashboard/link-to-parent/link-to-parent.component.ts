import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { Establishment } from '@core/model/establishment.model';
import { DataPermissions } from '@core/model/my-workplaces.model';
import { AlertService } from '@core/services/alert.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-link-to-parent',
    templateUrl: './link-to-parent.component.html',
    styleUrls: ['./link-to-parent.component.scss'],
    standalone: false
})
export class LinkToParentComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('formEl') formEl: ElementRef;

  public dataPermissions: DataPermissions[];
  public form: UntypedFormGroup;
  public submitted = false;
  public workplace: Establishment;
  protected subscriptions: Subscription = new Subscription();
  public permissionType: string;
  public parentWorkplaceId: string;
  public serverError: string;
  public serverErrorsMap: Array<ErrorDefinition>;
  public availableParentWorkPlaces;
  public parentNameOrPostCode: string;
  public formErrorsMap: Array<ErrorDetails>;
  public linkToParentRequested: boolean;
  public requestedParentNameAndPostcode: string;
  public parentPostcode: string;

  constructor(
    private establishmentService: EstablishmentService,
    private formBuilder: UntypedFormBuilder,
    private errorSummaryService: ErrorSummaryService,
    private alertService: AlertService,
    private router: Router,
    private breadcrumbService: BreadcrumbService,
  ) {
    this.parentNameOrPostCodeValidator = this.parentNameOrPostCodeValidator.bind(this);
    this.parentNameOrPostCodeFilter = this.parentNameOrPostCodeFilter.bind(this);
    this.setupForm();
  }

  ngAfterViewInit(): void {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  ngOnInit() {
    this.workplace = this.establishmentService.primaryWorkplace;
    this.breadcrumbService.show(JourneyType.LINK_TO_PARENT);
    this.getAvailableParentWorkPlaces();
    this.setDataPermissions();
    this.setupFormErrorsMap();
    this.setupServerErrorsMap();
    this.linkToParentRequested = history.state?.linkToParentRequested
      ? true
      : this.workplace.linkToParentRequested
      ? true
      : false;
    this.getRequestedParent();
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

  //set the data permission array
  private setDataPermissions(): void {
    this.dataPermissions = [DataPermissions.Workplace, DataPermissions.WorkplaceAndStaff, DataPermissions.None];
  }

  //Set the form fields and validator
  private setupForm(): void {
    this.form = this.formBuilder.group({
      parentNameOrPostCode: [null, { validators: [Validators.required, this.parentNameOrPostCodeValidator] }],
      dataPermission: [null, [Validators.required]],
    });
  }

  //setup  form error message
  public setupFormErrorsMap(): void {
    const nameOrPostCodeErrorMessage = "Enter and then select the parent workplace's name or postcode";
    this.formErrorsMap = [
      {
        item: 'parentNameOrPostCode',
        type: [
          {
            name: 'required',
            message: nameOrPostCodeErrorMessage,
          },
          {
            name: 'validNameOrPostCode',
            message: nameOrPostCodeErrorMessage,
          },
        ],
      },
      {
        item: 'dataPermission',
        type: [
          {
            name: 'required',
            message: 'Select what data you want them to have view only access to',
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
        message: 'We could not send request to parent. You can try again or contact us',
      },
      {
        name: 400,
        message: 'Unable to send request to parent',
      },
      {
        name: 404,
        message: 'Send request to parent service not found. You can try again or contact us',
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

  //sync the form error event and if form is invalid then scroll to error summary
  public onSubmit(): void {
    this.submitted = true;
    this.errorSummaryService.syncFormErrorsEvent.next(true);
    if (this.form.invalid) {
      this.errorSummaryService.scrollToErrorSummary();
      return;
    }
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
              this.router
                .navigate(['/dashboard'], {
                  state: {
                    linkToParentRequestedStatus: true,
                  },
                })
                .then(() => {
                  this.alertService.addAlert({
                    type: 'success',
                    message: `You've sent a link request to ${this.form.value.parentNameOrPostCode}`,
                  });
                });
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
        return this.availableParentWorkPlaces.find(
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

  public cancelRequestToParent(event) {
    event.preventDefault();
    this.subscriptions.add(
      this.establishmentService
        .cancelRequestToParentForLink(this.workplace.uid, { approvalStatus: 'CANCELLED' })
        .subscribe(
          (data) => {
            if (data) {
              const parentName = data[0].requstedParentName;
              this.router
                .navigate(['/dashboard'], {
                  state: {
                    cancelRequestToParentForLinkSuccess: true,
                  },
                })
                .then(() => {
                  this.alertService.addAlert({
                    type: 'success',
                    message: `You've cancelled your request to link to ${parentName}, ${this.parentPostcode}`,
                  });
                });
            }
          },
          (error) => {
            this.serverError = this.errorSummaryService.getServerErrorMessage(error.status, this.serverErrorsMap);
          },
        ),
    );
  }

  public returnToHome(): void {
    this.router.navigate(['/dashboard']);
  }

  public getRequestedParent(): void {
    if (this.linkToParentRequested) {
      this.subscriptions.add(
        this.establishmentService
          .getRequestedLinkToParent(this.workplace.uid, { establishmentId: this.workplace.id })
          .subscribe(
            (requestedParent: any) => {
              this.parentPostcode = requestedParent.parentEstablishment?.postcode;
              this.requestedParentNameAndPostcode = `${requestedParent.parentEstablishment?.name}, ${requestedParent.parentEstablishment?.postcode}`;
            },
            (error) => {
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
