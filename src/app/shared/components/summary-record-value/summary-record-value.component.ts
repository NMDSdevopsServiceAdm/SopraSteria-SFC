import { Component, Input, OnInit } from '@angular/core';
import { Eligibility, WDFValue } from '@core/model/wdf.model';

@Component({
  selector: 'app-summary-record-value',
  templateUrl: './summary-record-value.component.html',
})
export class SummaryRecordValueComponent implements OnInit {
  @Input() wdfView: boolean;
  @Input() wdfValue: WDFValue;
  @Input() overallWdfEligibility: boolean;

  public ELIGIBILITY = Eligibility;

  ngOnInit(): void {
    this.ELIGIBILITY;
  }
}
