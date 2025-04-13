import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QrCodeCreateComponent } from './qr-code-create.component';

describe('QrCodeCreateComponent', () => {
  let component: QrCodeCreateComponent;
  let fixture: ComponentFixture<QrCodeCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QrCodeCreateComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(QrCodeCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
