import { Component, OnInit } from '@angular/core';
import { URLStructure } from '@core/model/url.model';

@Component({
  selector: 'app-how-did-you-hear-about',
  templateUrl: './how-did-you-hear-about.component.html',
})
export class HowDidYouHearAboutComponent implements OnInit {
  public return: URLStructure;

  ngOnInit(): void {
    this.return = { url: ['/dashboard'], fragment: 'training-and-qualifications' };

    /**/
  }
}
