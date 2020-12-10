import { Injectable, isDevMode } from '@angular/core';
import { CanActivate } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class DevelopmentGuard implements CanActivate {
  canActivate() {
    return isDevMode();
  }
}
