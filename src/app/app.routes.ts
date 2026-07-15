import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./Pages/invitation/invitation.page').then((m) => m.InvitationPage),
  },
  { path: '**', redirectTo: '' },
];
