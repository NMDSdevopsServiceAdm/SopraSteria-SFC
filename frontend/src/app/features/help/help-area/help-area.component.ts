import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';

@Component({
  selector: 'app-help-area',
  templateUrl: './help-area.component.html',
  styleUrls: ['./help-area.component.scss'],
})
export class HelpAreaComponent implements OnInit {
  public workplaceName: string;
  public tabs = [
    { route: 'get-started', linkText: 'Get started', active: true },
    { route: 'questions-and-answers', linkText: 'Questions and answers', active: false },
    { route: 'whats-new', linkText: "What's new", active: false },
    { route: 'helpful-downloads', linkText: 'Helpful downloads', active: false },
    { route: 'contact-us', linkText: 'Contact us', active: false },
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private establishmentService: EstablishmentService,
    private breadcrumbService: BreadcrumbService,
  ) {}

  ngOnInit(): void {
    this.workplaceName = this.establishmentService.establishment?.name;
    this.breadcrumbService.show(JourneyType.HELP);
  }

  public onTabClick(event: Event, tabIndex: number): void {
    event.preventDefault();

    this.tabs.forEach((tab) => (tab.active = false));
    this.tabs[tabIndex].active = true;

    this.router.navigate([this.tabs[tabIndex].route], { relativeTo: this.route });
  }
}
