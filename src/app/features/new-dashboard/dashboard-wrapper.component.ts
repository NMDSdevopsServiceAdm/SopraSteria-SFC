import { Component, OnInit } from '@angular/core';
import { EstablishmentService } from '@core/services/establishment.service';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';

@Component({
  selector: 'app-dashboard-wrapper',
  templateUrl: './dashboard-wrapper.component.html',
})
export class DashboardWrapperComponent implements OnInit {
  public standAloneAccount: boolean;
  public parentAccount: boolean;
  public newHomeDesignFlag: boolean;
  public newHomeDesignParentFlag: boolean;
  public subsAccount: boolean;

  constructor(private establishmentService: EstablishmentService, private featureFlagsService: FeatureFlagsService) {}

  ngOnInit(): void {
    this.standAloneAccount = this.establishmentService.standAloneAccount;
    this.parentAccount = this.establishmentService.primaryWorkplace?.isParent;
    this.newHomeDesignFlag = this.featureFlagsService.newHomeDesignFlag;
    this.newHomeDesignParentFlag = this.featureFlagsService.newHomeDesignParentFlag;
    this.subsAccount = this.establishmentService.primaryWorkplace?.parentName ? true : false;
  }
}
