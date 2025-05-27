import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-help-and-tips-button',
  templateUrl: './help-and-tips-button.component.html',
  styleUrls: ['./help-and-tips-button.component.scss']
})
export class HelpAndTipsButtonComponent {

  constructor(private router: Router) { }

  public onClick = () => {
    this.router.navigate(['/help', 'get-started']);
  }

}
