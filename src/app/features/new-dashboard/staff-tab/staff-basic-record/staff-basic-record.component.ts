import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-staff-basic-record',
  templateUrl: './staff-basic-record.component.html',
})
export class StaffBasicRecord implements OnInit, OnDestroy {
  constructor(private router: Router) {}

  ngOnInit(): void {}

  public returnToHome(): void {
    const returnLink = this.router.navigate(['/dashboard'], { fragment: 'home' });
  }

  ngOnDestroy(): void {}
}
