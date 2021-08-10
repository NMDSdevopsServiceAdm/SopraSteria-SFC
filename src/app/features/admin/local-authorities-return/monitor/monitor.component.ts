import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Area, LAs } from '@core/model/admin/local-authorities-return.model';
import {
  LocalAuthoritiesReturnService,
} from '@core/services/admin/local-authorities-return/local-authorities-return.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { DialogService } from '@core/services/dialog.service';

import { ResetDialogComponent } from './reset-dialog/reset-dialog.component';

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
  localAuthorities: LAs;

  constructor(
    private breadcrumbService: BreadcrumbService,
    private route: ActivatedRoute,
    private localAuthoritiesReturnService: LocalAuthoritiesReturnService,
    public dialogService: DialogService,
  ) {}

  ngOnInit(): void {
    this.breadcrumbService.show(JourneyType.ADMIN);
    this.localAuthorities = this.route.snapshot.data.localAuthorities;
  }

  public conditionalClass(status: string): string {
    let conditionalStyle;

    switch (status) {
      case 'Update, complete':
        conditionalStyle = 'govuk-tag--blue';
        break;
      case 'Update, not complete':
        conditionalStyle = 'govuk-tag--yellow';
        break;
      case 'Confirmed, complete':
        conditionalStyle = 'govuk-tag--green';
        break;
      case 'Confirmed, not complete':
        conditionalStyle = 'govuk-tag--red';
        break;
      default:
        conditionalStyle = 'govuk-tag--grey';
    }
    return conditionalStyle;
  }

  toggleAll(event: Event): void {
    event.preventDefault();
    this.allOpen = !this.allOpen;
    this.areas.forEach((area: Area) => (area.open = this.allOpen));
  }

  resetLAs(): void {
    this.dialogService.open(ResetDialogComponent, {}).afterClosed.subscribe((approveConfirmed) => {
      if (approveConfirmed) {
        this.localAuthoritiesReturnService.resetLAs().subscribe((resetLAs) => {
          this.localAuthorities = resetLAs;
        });
      }
    });
  }
}
