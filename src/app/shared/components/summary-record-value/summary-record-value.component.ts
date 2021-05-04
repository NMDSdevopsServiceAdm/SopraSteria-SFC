import { Component, Input, OnInit } from '@angular/core';
import { Eligibility, WDFValue } from '@core/model/wdf.model';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';

@Component({
  selector: 'app-summary-record-value',
  templateUrl: './summary-record-value.component.html',
})
export class SummaryRecordValueComponent implements OnInit {
  public wdfNewDesign: boolean;
  @Input() wdfView: boolean;
  @Input() wdfValue: WDFValue;
  public ELIGIBILITY = Eligibility;

  constructor(private featureFlagsService: FeatureFlagsService) {}

  ngOnInit() {
    this.featureFlagsService.configCatClient.getValueAsync('wdfNewDesign', false).then((value) => {
      this.wdfNewDesign = value;
    });
  }
}
