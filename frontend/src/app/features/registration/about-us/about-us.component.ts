import { Component, OnInit } from '@angular/core';
import { BackLinkService } from '@core/services/backLink.service';

@Component({
  selector: 'app-about-us-registration',
  templateUrl: './about-us.component.html',
  standalone: false,
})
export class AboutUsRegistrationComponent implements OnInit {
  constructor(private backLinkService: BackLinkService) {}

  ngOnInit(): void {
    this.backLinkService.showBackLink();
  }
}
