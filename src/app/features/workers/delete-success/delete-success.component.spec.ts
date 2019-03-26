import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteSuccessComponent } from './delete-success.component';

describe('DeleteSuccessComponent', () => {
  let component: DeleteSuccessComponent;
  let fixture: ComponentFixture<DeleteSuccessComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeleteSuccessComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteSuccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
