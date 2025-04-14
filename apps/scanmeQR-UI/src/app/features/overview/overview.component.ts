import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginatorModule } from 'primeng/paginator';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { QrCode } from '../../../../../../shared/data/src/lib/entities/qr-codes/qr-code.entity';
import { QrCodeEditComponent } from '../qr-codes/qr-code-edit.component';
import { QrCodeService } from '../../core/services/qr-code/qr-code.service';
import { MessageService } from 'primeng/api';
import { QrCodeCreateComponent } from '../qr-codes/qr-code-create.component';
import { provideHttpClientTesting } from '@angular/common/http/testing';

@Component({
  selector: 'app-overview',
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    CardModule,
    InputTextModule,
    ButtonModule,
    PaginatorModule
  ],
  providers: [
    QrCodeService
  ],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss',
})
export class OverviewComponent {
  qrCodes: QrCode[] = [];
  loading = true;
  totalRecords = 0;
  rows = 10;
  first = 0;
  globalSearchText = '';
  stats = {
    totalScans: 0,
    activeQrCodes: 0,
    totalVisits: 0,
    subscriptionStatus: 'ACTIVE'
  };

  private dialogRef: DynamicDialogRef | undefined;

  constructor(
    private qrCodeService: QrCodeService,
    private dialogService: DialogService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadQrCodes();
    this.loadStatistics();
  }

  loadQrCodes(page: number = 0): void {
    this.loading = true;
    this.qrCodeService.getQrCodes().subscribe({
      next: (data: any) => {
        this.qrCodes = data;
        this.totalRecords = data.length; // Would typically come from server pagination
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading QR codes', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load QR codes' });
        this.loading = false;
      }
    });
  }

  loadStatistics(): void {
    this.qrCodeService.getStatistics().subscribe({
      next: (data) => {
        this.stats = data;
      },
      error: (err) => {
        console.error('Error loading statistics', err);
      }
    });
  }

  createQrCode(): void {
    this.dialogRef = this.dialogService.open(QrCodeCreateComponent, {
      header: 'Create New QR Code',
      width: '500px',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      maximizable: true
    });

    this.dialogRef.onClose.subscribe((newQrCode) => {
      if (newQrCode) {
        this.loadQrCodes();
        this.loadStatistics();
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'QR code created successfully' });
      }
    });
  }

  editQrCode(qrCode: QrCode): void {
    this.dialogRef = this.dialogService.open(QrCodeEditComponent, {
      header: 'Edit QR Code',
      width: '500px',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      maximizable: true,
      data: { qrCode }
    });

    this.dialogRef?.onClose.subscribe((updated) => {
      if (updated) {
        this.loadQrCodes();
        this.loadStatistics();
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'QR code updated successfully' });
      }
    });
  }

  onGlobalSearch(event: any): void {
    // Implement search functionality
    // For now, just simulate filtering
    this.loadQrCodes();
  }

  onPageChange(event: any): void {
    this.first = event.first;
    this.rows = event.rows;
    this.loadQrCodes(Math.floor(this.first / this.rows));
  }

  protected readonly Math = Math;
}
