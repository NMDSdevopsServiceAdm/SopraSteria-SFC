import { Component, computed, effect, input, OnInit, output, signal } from '@angular/core';

export interface ToggleText {
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
  public buttonText = input<ToggleText>(DefaultButtonText);
  public clickEmitter = output<isExpanded>();

  public isExpanded = signal<boolean>(false);

  public currentButtonText = computed<string>(() => {
    const isExpanded = this.isExpanded();
    const buttonText = this.buttonText();

    if (isExpanded) {
      return buttonText.whenOpen;
    } else {
      return buttonText.whenClose;
    }
  });

  constructor() {
    effect(() => {
      const isExpanded = this.isExpanded();
      this.clickEmitter.emit(isExpanded);
    });
  }

  ngOnInit(): void {
    this.isExpanded.set(this.expandedAtStart());
  }

  public handleClick(_event: Event) {
    this.toggleState();
  }

  public toggleState() {
    this.isExpanded.update((isExpanded) => !isExpanded);
  }
}

type isExpanded = boolean;
