import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { LongDatePipe } from '../../../shared/pipes/long-date.pipe';
import { NotificationTypePipe } from '@shared/pipes/notification-type.pipe';
import { NotificationComponent } from './notification.component';
import { DataViewPermissionsPipe } from '../../../shared/pipes/data-view-permissions.pipe';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { AlertService } from '@core/services/alert.service';
import { WindowRef } from '../../../core/services/window.ref';

describe('NotificationComponent', () => {
  let component: NotificationComponent;
  let fixture: ComponentFixture<NotificationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DataViewPermissionsPipe, NotificationTypePipe, LongDatePipe, NotificationComponent],
      imports: [RouterTestingModule, HttpClientModule, BrowserDynamicTestingModule],
      providers: [AlertService, WindowRef],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create NotificationComponent', () => {
    expect(component).toBeTruthy();
  });
});
