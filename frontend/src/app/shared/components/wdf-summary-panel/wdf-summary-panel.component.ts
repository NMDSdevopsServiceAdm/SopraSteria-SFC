import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-wdf-summary-panel',
  templateUrl: './wdf-summary-panel.component.html',
  styleUrls: ['./wdf-summary-panel.component.scss'],
})
export class WdfSummaryPanel implements OnInit {
  @Input() sections: any = [];

  constructor(private router: Router) {}

  ngOnInit(): void {}

  public onClick(event: Event, route: string, fragment: string): void {
    event.preventDefault();

    // this.router.navigate([route], { fragment: fragment });
  }
}
