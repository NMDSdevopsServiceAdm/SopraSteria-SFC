import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { URLStructure } from '@core/model/url.model';
import { BackService } from '@core/services/back.service';
import { BackLinkService } from '@core/services/backLink.service';
//import { ErrorSummaryService } from '@core/services/error-summary.service';
import { WorkplaceService } from '@core/services/workplace.service';
import { ProgressBarUtil } from '@core/utils/progress-bar-util';

@Component({
  selector: 'app-parent-workplace-account',
  templateUrl: './parent-workplace-account.component.html',
})
export class ParentWorkplaceAccount implements OnInit {
  constructor(
    protected backService: BackService,
    protected backLinkService: BackLinkService,
    // protected errorSummaryService: ErrorSummaryService,
    // protected formBuilder: UntypedFormBuilder,
    protected router: Router,
    protected workplaceService: WorkplaceService,
  ) {}

  ngOnInit(): void {
    this.setBackLink();
  }
  protected setBackLink(): void {
    this.backLinkService.showBackLink();
  }
}
