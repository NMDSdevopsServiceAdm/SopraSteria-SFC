import { Component } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { WorkplaceService } from '@core/services/workplace.service';
import { TypeOfEmployerDirective } from '@shared/directives/create-workplace/type-of-employer/type-of-employer.directive';

@Component({
  selector: 'app-type-of-employer',
  templateUrl: '../../../shared/directives/create-workplace/type-of-employer/type-of-employer.component.html',
  standalone: false,
})
export class TypeOfEmployerComponent extends TypeOfEmployerDirective {
  public question = 'What type of employer are they?';

  constructor(
    protected formBuilder: UntypedFormBuilder,
    protected backLinkService: BackLinkService,
    protected router: Router,
    protected route: ActivatedRoute,
    protected errorSummaryService: ErrorSummaryService,
    public workplaceService: WorkplaceService,
  ) {
    super(formBuilder, backLinkService, router, route, errorSummaryService, workplaceService);
  }

  protected init(): void {
    this.isRegulated = this.workplaceService.isRegulated();
    this.returnToConfirmDetails = this.workplaceService.returnTo$.value;
    this.insideFlow = this.route.snapshot.parent.url[0].path === 'add-workplace';
    this.flow = this.insideFlow ? 'add-workplace' : 'add-workplace/confirm-workplace-details';
  }
}
