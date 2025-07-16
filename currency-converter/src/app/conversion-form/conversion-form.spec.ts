import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConversionForm } from './conversion-form';

describe('ConversionForm', () => {
  let component: ConversionForm;
  let fixture: ComponentFixture<ConversionForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConversionForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConversionForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
