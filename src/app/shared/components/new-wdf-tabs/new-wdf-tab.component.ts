import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-new-wdf-tab',
  templateUrl: './new-wdf-tab.component.html',
  styleUrls: ['./new-wdf-tab.component.scss'],
})
export class WDFTabComponent implements OnInit {
  @Input() workplaceGreenTick = false;
  @Input() workplaceAlert = false;
  @Input() workplaceRedCross = false;

  @Input() staffGreenTick = false;
  @Input() staffAlert = false;
  @Input() staffRedCross = false;

  @Input() viewWDFData: boolean;
  @Output() handleViewToggle: EventEmitter<boolean> = new EventEmitter();

  public slug: string;

  ngOnInit() {
    console.log({ viewTrainingByCategory: this.viewWDFData });
  }

  public handleViewChange(event: Event): void {
    event.preventDefault();
    this.handleViewToggle.emit(!this.viewWDFData);
  }
}
