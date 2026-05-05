import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DatabaseService } from '../../services/database';
import { TransactionWithCategory } from '../../models/transaction.model';
import { filter, timeout, catchError, of, firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  balance = { credit: 0, debit: 0, balance: 0 };
  recentTransactions: TransactionWithCategory[] = [];
  loading = true;
  error: string | null = null;

  constructor(private databaseService: DatabaseService) {}

  async ngOnInit() {
    // Show loading for at least 800ms for a smooth transition
    const minWait = new Promise(resolve => setTimeout(resolve, 800));

    try {
      // Wait for database with a 4s timeout
      await Promise.race([
        firstValueFrom(this.databaseService.isReady.pipe(filter(ready => ready))),
        new Promise((_, reject) => setTimeout(() => reject('timeout'), 4000))
      ]);
      
      this.balance = await this.databaseService.getBalance();
      this.recentTransactions = await this.databaseService.getTransactions();
      this.recentTransactions = this.recentTransactions.slice(0, 5);
    } catch (err) {
      console.warn('Dashboard: Using fallback loading due to:', err);
      this.error = err === 'timeout' ? 'Connecting to local storage...' : 'Database error.';
    } finally {
      await minWait;
      this.loading = false;
    }
  }
}
