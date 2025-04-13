import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QrCodeEditComponent } from './qr-code-edit.component';

describe('QrCodeEditComponent', () => {
  let component: QrCodeEditComponent;
  let fixture: ComponentFixture<QrCodeEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QrCodeEditComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(QrCodeEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
