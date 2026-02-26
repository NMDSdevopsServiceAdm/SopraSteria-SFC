import { Component } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { BackService } from '@core/services/back.service';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkplaceService } from '@core/services/workplace.service';
import { SelectMainServiceDirective } from '@shared/directives/create-workplace/select-main-service/select-main-service.directive';

@Component({
  selector: 'app-select-main-service',
  templateUrl: '../../../shared/directives/create-workplace/select-main-service/select-main-service.component.html',
  standalone: false,
})
export class SelectMainServiceComponent extends SelectMainServiceDirective {
  public workplace: Establishment;
  constructor(
    private establishmentService: EstablishmentService,
    protected backService: BackService,
    protected backLinkService: BackLinkService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: UntypedFormBuilder,
    protected router: Router,
    protected workplaceService: WorkplaceService,
    protected route: ActivatedRoute,
  ) {
    super(backService, backLinkService, errorSummaryService, formBuilder, router, workplaceService);
  }

  protected init() {
    this.workplace = this.establishmentService.establishment;
    this.selectedMainService = this.workplace.mainService;
    this.isWorkPlaceUpdate = true;
    this.flow = 'dashboard';
  }

  protected getServiceCategories() {
    this.subscriptions.add(this.getServicesByCategory(this.establishmentService.mainServiceCQC));
  }

  protected onSuccess() {
    const selectedMainService = this.getSelectedWorkPlaceService();
    const request = {
      cqc: this.establishmentService.mainServiceCQC,
      mainService: {
        id: selectedMainService.id,
        name: selectedMainService.name,
        reportingID: selectedMainService.reportingID,
        ...(selectedMainService.otherName && { other: selectedMainService.otherName }),
      },
    };

    this.subscriptions.add(
      this.establishmentService.updateMainService(this.workplace.uid, request).subscribe((data) => {
        this.establishmentService.setState({ ...this.workplace, ...data });
        if (this.establishmentService.mainServiceCQC && !this.workplace.isRegulated) {
          this.navigateToCQCChangeConfirmationPage();
        } else {
          this.returnToPreviousPage();
        }
      }),
    );
  }

  private navigateToCQCChangeConfirmationPage(): void {
    this.router.navigate(['..', 'main-service-cqc-confirm'], { relativeTo: this.route });
  }

  private returnToPreviousPage(): void {
    const returnTo = this.establishmentService.returnTo ?? { url: ['/dashboard'], fragment: 'workplace' };
    this.router.navigate(returnTo.url, {
      fragment: returnTo.fragment,
    });
    this.establishmentService.setReturnTo(null);
  }

  public setSubmitAction(payload: { action: string; save: boolean }): void {
    if (!payload.save) {
      this.navigate();
    }
  }

  protected navigate(): void {
    this.router.navigate(this.return.url, { fragment: this.return.fragment, queryParams: this.return.queryParams });
  }

  get return() {
    return this.establishmentService.returnTo;
  }

  get displayIntro() {
    return false;
  }

  get callToActionLabel() {
    return 'Save this change';
  }
}
