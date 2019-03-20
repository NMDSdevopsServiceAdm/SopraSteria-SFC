import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, ComponentType, PortalInjector } from '@angular/cdk/portal';
import { Injectable, InjectionToken, Injector } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export const DIALOG_DATA = new InjectionToken<any>('DIALOG_DATA');

export class Dialog<T, R = any> {
  private readonly _afterClosed = new Subject<R | undefined>();
  private readonly overlayRef: OverlayRef;

  constructor(
    private componentType: ComponentType<T>,
    private overlay: Overlay,
    private injector: Injector,
    private data: any
  ) {
    const config = new OverlayConfig({
      positionStrategy: this.overlay
        .position()
        .global()
        .centerHorizontally()
        .centerVertically(),
      hasBackdrop: true,
      scrollStrategy: this.overlay.scrollStrategies.block(),
    });

    const customInjector = this.createInjector(this.data);

    this.overlayRef = this.overlay.create(config);
    const componentPortal = new ComponentPortal(this.componentType, null, customInjector);

    this.overlayRef.attach(componentPortal);
  }

  get afterClosed(): Observable<R | undefined> {
    return this._afterClosed.asObservable();
  }

  close(result?: R) {
    this._afterClosed.next(result);
    this._afterClosed.complete();

    this.overlayRef.dispose();
  }

  private createInjector(data): PortalInjector {
    const injectionTokens = new WeakMap();

    injectionTokens.set(Dialog, this);
    injectionTokens.set(DIALOG_DATA, data);

    return new PortalInjector(this.injector, injectionTokens);
  }
}

@Injectable()
export class DialogService {
  constructor(private overlay: Overlay, private injector: Injector) {}

  open<T, D = any>(componentType: ComponentType<T>, data) {
    const dialog = new Dialog<T, D>(componentType, this.overlay, this.injector, data);

    return dialog;
  }
}
