import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [RouterModule, SidebarComponent, ToastModule, ConfirmDialogModule],
  providers: [MessageService, DialogService, ConfirmationService]
})
export class AppComponent {
  title = 'ScanMeQR';
}
