import { Directive, ElementRef, HostListener, Input } from "@angular/core"

import { BaseNumber } from "./base-number.directive"

@Directive({
  selector: "input[type=number][appNumberMax]"
})
export class NumberMax extends BaseNumber {
  @Input("appNumberMax") max: number;

  constructor(private el: ElementRef) {
    super()
  }

  @HostListener("keydown", ["$event"])
  onKeyDown(event: KeyboardEvent) {
    const { key, keyCode } = event

    if (!this.isKeyCodeSpecial(keyCode)) {
      const curVal = this.el.nativeElement.value
      const curValNum = parseFloat(curVal)
      const nextVal = `${isNaN(curVal) ? "" : curVal}${key}`
      const nextValNum = parseFloat(nextVal)

      if (this.isKeyCodeIncrement(keyCode) && curValNum + 1 > this.max ||
          nextValNum > this.max) {
        event.preventDefault()
      }
    }
  }
}
