import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { WorkplaceService } from '@core/services/workplace.service';
import { NewRegulatedByCqcDirective } from '@shared/directives/create-workplace/new-regulated-by-cqc/new-regulated-by-cqc.directive';

@Component({
  selector: 'app-regulated-by-cqc',
  templateUrl: './regulated-by-cqc.component.html',
})
export class RegulatedByCqcComponent extends NewRegulatedByCqcDirective {
  constructor(
    protected formBuilder: FormBuilder,
    protected errorSummaryService: ErrorSummaryService,
    public workplaceService: WorkplaceService,
    public backService: BackService,
    protected route: ActivatedRoute,
    protected router: Router,
  ) {
    super(formBuilder, errorSummaryService, workplaceService, backService, route, router);
  }

  protected init(): void {
    this.insideFlow = this.route.snapshot.parent.url[0].path === 'registration';
    console.log(this.insideFlow);
    this.flow = this.insideFlow ? 'registration' : 'registration/confirm-details';
  }

  protected setFlowToInProgress(): void {
    this.workplaceService.addWorkplaceInProgress$.next(true);
  }
}
