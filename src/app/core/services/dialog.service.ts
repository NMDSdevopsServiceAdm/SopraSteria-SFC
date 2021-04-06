import { FocusTrap, FocusTrapFactory } from '@angular/cdk/a11y';
import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, ComponentType, PortalInjector } from '@angular/cdk/portal';
import { Injectable, InjectionToken, Injector } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export const DIALOG_DATA = new InjectionToken<any>('DIALOG_DATA');

export class Dialog<T, R = any> {
  private readonly _afterClosed = new Subject<R | undefined>();
  private readonly overlayRef: OverlayRef;
  private readonly focusTrap: FocusTrap;

  constructor(
    private componentType: ComponentType<T>,
    private overlay: Overlay,
    private injector: Injector,
    private focusTrapFactory: FocusTrapFactory,
    private data: any,
  ) {
    const config = new OverlayConfig({
      positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically(),
      hasBackdrop: true,
      scrollStrategy: this.overlay.scrollStrategies.block(),
      disposeOnNavigation: true,
    });

    const customInjector = this.createInjector(this.data);

    this.overlayRef = this.overlay.create(config);

    const sub = this.overlayRef.backdropClick().subscribe(() => {
      this.close();
      sub.unsubscribe();
    });

    const componentPortal = new ComponentPortal(this.componentType, null, customInjector);

    this.overlayRef.attach(componentPortal);
    this.focusTrap = this.focusTrapFactory.create(this.overlayRef.overlayElement);
    this.overlayRef.overlayElement.setAttribute('tabindex', '-1');
    this.overlayRef.overlayElement.setAttribute('aria-modal', 'true');
    this.overlayRef.overlayElement.setAttribute('aria-labelledby', 'dialogHeading');
    this.overlayRef.overlayElement.setAttribute('role', 'dialog');
    this.overlayRef.overlayElement.focus();
  }

  get afterClosed(): Observable<R | undefined> {
    return this._afterClosed.asObservable();
  }

  close(result?: R) {
    this._afterClosed.next(result);
    this._afterClosed.complete();

    this.focusTrap.destroy();
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
  constructor(private overlay: Overlay, private injector: Injector, private focusTrapFactory: FocusTrapFactory) {}

  open<T, D = any>(componentType: ComponentType<T>, data) {
    const dialog = new Dialog<T, D>(componentType, this.overlay, this.injector, this.focusTrapFactory, data);

    return dialog;
  }
}
