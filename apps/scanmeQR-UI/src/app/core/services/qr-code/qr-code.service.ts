import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { QrCode, QrCodePreview, QrCodeStats } from '../../models/qr-code.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class QrCodeService {
  private readonly API_URL = `${environment.apiUrl}/qr-codes`;

  constructor(private http: HttpClient) {}

  getQrCodes(): Observable<QrCode[]> {
    return this.http.get<QrCode[]>(this.API_URL);
  }

  getQrCode(id: string): Observable<QrCode> {
    return this.http.get<QrCode>(`${this.API_URL}/${id}`);
  }

  createQrCode(qrCode: Partial<QrCode>): Observable<QrCode> {
    return this.http.post<QrCode>(this.API_URL, qrCode);
  }

  updateQrCode(id: string, qrCode: Partial<QrCode>): Observable<QrCode> {
    return this.http.patch<QrCode>(`${this.API_URL}/${id}`, qrCode);
  }

  deleteQrCode(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  getQrCodeImage(id: string): Observable<Blob> {
    return this.http.get(`${this.API_URL}/${id}/image`, { responseType: 'blob' });
  }

  getQrCodePreview(id: string | null, qrCodeData: Partial<QrCode>): Observable<QrCodePreview> {
    const url = id
      ? `${this.API_URL}/${id}/preview`
      : `${this.API_URL}/preview`;

    return this.http.post<QrCodePreview>(url, qrCodeData);
  }

  getStatistics(): Observable<QrCodeStats> {
    return this.http.get<QrCodeStats>(`${this.API_URL}/statistics`);
  }

  // This is a mock method for development until your backend implements this feature
  getMockStatistics(): QrCodeStats {
    return {
      totalScans: 20,
      activeQrCodes: 20,
      totalVisits: 20,
      subscriptionStatus: 'ACTIVE'
    };
  }
}
