import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { TabsService } from '@core/services/tabs.service';

@Component({
  selector: 'app-summary-section',
  templateUrl: './summary-section.component.html',
  styleUrls: ['./summary-section.component.scss'],
})
export class SummarySectionComponent implements OnInit {
  @Input() workplace: Establishment;
  @Input() navigateToTab: (event: Event, selectedTab: string) => void;

  @Input() workers: Worker[];

  public sections = [
    { linkText: 'Workplace', fragment: 'workplace', message: '' },
    { linkText: 'Staff records', fragment: 'staff-records', message: '' },
    { linkText: 'Training and qualifications', fragment: 'training-and-qualifications', message: '' },
  ];

  constructor(private tabsService: TabsService, private establishmentService: EstablishmentService) {}

  ngOnInit(): void {
    this.getWorkplaceSummaryMessage();
    this.getStaffSummaryMessage();
  }

  public getWorkplaceSummaryMessage(): void {
    if (this.workplace.showAddWorkplaceDetailsBanner) {
      this.sections[0].message = 'Add more details to your workplace';
    } else if (this.establishmentService.checkCQCDetailsBanner) {
      this.sections[0].message = 'You need to check your CQC details';
    }
  }

  public getStaffSummaryMessage(): void {
    const dateCheck = new Date(this.workplace.eightWeeksFromFirstLogin);

    if (this.workers?.length <= 0) {
      this.sections[1].message = 'You can start to add your staff records now';
    } else if (
      this.workers?.length !== this.workplace.numberOfStaff &&
      this.workers?.length > 0 &&
      dateCheck < new Date()
    ) {
      this.sections[1].message = 'Staff records added does not match staff total';
    }
  }
}
