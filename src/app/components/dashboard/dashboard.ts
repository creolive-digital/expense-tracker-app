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
    try {
      // Wait for database with a 5s timeout for web fallback
      await firstValueFrom(
        this.databaseService.isReady.pipe(
          filter(ready => ready),
          timeout(5000),
          catchError(() => {
            console.warn('Database initialization timed out. Using mock data for preview.');
            this.error = 'Database connection slow. Showing local preview.';
            return of(true);
          })
        )
      );
      
      this.balance = await this.databaseService.getBalance();
      this.recentTransactions = await this.databaseService.getTransactions();
      this.recentTransactions = this.recentTransactions.slice(0, 5);
    } catch (err) {
      this.error = 'Failed to load data.';
    } finally {
      this.loading = false;
    }
  }
}
