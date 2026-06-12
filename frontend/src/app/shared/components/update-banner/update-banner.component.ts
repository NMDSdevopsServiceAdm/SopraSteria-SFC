import { Component } from '@angular/core';
import { SharedModule } from '@shared/shared.module';

@Component({
  selector: 'app-update-banner',
  templateUrl: './update-banner.component.html',
  styleUrl: './update-banner.component.scss',
  imports: [SharedModule],
})
export class UpdateBannerComponent {}
