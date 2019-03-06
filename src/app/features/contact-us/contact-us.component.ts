import { Component } from '@angular/core';
import { WindowRef } from '@core/services/window.ref';

@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.component.html',
})
export class ContactUsComponent {
  constructor(private windowRef: WindowRef) {}

  closeWindow() {
    this.windowRef.nativeWindow.close();
  }
}
