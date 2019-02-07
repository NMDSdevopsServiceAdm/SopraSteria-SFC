import { Directive, ElementRef, HostListener } from "@angular/core"

import { BaseNumber } from "./base-number.directive"

@Directive({
  selector: "input[type=number][appNumberPositiveOnly]"
})
export class NumberPositiveOnly extends BaseNumber {
  constructor(private el: ElementRef) {
    super()
  }

  @HostListener("keydown", ["$event"])
  onKeyDown(event: KeyboardEvent) {
    const { key, keyCode } = event

    if ((isFinite(parseInt(key)) && !this.isSelectionTypeRange()) ||
        this.isKeyCodeIncrement(keyCode) ||
        this.isKeyCodeDecrement(keyCode)) {
      const curVal = parseFloat(this.el.nativeElement.value)
      const nextVal = `${isNaN(curVal) ? "" : curVal}${key}`

      if ((this.isKeyCodeDecrement(keyCode) && curVal - 1 < 0) ||
          this.isKeyCodeMinus(keyCode) ||
          parseFloat(nextVal) < 0) {
        event.preventDefault()
      }
    }
  }
}
