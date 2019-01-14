import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-submit-button',
  templateUrl: './submit-button.component.html'
})
export class SubmitButtonComponent {
  @Input() saveCallback: Function

  constructor() { }

  async saveAndExit() {
    if (this.saveCallback) {
      try {
        await this.saveCallback()
        // TODO implement exit behaviour

      } catch (err) {
        // this should be already handled by saveCallback()
        // keep typescript transpiler silent
      }

    } else {
      throw new TypeError("'saveCallback' function not provided!")
    }
  }

  viewRecordSummary() {
    // TODO implement
  }
}
