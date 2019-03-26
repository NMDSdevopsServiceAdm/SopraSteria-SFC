import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { BaseNumber } from './base-number.directive';

/*
 * This directive applies to all input[type="number"] to prevent strings like 00999 acceptable
 * by default by JS engines as numbers.
 */
@Directive({
  selector: 'input[type=number][appNumberDigitsMax]',
})
export class NumberDigitsMax extends BaseNumber {
  @Input('appNumberDigitsMax') maxDigits: number;

  constructor(private el: ElementRef) {
    super();
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    const { key } = event;

    if (isFinite(parseInt(key, 10)) && !this.isSelectionTypeRange()) {
      const curVal = this.el.nativeElement.value;
      const nextVal = `${isNaN(curVal) ? '' : curVal}${key}`;

      if (!this.isSelectionTypeRange()) {
        if (
          (nextVal.startsWith('-') && nextVal.substring(1).length > this.maxDigits) ||
          nextVal.length > this.maxDigits
        ) {
          event.preventDefault();
        }
      }
    }
  }
}
