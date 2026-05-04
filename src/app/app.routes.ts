import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard';
import { TransactionFormComponent } from './components/transaction-form/transaction-form';
import { TransactionListComponent } from './components/transaction-list/transaction-list';
import { SettingsComponent } from './components/settings/settings';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'add-transaction', component: TransactionFormComponent },
  { path: 'transactions', component: TransactionListComponent },
  { path: 'settings', component: SettingsComponent }
];
