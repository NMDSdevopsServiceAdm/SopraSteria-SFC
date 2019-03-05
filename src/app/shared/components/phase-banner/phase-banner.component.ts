import { Component, Input } from '@angular/core';

export enum Phase {
  Alpha = 'alpha',
  Beta = 'beta',
}

@Component({
  selector: 'app-phase-banner',
  templateUrl: './phase-banner.component.html',
})
export class PhaseBannerComponent {
  @Input() phase: Phase = Phase.Alpha;

  constructor() {}
}
