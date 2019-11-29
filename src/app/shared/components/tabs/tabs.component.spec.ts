import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { TabComponent } from './tab.component';
import { TabsComponent } from './tabs.component';

describe('TabsComponent', () => {
  let component: TabsComponent;
  let tab: TabComponent;
  let fixture: ComponentFixture<TabsComponent>;
  let tabFix: ComponentFixture<TabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [TabsComponent, TabComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TabsComponent);
    tabFix = TestBed.createComponent(TabComponent);
    tab = tabFix.componentInstance;
    component = fixture.componentInstance;
    tab.title = 'Test';
    tab.active = true;
    tab.alert = false;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
