import { AfterViewInit, Component, ElementRef, OnChanges, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { Establishment } from '@core/model/establishment.model';
import { AlertService } from '@core/services/alert.service';
import { AuthService } from '@core/services/auth.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { ParentSubsidiaryViewService } from '@shared/services/parent-subsidiary-view.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-delete-workplace',
  templateUrl: '/delete-workplace.component.html',
})
export class DeleteWorkplaceComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  @ViewChild('formEl') formEl: ElementRef;

  private subscriptions: Subscription = new Subscription();
  public subsidiaryWorkplace: Establishment;
  public parentWorkplace: Establishment;
  public parentUid: string;
  public canDeleteEstablishment: boolean;
  public form: UntypedFormGroup;
  public formErrorsMap: Array<ErrorDetails>;
  public serverErrorsMap: Array<ErrorDefinition>;
  public submitted = false;
  public serverError: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public parentSubsidiaryViewService: ParentSubsidiaryViewService,
    private breadcrumbService: BreadcrumbService,
    private errorSummaryService: ErrorSummaryService,
    private formBuilder: UntypedFormBuilder,
    private establishmentService: EstablishmentService, // private permissionsService: PermissionsService, // private authService: AuthService,
  ) {}

  ngAfterViewInit() {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  ngOnInit(): void {
    this.subsidiaryWorkplace = this.route.snapshot.data.establishment;
    this.parentUid = this.route.snapshot.data.establishment.parentUid;
    this.breadcrumbService.show(JourneyType.SUBSIDIARY);
    this.setupForm();
    this.setupFormErrorsMap();
  }

  ngOnChanges(): void {}

  private setupForm(): void {
    this.form = this.formBuilder.group({
      deleteWorkplace: ['', { validators: [Validators.required], updateOn: 'submit' }],
    });
  }

  public getFormErrorMessage(item: string, errorType: string): string {
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  private setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'deleteWorkplace',
        type: [
          {
            name: 'required',
            message: 'Select yes if you want to delete this workplace',
          },
        ],
      },
    ];
  }

  public onSubmit(event: Event): void {
    event.preventDefault();
    this.submitted = true;
    this.errorSummaryService.syncErrorsEvent.next(true);

    if (this.form.invalid) {
      this.errorSummaryService.scrollToErrorSummary();
      return;
    } else {
      this.deleteWorkplace();
    }
  }

  public async deleteWorkplace(): Promise<void> {
    const formValue = this.form.controls.deleteWorkplace.value;
    if (formValue === 'no') {
      this.router.navigate(['/home', this.subsidiaryWorkplace.uid]);
    } else if (formValue === 'yes') {
      this.parentSubsidiaryViewService.clearViewingSubAsParent();
      this.router.navigate(['/workplace', 'view-all-workplaces'], {
        state: { alertMessage: `You deleted ${this.subsidiaryWorkplace.name}` },
      });
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
