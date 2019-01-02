import { Directive, ElementRef, HostListener } from "@angular/core"

import { BaseNumber } from "./base-number.directive"

/*
 * This directive applies to all input[type="number"] to prevent strings like 00999 acceptable
 * by default by JS engines as numbers.
 */
@Directive({
  selector: "input[type=number]"
})
export class Number extends BaseNumber {
  constructor(private el: ElementRef) {
    super()
  }

  previousValue = null

  @HostListener("keydown", ["$event"])
  onKeyDown(event: KeyboardEvent) {
    const { key, keyCode } = event
    
    if (!this.isKeyCodeSpecial(keyCode) &&
        !this.isKeyCodeIncrement(keyCode) &&
        !this.isKeyCodeDecrement(keyCode)) {
      const curVal = this.el.nativeElement.value
      const nextVal = `${this.previousValue ? this.previousValue : curVal}${key}`

      if (/(^-?0\d+)|(^\,)|(-{2,})|(\.{2,})|(\,{2,})|(\d+-)|[\+]/.test(nextVal)) {
        event.preventDefault()
        
      } else if (this.isKeyCodeMinus(keyCode)) {
        this.previousValue = `${curVal}${key}`

      } else {
        this.previousValue = null
      }
    }
  }
}
