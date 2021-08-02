import { Component, OnInit } from '@angular/core';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Area } from '@core/model/admin/local-authorities-return.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';

@Component({
  selector: 'app-monitor',
  templateUrl: './monitor.component.html',
})
export class MonitorComponent implements OnInit {
  public allOpen = false;
  public areas: Area[] = [
    {
      letter: 'B',
      name: 'North East',
      open: false,
    },
    {
      letter: 'C',
      name: 'East Midlands',
      open: false,
    },
    {
      letter: 'D',
      name: 'South West',
      open: false,
    },
    {
      letter: 'E',
      name: 'West Midlands',
      open: false,
    },
    {
      letter: 'F',
      name: 'North West',
      open: false,
    },
    {
      letter: 'G',
      name: 'London',
      open: false,
    },
    {
      letter: 'H',
      name: 'South East',
      open: false,
    },
    {
      letter: 'I',
      name: 'Eastern',
      open: false,
    },
    {
      letter: 'J',
      name: 'Yorkshire and Humber',
      open: false,
    },
  ];
  constructor(private breadcrumbService: BreadcrumbService) {}

  ngOnInit(): void {
    this.breadcrumbService.show(JourneyType.ADMIN);
  }

  toggleAll(event: Event): void {
    event.preventDefault();
    this.allOpen = !this.allOpen;
    this.areas.forEach((area: Area) => (area.open = this.allOpen));
  }
}
