import { Directive, HostListener } from "@angular/core"

import { BaseNumber } from "./base-number.directive"

@Directive({
  selector: "input[type=number][appNumberIntOnly]"
})
export class NumberIntOnly extends BaseNumber {
  @HostListener("keydown", ["$event"])
  onKeyDown(event: KeyboardEvent) {
    if (this.isKeyCodeDot(event.keyCode)) {
      event.preventDefault()
    }
  }
}
