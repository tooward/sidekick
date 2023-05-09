import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestuiComponent } from './testui.component';

describe('TestuiComponent', () => {
  let component: TestuiComponent;
  let fixture: ComponentFixture<TestuiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TestuiComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestuiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
