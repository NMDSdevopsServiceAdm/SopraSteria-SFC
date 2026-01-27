import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonMenuComponent } from './button-menu.component';

describe('ButtonMenuComponent', () => {
  let component: ButtonMenuComponent;
  let fixture: ComponentFixture<ButtonMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ButtonMenuComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initially set the sub-menu to be closed', () => {
    const buttonMenu = fixture.nativeElement.querySelector('button');
    expect(buttonMenu.getAttribute('aria-expanded')).toEqual('false');
  });

  it('should open the sub-menu when clicked', () => {
    const buttonMenu = fixture.nativeElement.querySelector('button');
    buttonMenu.click();
    fixture.detectChanges();
    expect(buttonMenu.getAttribute('aria-expanded')).toEqual('true');
  });
});
