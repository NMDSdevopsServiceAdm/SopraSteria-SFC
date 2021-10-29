import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-benefit-accordion',
  templateUrl: './benefit-accordion.component.html',
})
export class BenefitAccordionComponent {
  @Input() index: number;
  @Input() benefit: {
    title: string;
    open: boolean;
  };

  @Output() toggleIndex: EventEmitter<Event> = new EventEmitter();

  public emitToggle(): void {
    this.toggleIndex.emit();
  }
}
