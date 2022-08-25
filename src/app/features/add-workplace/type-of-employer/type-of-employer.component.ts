import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { WorkplaceService } from '@core/services/workplace.service';
import { TypeOfEmployerDirective } from '@shared/directives/create-workplace/type-of-employer/type-of-employer.directive';

@Component({
  selector: 'app-type-of-employer',
  templateUrl: '../../../shared/directives/create-workplace/type-of-employer/type-of-employer.component.html',
})
export class TypeOfEmployerComponent extends TypeOfEmployerDirective {
  public question = 'What type of employer are they?';

  constructor(
    protected formBuilder: FormBuilder,
    public backService: BackService,
    protected router: Router,
    protected route: ActivatedRoute,
    protected errorSummaryService: ErrorSummaryService,
    public workplaceService: WorkplaceService,
  ) {
    super(formBuilder, backService, router, route, errorSummaryService, workplaceService);
  }

  protected init(): void {
    this.isRegulated = this.workplaceService.isRegulated();
    this.returnToConfirmDetails = this.workplaceService.returnTo$.value;
    this.insideFlow = this.route.snapshot.parent.url[0].path === 'add-workplace';
    this.flow = this.insideFlow ? 'add-workplace' : 'add-workplace/confirm-workplace-details';
  }
}
