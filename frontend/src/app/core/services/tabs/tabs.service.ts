import { Injectable } from '@angular/core';

import { TabsInterfaceService } from './tabs-interface.service';

interface Tab {
  title: string;
  slug: string;
  active: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class TabsService extends TabsInterfaceService {}
