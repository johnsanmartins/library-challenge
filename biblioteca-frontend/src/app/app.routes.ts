import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'books',
    pathMatch: 'full'
  },
  {
    path: 'books',
    loadComponent: () =>
      import('./features/books/book-list/book-list.component').then(m => m.BookListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'authors',
    loadComponent: () =>
      import('./features/authors/author-list/author-list.component').then(m => m.AuthorListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'clients',
    loadComponent: () =>
      import('./features/clients/client-list/client-list.component').then(m => m.ClientListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'loans',
    loadComponent: () =>
      import('./features/loans/loan-list/loan-list.component').then(m => m.LoanListComponent),
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: 'books'
  }
];
