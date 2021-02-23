import { Component, EventEmitter, Input, Output } from '@angular/core';
import { URLStructure } from '@core/model/url.model';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-missing-refs-submit-exit-buttons',
  templateUrl: './missing-refs-submit-exit-buttons.component.html',
})
export class MissingRefsSubmitExitButtonsComponent {
  constructor(public authService: AuthService) {}

  @Input() public cta?: string;
  @Input() public exit?: string;
  @Input() public return?: URLStructure;
  @Output() public skip: EventEmitter<any> = new EventEmitter();

  onSkip(): void {
    this.skip.emit(null);
  }
}
