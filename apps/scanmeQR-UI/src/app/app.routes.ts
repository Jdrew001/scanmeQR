import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    redirectTo: 'overview',
    pathMatch: 'full'
  },
  {
    path: 'overview',
    loadComponent: () => import('./features/overview/overview.component').then(m => m.OverviewComponent),
    title: 'Overview - ScanMeQR'
  },
  {
    path: 'analytics',
    loadComponent: () => import('./features/analytics/analytics.component').then(m => m.AnalyticsComponent),
    title: 'Analytics - ScanMeQR'
  },
  {
    path: 'subscription',
    loadComponent: () => import('./features/subscription/subscription.component').then(m => m.SubscriptionComponent),
    title: 'Subscription - ScanMeQR'
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent),
    title: 'Profile - ScanMeQR'
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
        title: 'Login - ScanMeQR'
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent),
        title: 'Register - ScanMeQR'
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'overview'
  }
];
