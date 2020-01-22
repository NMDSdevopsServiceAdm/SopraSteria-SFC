import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/pairwise';

import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-problem-with-the-service',
  templateUrl: './problem-with-the-service.component.html',
})
export class ProblemWithTheServiceComponent implements OnInit {
  constructor(private router: Router) {}
public bulkUploadError;
public name ='Manish';
  ngOnInit() {
    this.router.events
        .filter(e => e instanceof NavigationEnd)
        .pairwise().subscribe((e: any) => {
            if(e[0].urlAfterRedirects === '/bulk-upload'){
              this.bulkUploadError = true;
              this.name ='Srivastava';
            }

        });

  }
}
