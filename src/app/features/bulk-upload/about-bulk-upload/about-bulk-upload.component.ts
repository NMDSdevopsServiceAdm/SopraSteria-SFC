import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';

@Component({
  selector: 'app-about-bulk-upload',
  templateUrl: './about-bulk-upload.component.html',
})
export class AboutBulkUploadComponent implements OnInit {
  public bulkUploadHelpFlag: boolean;

  constructor(
    private breadcrumbService: BreadcrumbService,
    private router: Router,
    private featureFlagsService: FeatureFlagsService,
  ) {}

  async ngOnInit(): Promise<void> {
    this.breadcrumbService.show(JourneyType.BULK_UPLOAD);

    this.bulkUploadHelpFlag = await this.featureFlagsService.configCatClient.getValueAsync('bulkUploadHelp', false);
  }
}
