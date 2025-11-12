import { Component, EventEmitter, Output } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { SubmitExitButtonsComponent } from '@shared/components/submit-exit-buttons/submit-exit-buttons.component';

@Component({
    selector: 'app-missing-refs-submit-exit-buttons',
    templateUrl: './missing-refs-submit-exit-buttons.component.html',
    standalone: false
})
export class MissingRefsSubmitExitButtonsComponent extends SubmitExitButtonsComponent {
  constructor(public authService: AuthService) {
    super();
  }

  @Output() public skip: EventEmitter<any> = new EventEmitter();

  onSkip(): void {
    this.skip.emit(null);
  }
}
