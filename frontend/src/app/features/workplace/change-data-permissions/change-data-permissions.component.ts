import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDetails, ErrorDefinition } from '@core/model/errorSummary.model';
import { Establishment } from '@core/model/establishment.model';
import { DataPermissions } from '@core/model/my-workplaces.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PreviousRouteService } from '@core/services/previous-route.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-change-data-permissions',
  templateUrl: './change-data-permissions.component.html',
})
export class ChangeDataPermissionsComponent implements OnInit, AfterViewInit {
  @ViewChild('formEl') formEl: ElementRef;
  protected subscriptions: Subscription = new Subscription();
  public form: UntypedFormGroup;
  public formErrorsMap: Array<ErrorDetails>;
  public serverErrorsMap: Array<ErrorDefinition>;
  public submitted = false;
  public primaryWorkplace: Establishment;
  public subsidiaryUid: string;
  public dataPermissions: DataPermissions[];
  public serverError: string;
  public isParent: boolean;
  public previousRoute: string[];
  public subsidiaryWorkplace: Establishment;

  constructor(
    private errorSummaryService: ErrorSummaryService,
    private establishmentService: EstablishmentService,
    private formBuilder: UntypedFormBuilder,
    // private router: Router,
    public route: ActivatedRoute,
    protected backService: BackService,
    // private previousRouteService: PreviousRouteService,
  ) {}

  ngAfterViewInit() {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  ngOnInit() {
    this.subsidiaryUid = this.route.snapshot.queryParams?.changeDataPermissionsFor;
    this.primaryWorkplace = this.route.snapshot.data.establishment;
    this.isParent = this.primaryWorkplace?.isParent;
    this.previousRoute = ['/workplace', 'view-all-workplaces'];
    this.getSubsidiaryWorkplace();
    this.setupForm();
    this.setupFormErrorsMap();
    this.setupServerErrorsMap();
    this.setDataPermissions();
    this.setBackLink();
  }

  private setupForm(): void {
    this.form = this.formBuilder.group({
      dataPermission: [null, { validators: [Validators.required], updateOn: 'submit' }],
    });
  }

  private setDataPermissions(): void {
    this.dataPermissions = [DataPermissions.Workplace, DataPermissions.WorkplaceAndStaff, DataPermissions.None];
  }

  public onSubmit(): void {
    this.submitted = true;
    this.errorSummaryService.syncFormErrorsEvent.next(true);
    if (this.form.invalid) {
      this.errorSummaryService.scrollToErrorSummary();
      return;
    }
  }

  protected setBackLink(): void {
    this.backService.setBackLink({ url: this.previousRoute });
  }

  public getSubsidiaryWorkplace(): void {
    if (this.subsidiaryUid) {
      this.subscriptions.add(
        this.establishmentService.getEstablishment(this.subsidiaryUid).subscribe((workplace) => {
          if (workplace) {
            this.subsidiaryWorkplace = workplace;
          }
        }),
      );
    }
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

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
