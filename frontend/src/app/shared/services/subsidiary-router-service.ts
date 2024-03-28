import { Injectable } from '@angular/core';
import { NavigationBehaviorOptions, Router, UrlTree } from '@angular/router';

import { ParentSubsidiaryViewService } from './parent-subsidiary-view.service';

const exitSubsidiaryViewPages = [
  'account-management',
  'login',
  'notifications',
  'satisfaction-survey',
  'sfcadmin',
  'first-login-wizard',
];

@Injectable()
export class SubsidiaryRouterService extends Router {
  constructor(private parentSubsidiaryViewService: ParentSubsidiaryViewService) {
    super();
  }

  getCommands(urlTree: UrlTree) {
    let commands = [];
    for (let segment of urlTree.root.children.primary.segments) {
      commands.push(segment.path);
    }
    const navigationExtras = {
      fragment: urlTree.fragment,
    };

    return { commands, navigationExtras };
  }

  getNewRoute(commands: any[], extras?: any) {
    if (this.parentSubsidiaryViewService.getViewingSubAsParent() && !commands[0].includes('subsidiary')) {
      // If routing to the dashboard, override fragments
      if (commands[0].toLowerCase().includes('dashboard')) {
        commands = [extras.fragment ? extras.fragment : 'home', this.parentSubsidiaryViewService.getSubsidiaryUid()];
        extras = undefined;

        this.parentSubsidiaryViewService.canShowBanner = true;
      } else {
        // Remove forward slashes from the route
        for (let i = 0; i < commands.length; i++) {
          const splitString = commands[i].split('/').filter((command) => command.length > 0);
          Array.prototype.splice.apply(commands, [i, 1].concat(splitString));
        }

        this.parentSubsidiaryViewService.canShowBanner = false;
      }
      commands.unshift('subsidiary');
    }
    return { commands, extras };
  }

  navigateByUrl(url: UrlTree, extras?: NavigationBehaviorOptions): Promise<boolean> {
    const { commands, navigationExtras } = this.getCommands(url);

    if (exitSubsidiaryViewPages.some((command) => commands[0].includes(command))) {
      this.parentSubsidiaryViewService.clearViewingSubAsParent();
    } else {
      const newRoute = this.getNewRoute(commands, navigationExtras);
      url = super.createUrlTree(newRoute.commands, newRoute.extras);
    }

    return super.navigateByUrl(url, extras);
  }
}
