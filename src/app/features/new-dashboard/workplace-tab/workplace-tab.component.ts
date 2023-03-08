import { Component, Input, OnInit } from '@angular/core';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Establishment } from '@core/model/establishment.model';
import { URLStructure } from '@core/model/url.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';

@Component({
  selector: 'app-new-workplace-tab',
  templateUrl: './workplace-tab.component.html',
})
export class NewWorkplaceTabComponent implements OnInit {
  @Input() workplace: Establishment;
  @Input() workerCount: number;

  public summaryReturnUrl: URLStructure = { url: ['/dashboard'], fragment: 'workplace' };

  constructor(private breadcrumbService: BreadcrumbService, private establishmentService: EstablishmentService) {}

  ngOnInit(): void {
    this.establishmentService.setInStaffRecruitmentFlow(false);
    this.breadcrumbService.show(JourneyType.WORKPLACE_TAB);
  }
}
