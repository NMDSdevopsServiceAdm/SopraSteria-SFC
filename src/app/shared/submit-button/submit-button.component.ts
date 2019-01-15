import { Component, Input } from '@angular/core';
import { Router } from "@angular/router"

@Component({
  selector: 'app-submit-button',
  templateUrl: './submit-button.component.html'
})
export class SubmitButtonComponent {
  @Input() saveCallback: Function

  constructor(
    private router: Router
  ) {}

  async saveAndExit() {
    if (this.saveCallback) {
      try {
        await this.saveCallback()
        this.router.navigate(["/welcome"])

      } catch (err) {
        // this should be already handled by saveCallback()
        // keep typescript transpiler silent
      }

    } else {
      throw new TypeError("'saveCallback' function not provided!")
    }
  }

  viewRecordSummary() {
    // TODO to be implemented
  }
}
