import { Component, OnInit } from '@angular/core';
import { BackService } from '@core/services/back.service';

@Component({
  selector: 'app-about-us-registration',
  templateUrl: './about-us.component.html',
})
export class AboutUsRegistrationComponent implements OnInit {
  constructor(private backService: BackService) {}

  ngOnInit(): void {
    this.backService.setBackLink({ url: ['registration', 'create-account'] });
  }
}
