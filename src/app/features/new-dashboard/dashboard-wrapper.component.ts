import { Component, OnInit } from '@angular/core';
import { EstablishmentService } from '@core/services/establishment.service';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';

@Component({
  selector: 'app-dashboard-wrapper',
  templateUrl: './dashboard-wrapper.component.html',
})
export class DashboardWrapperComponent implements OnInit {
  public standAloneAccount: boolean;
  public newHomeDesignFlag: boolean;

  constructor(private establishmentService: EstablishmentService, private featureFlagsService: FeatureFlagsService) {}

  ngOnInit(): void {
    this.standAloneAccount = this.establishmentService.standAloneAccount;
    this.newHomeDesignFlag = this.featureFlagsService.newHomeDesignFlag;
  }
}
