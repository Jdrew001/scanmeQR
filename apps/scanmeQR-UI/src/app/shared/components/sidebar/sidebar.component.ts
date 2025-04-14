import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth.service';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterLink],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  navItems = [
    { label: 'Overview', icon: 'pi pi-home', routerLink: '/overview' },
    { label: 'Analytics', icon: 'pi pi-chart-bar', routerLink: '/analytics' },
    { label: 'Subscription', icon: 'pi pi-credit-card', routerLink: '/subscription' },
    { label: 'Profile', icon: 'pi pi-user', routerLink: '/profile' }
  ];

  constructor(
    private router: Router,
    private authService: AuthService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  logout() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to log out?',
      header: 'Logout Confirmation',
      icon: 'pi pi-info-circle',
      accept: () => {
      //   this.authService.logout().subscribe({
      //     next: () => {
      //       this.messageService.add({ severity: 'success', summary: 'Success', detail: 'You have been logged out successfully' });
      //       this.router.navigate(['/auth/login']);
      //     },
      //     error: (err) => {
      //       console.error('Logout error', err);
      //       this.messageService.add({ severity: 'error', summary: 'Error', detail: 'An error occurred during logout' });
      //     }
      }
    });
  }
}
