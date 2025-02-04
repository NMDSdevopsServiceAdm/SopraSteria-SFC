import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Wizard } from '@core/model/wizard.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-helpful-downloads',
  templateUrl: './helpful-downloads.component.html',
  styleUrls: ['./helpful-downloads.component.scss'],
})
export class HelpfulDownloadsComponent {
  public wizards: Wizard[];
  public isFirst: boolean;
  public isLast: boolean;
  public currentIndex: number;
  public imageUrl: string;
  public rawVideoUrl: string;

  constructor(private route: ActivatedRoute, private breadcrumbService: BreadcrumbService) {}

  ngOnInit(): void {
    this.breadcrumbService.show(JourneyType.HELP);
  }
}
