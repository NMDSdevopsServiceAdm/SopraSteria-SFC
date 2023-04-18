import { Component, Input, OnInit } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
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

  constructor(private tabsService: TabsService) {}

  ngOnInit(): void {
    this.getWorkplaceSummaryMessage();
    this.getStaffSummaryMessage();
  }

  public getWorkplaceSummaryMessage(): void {
    if (this.workplace.showAddWorkplaceDetailsBanner) {
      this.sections[0].message = 'Add more details to your workplace';
    }
  }

  public getStaffSummaryMessage(): void {
    if (this.workplace.showAddWorkplaceDetailsBanner) {
      this.sections[1].message = 'You can start to add your staff records now';
    }
  }
}
