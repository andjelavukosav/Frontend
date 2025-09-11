import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsTourComponent } from './details-tour.component';

describe('DetailsTourComponent', () => {
  let component: DetailsTourComponent;
  let fixture: ComponentFixture<DetailsTourComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DetailsTourComponent]
    });
    fixture = TestBed.createComponent(DetailsTourComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
