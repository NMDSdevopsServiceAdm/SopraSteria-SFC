import { Component, OnInit } from '@angular/core';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Area } from '@core/model/admin/local-authorities-return.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';

@Component({
  selector: 'app-monitor',
  templateUrl: './monitor.component.html',
})
export class MonitorComponent implements OnInit {
  public areas: Area[] = [
    {
      letter: 'B',
      name: 'North East',
    },
    {
      letter: 'C',
      name: 'East Midlands',
    },
    {
      letter: 'D',
      name: 'South West',
    },
    {
      letter: 'E',
      name: 'West Midlands',
    },
    {
      letter: 'F',
      name: 'North West',
    },
    {
      letter: 'G',
      name: 'London',
    },
    {
      letter: 'H',
      name: 'South East',
    },
    {
      letter: 'I',
      name: 'Eastern',
    },
    {
      letter: 'J',
      name: 'Yorkshire and Humber',
    },
  ];
  constructor(private breadcrumbService: BreadcrumbService) {}

  ngOnInit(): void {
    this.breadcrumbService.show(JourneyType.ADMIN);
  }

  toggleAll(event: Event): void {
    event.preventDefault();
  }
}
