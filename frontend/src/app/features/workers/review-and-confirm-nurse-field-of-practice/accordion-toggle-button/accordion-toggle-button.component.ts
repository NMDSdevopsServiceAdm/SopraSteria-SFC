import { Component, computed, input, OnInit, output, signal } from '@angular/core';

export interface ButtonText {
  whenOpen: string;
  whenClose: string;
}
const DefaultButtonText = {
  whenOpen: 'Hide details',
  whenClose: 'Add details',
};

@Component({
  selector: 'app-accordion-toggle-button',
  templateUrl: './accordion-toggle-button.component.html',
  imports: [],
})
export class AccordionToggleButtonComponent implements OnInit {
  public expandedAtStart = input<boolean>(false);
  public buttonText = input<ButtonText>(DefaultButtonText);
  public toggleState = output<boolean>();

  public isExpanded = signal<boolean>(false);

  constructor() {}

  ngOnInit(): void {
    this.isExpanded.set(this.expandedAtStart());
  }

  public currentButtonText = computed<string>(() => {
    const isExpanded = this.isExpanded();

    const buttonText = this.buttonText();
    if (isExpanded) {
      return buttonText.whenOpen;
    } else {
      return buttonText.whenClose;
    }
  });

  public handleClick(_event: Event) {
    this.isExpanded.update((isExpanded) => {
      this.toggleState.emit(!isExpanded);
      return !isExpanded;
    });
  }
}
