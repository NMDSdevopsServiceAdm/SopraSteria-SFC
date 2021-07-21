import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-admin-menu',
  templateUrl: './admin-menu.component.html',
})
export class AdminMenuComponent implements OnInit {
  menuComponents: string[];

  ngOnInit(): void {
    this.setupMenu();
  }

  setupMenu(): void {
    this.menuComponents = [
      'Search',
      'Registration requests',
      'CQC status changes',
      'Emails',
      'Admin reports',
      'Local authority returns',
      'Admin users',
      'External links',
    ];
  }
}
