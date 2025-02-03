import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Wizard } from '@core/model/wizard.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-get-started',
  templateUrl: './get-started.component.html',
  styleUrls: ['./get-started.component.scss'],
})
export class GetStartedComponent {
  public wizards: Wizard[];
  public isFirst: boolean;
  public isLast: boolean;
  public currentIndex: number;
  public imageUrl: string;
  public rawVideoUrl: string;

  constructor(private route: ActivatedRoute, private breadcrumbService: BreadcrumbService) {}

  ngOnInit(): void {
    this.wizards = this.route.snapshot.data.wizard.data;

    this.currentIndex = 1;
    this.imageUrl = `${environment.cmsUri}/assets/`;

    this.rawVideoUrl = this.route.snapshot.data.wizard.data[0].video;
    this.updatePreviousAndNextLinks();
    this.breadcrumbService.show(JourneyType.HELP);
  }

  public updatePreviousAndNextLinks(): void {
    this.isFirst = this.currentIndex === 1;
    this.isLast = this.currentIndex === this.wizards.length - 1;
  }

  public nextOrPreviousWizard(event: Event, isNext: boolean): void {
    event.preventDefault();
    const nextIndex = isNext ? 1 : -1;
    this.currentIndex += nextIndex;
    this.updatePreviousAndNextLinks();
  }
}
