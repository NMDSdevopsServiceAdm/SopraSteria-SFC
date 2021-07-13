import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewSelectMainServiceComponent } from './new-select-main-service.component';

describe('NewSelectMainServiceComponent', () => {
  let component: NewSelectMainServiceComponent;
  let fixture: ComponentFixture<NewSelectMainServiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NewSelectMainServiceComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewSelectMainServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});
