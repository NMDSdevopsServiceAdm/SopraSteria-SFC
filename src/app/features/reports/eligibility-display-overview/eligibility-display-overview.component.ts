import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-eligibility-display-overview',
  templateUrl: './eligibility-display-overview.component.html',
  styleUrls: ['./eligibility-display-overview.component.scss']
})
export class EligibilityDisplayOverviewComponent implements OnInit {
  @Input() eligibility: string;

  constructor() { }

  ngOnInit() {
  }

}
