export abstract class BaseNumber {
  private static specialKeyCodes: Array<number> = [ 9, 35, 36, 37, 39, 91 ]

  protected isKeyCodeSpecial(keyCode) {
    return BaseNumber.specialKeyCodes.some(k => k === keyCode)
  }

  protected isKeyCodeIncrement(keyCode) {
    return keyCode === 38
  }

  protected isKeyCodeDecrement(keyCode) {
    return keyCode === 40
  }

  protected isKeyCodeZero(keyCode) {
    return keyCode === 48
  }

  protected isKeyCodeComma(keyCode) {
    return keyCode === 188
  }

  protected isKeyCodeMinus(keyCode) {
    return keyCode === 189
  }

  protected isKeyCodeDot(keyCode) {
    return keyCode === 190
  }
}
