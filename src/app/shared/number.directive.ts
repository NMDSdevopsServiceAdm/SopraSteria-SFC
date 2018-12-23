import { Input, Directive, ElementRef, HostListener } from "@angular/core"

@Directive({
  selector: "input[appNumber]"
})
export class Number {
  @Input() public allowNegative: boolean
  @Input() public allowFloat: boolean
  @Input() public max: number

  private static specialKeyCodes: Array<number> = [ 8, 9, 35, 36, 37, 39, 91 ]

  private previousKeyCode

  constructor(private el: ElementRef) {}

  private isKeyCodeDecrement(keyCode) {
    return keyCode === 40
  }

  private isKeyCodeIncrement(keyCode) {
    return keyCode === 38
  }

  private isKeyCodeDot(keyCode) {
    return keyCode === 190
  }

  private isKeyCodeZero(keyCode) {
    return keyCode === 48
  }

  private isKeyCodeMinus(keyCode) {
    return keyCode === 189
  }

  @HostListener("keydown", ["$event"])
  onKeyDown(event: KeyboardEvent) {
    const { key, keyCode } = event

    if (!Number.specialKeyCodes.some(k => k === keyCode)) {
      const curVal = this.el.nativeElement.value
      const curValNum = parseFloat(curVal)
      const nextVal = `${isNaN(curVal) ? "" : curVal}${key}`
      const nextValNum = parseFloat(nextVal)

      if (this.isKeyCodeDecrement(keyCode)) {
        if (!this.allowNegative && curValNum - 1 < 0) {
          event.preventDefault()
        }

      } else if (this.isKeyCodeIncrement(keyCode)) {
        if (this.max !== undefined && curValNum + 1 > this.max) {
          event.preventDefault()
        }

      } else {
        if (!this.allowFloat && this.isKeyCodeDot(keyCode)) {
          event.preventDefault()

        } else if (!this.allowNegative && (this.isKeyCodeMinus(keyCode) || nextValNum < 0)) {
          event.preventDefault()

        } else if (/^0\d+/.test(nextVal)) {
          event.preventDefault()

        } else if (this.max !== undefined && nextValNum > this.max) {
          event.preventDefault()
        }
      }
    }

    this.previousKeyCode = keyCode
  }
}
