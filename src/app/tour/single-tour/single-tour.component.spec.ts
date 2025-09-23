import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleTourComponent } from './single-tour.component';

describe('SingleTourComponent', () => {
  let component: SingleTourComponent;
  let fixture: ComponentFixture<SingleTourComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SingleTourComponent]
    });
    fixture = TestBed.createComponent(SingleTourComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
