import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-accordion-item',
  templateUrl: './accordion-item.component.html',
})
export class AccordionItemComponent {
  @Input() title: string;
  @Input() description?: string;
  @Input() expanded: boolean;
  @Output() toggleEmitter: EventEmitter<Event> = new EventEmitter();

  toggleAccordion() {
    this.toggleEmitter.emit();
  }
}
