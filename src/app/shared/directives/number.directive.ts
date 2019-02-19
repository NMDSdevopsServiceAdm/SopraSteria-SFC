import { Directive, ElementRef, HostListener } from '@angular/core';
import { BaseNumber } from './base-number.directive';

/*
 * This directive applies to all input[type="number"] to prevent strings like 00999 acceptable
 * by default by JS engines as numbers.
 */
@Directive({
  selector: 'input[type=number]',
})
export class Number extends BaseNumber {
  private pattern = /^-?\d*/;

  constructor(private el: ElementRef) {
    super();
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    const { key, keyCode } = event;

    if (isFinite(parseInt(key, 10)) || this.isKeyCodeIncrement(keyCode) || this.isKeyCodeDecrement(keyCode)) {
      const curVal = this.el.nativeElement.value;
      const nextVal = `${curVal}${key}`;

      if (!this.pattern.test(nextVal)) {
        event.preventDefault();
      }
    }
  }
}
