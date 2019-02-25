import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-submit-button',
  templateUrl: './submit-button.component.html',
})
export class SubmitButtonComponent {
  @Input() saveCallback: Function;

  constructor(private router: Router) {}

  async saveAndNavigate(url: string) {
    if (this.saveCallback) {
      try {
        await this.saveCallback();
        this.router.navigate([url]);
      } catch (err) {
        // this should be already handled by saveCallback()
        // keep typescript transpiler silent
      }
    } else {
      throw new TypeError(`'saveCallback' function not provided!`);
    }
  }
}
