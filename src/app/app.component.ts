import "core-js"
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'ng-sfc-v2';

  ngOnInit() {

      if (localStorage.getItem('auth-token')) {
        localStorage.clear();
      }

  }

}


