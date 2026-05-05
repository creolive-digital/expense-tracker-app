import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard';
import { TransactionFormComponent } from './components/transaction-form/transaction-form';
import { TransactionListComponent } from './components/transaction-list/transaction-list';
import { SettingsComponent } from './components/settings/settings';
import { AnalyticsComponent } from './components/analytics/analytics';
import { BudgetComponent } from './components/budget/budget';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'add-transaction', component: TransactionFormComponent },
  { path: 'transactions', component: TransactionListComponent },
  { path: 'analytics', component: AnalyticsComponent },
  { path: 'budget', component: BudgetComponent },
  { path: 'settings', component: SettingsComponent }
];
