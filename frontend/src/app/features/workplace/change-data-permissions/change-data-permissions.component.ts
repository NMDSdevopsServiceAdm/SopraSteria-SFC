import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDetails, ErrorDefinition } from '@core/model/errorSummary.model';
import { Establishment } from '@core/model/establishment.model';
import { DataPermissions, Workplace } from '@core/model/my-workplaces.model';
import { AlertService } from '@core/services/alert.service';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PreviousRouteService } from '@core/services/previous-route.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-change-data-permissions',
  templateUrl: './change-data-permissions.component.html',
  standalone: false,
})
export class ChangeDataPermissionsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('formEl') formEl: ElementRef;
  protected subscriptions: Subscription = new Subscription();
  public form: UntypedFormGroup;
  public formErrorsMap: Array<ErrorDetails>;
  public serverErrorsMap: Array<ErrorDefinition>;
  public submitted = false;
  public workplace?: Establishment;
  public uidToChangeDataPermissionsFor: string;
  public DataPermissions = DataPermissions;
  public serverError: string;
  public isParent: boolean;
  public previousRoute: string[];
  public workplaceNameToChangeDataPermissionsFor: string;
  public permissionType: string;
  public currentDataPermission: string;
  public currentDataOwner: string;
  public parentName: string;
  public parentUid: string;
  public posssesivePronounText: string;
  public childWorkplaces: Workplace[];

  constructor(
    private errorSummaryService: ErrorSummaryService,
    private establishmentService: EstablishmentService,
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    public route: ActivatedRoute,
    protected backService: BackService,
    private previousRouteService: PreviousRouteService,
    private alertService: AlertService,
  ) {}

  ngAfterViewInit() {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  ngOnInit() {
    this.uidToChangeDataPermissionsFor = this.route.snapshot?.queryParams?.changeDataPermissionsFor;
    this.childWorkplaces = this.route.snapshot.data?.childWorkplaces?.childWorkplaces;
    this.workplace = this.route.snapshot.data.establishment;

    this.isParent = this.workplace?.isParent;
    this.posssesivePronounText = this.isParent ? 'their' : 'your';
    this.setPreviousRoute();
    this.setupForm();
    this.getWorkplaceToChangeDataPermissionsFor();
    this.setupFormErrorsMap();
    this.setupServerErrorsMap();
    this.setBackLink();
  }

  private setupForm(): void {
    this.form = this.formBuilder.group({
      dataPermission: ['', { validators: [Validators.required], updateOn: 'submit' }],
    });
  }

  public prefill(currentDataPermission: string): void {
    if (currentDataPermission) {
      this.form.setValue({
        dataPermission: currentDataPermission,
      });
    }
  }

  public setPreviousRoute(): void {
    const previousUrl = this.previousRouteService.getPreviousUrl();

    if (previousUrl === '/workplace/view-all-workplaces') {
      this.previousRoute = ['/workplace', 'view-all-workplaces'];
    } else if (previousUrl === '/' || previousUrl === 'home') {
      this.previousRoute = ['/dashboard'];
    }
  }

  public setupVariables(workplace): void {
    this.currentDataPermission = workplace?.dataPermissions;
    this.currentDataOwner = workplace?.dataOwner;
    this.parentName = workplace?.parentName;
    this.parentUid = workplace?.parentUid;

    this.prefill(this.currentDataPermission);

    if (this.uidToChangeDataPermissionsFor) {
      this.workplaceNameToChangeDataPermissionsFor = workplace?.name;
    } else {
      this.workplaceNameToChangeDataPermissionsFor = workplace?.parentName;
      this.uidToChangeDataPermissionsFor = workplace?.uid;
    }
  }

  public onSubmit(): void {
    this.submitted = true;
    this.errorSummaryService.syncFormErrorsEvent.next(true);
    if (this.form.invalid) {
      this.errorSummaryService.scrollToErrorSummary();
      return;
    }
    this.setPermissions();
  }

  protected setBackLink(): void {
    this.backService.setBackLink({ url: this.previousRoute });
  }

  public getWorkplaceToChangeDataPermissionsFor(): void {
    if (this.uidToChangeDataPermissionsFor && this.childWorkplaces.length > 0) {
      const childWorkplace = this.childWorkplaces.find(
        (workplace) => workplace?.uid === this.uidToChangeDataPermissionsFor,
      );

      this.setupVariables(childWorkplace);
    } else {
      this.setupVariables(this.workplace);
    }
  }

  public sendAlert(): void {
    this.alertService.addAlert({
      type: 'success',
      message: `You've changed data permissions for ${this.workplaceNameToChangeDataPermissionsFor}`,
    });
  }

  public navigateToUrl(): void {
    this.router.navigate(this.previousRoute).then(() => {
      this.sendAlert();
    });
  }

  public setPermissions() {
    this.permissionType = this.form.value.dataPermission;

    const setPermission = {
      permissionToSet: this.permissionType,
    };
    this.subscriptions.add(
      this.establishmentService.setDataPermission(this.uidToChangeDataPermissionsFor, setPermission).subscribe(
        (data) => {
          if (data) {
            this.navigateToUrl();
          }
        },
        (error) => {
          this.serverError = this.errorSummaryService.getServerErrorMessage(error.status, this.serverErrorsMap);
        },
      ),
    );
  }

  public getFormErrorMessage(item: string, errorType: string): string {
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
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

  private setupServerErrorsMap(): void {
    this.serverErrorsMap = [
      {
        name: 500,
        message: 'We could not change data permission. You can try again or contact us.',
      },
      {
        name: 400,
        message: 'Unable to change data permission.',
      },
      {
        name: 404,
        message: 'Change data permission service not found. You can try again or contact us.',
      },
    ];
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
