import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkplaceService } from '@core/services/workplace.service';
import { SelectMainService } from '@shared/directives/create-workplace/select-main-service/select-main-service';

@Component({
  selector: 'app-select-main-service',
  templateUrl: '../../../shared/directives/create-workplace/select-main-service/select-main-service.component.html',
})
export class SelectMainServiceComponent extends SelectMainService {
  public workplace: Establishment;
  constructor(
    private route: ActivatedRoute,
    private establishmentService: EstablishmentService,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected workplaceService: WorkplaceService,
  ) {
    super(backService, errorSummaryService, formBuilder, router, workplaceService);
  }

  protected init() {
    this.workplace = this.establishmentService.establishment;
    this.selectedMainService = this.workplace.mainService;
    this.setBackLink();
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
        ...(selectedMainService.otherName && { other: selectedMainService.otherName }),
      },
    };
    this.subscriptions.add(
      this.establishmentService.updateMainService(this.workplace.uid, request).subscribe((data) => {
        this.establishmentService.setState({ ...this.workplace, ...data });
        if (this.establishmentService.mainServiceCQC && !this.workplace.isRegulated) {
          this.router.navigate(['/workplace', this.workplace.uid, 'main-service-cqc-confirm']);
        } else {
          this.router.navigate(this.establishmentService.returnTo.url, {
            fragment: this.establishmentService.returnTo.fragment,
          });
          this.establishmentService.setReturnTo(null);
        }
      }),
    );
  }

  protected setBackLink(): void {
    this.backService.setBackLink(this.establishmentService.returnTo);
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
