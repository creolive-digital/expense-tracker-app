import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Transaction, Category, TransactionWithCategory } from '../models/transaction.model';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private sqlite: SQLiteConnection = new SQLiteConnection(CapacitorSQLite);
  private db!: SQLiteDBConnection;
  private dbName: string = 'expense_tracker_db';
  public isReady = new BehaviorSubject<boolean>(false);

  constructor() {}

  async initializePlugin() {
    console.log('DatabaseService: Initializing...');
    if (this.isReady.value) return;

    if (Capacitor.getPlatform() === 'web') {
      console.log('DatabaseService: Running on web, waiting for jeep-sqlite');
      try {
        await customElements.whenDefined('jeep-sqlite');
        await this.sqlite.initWebStore();
        console.log('DatabaseService: Web store initialized');
      } catch (err) {
        console.error('DatabaseService: Web store init failed', err);
      }
    }

    try {
      console.log('DatabaseService: Creating connection...');
      this.db = await this.sqlite.createConnection(this.dbName, false, 'no-encryption', 1, false);
      await this.db.open();
      console.log('DatabaseService: Connection opened');

      await this.createTables();
      await this.seedCategories();
      this.isReady.next(true);
      console.log('DatabaseService: Initialization complete');
    } catch (err) {
      console.error('Database initialization failed', err);
      // Even if it fails, we should signal "ready" so the UI can show with empty state
      // or we can handle the error in components
      this.isReady.next(false); 
    }
  }

  private async createTables() {
    const schema = `
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT,
        icon TEXT
      );
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        amount REAL NOT NULL,
        category_id INTEGER,
        description TEXT,
        date TEXT NOT NULL,
        FOREIGN KEY (category_id) REFERENCES categories (id)
      );
    `;
    await this.db.execute(schema);
  }

  private async seedCategories() {
    const result = await this.db.query('SELECT COUNT(*) as count FROM categories');
    if (result.values && result.values[0].count === 0) {
      const defaultCategories = [
        { name: 'Food', type: 'debit', icon: 'fast-food' },
        { name: 'Transport', type: 'debit', icon: 'bus' },
        { name: 'Salary', type: 'credit', icon: 'cash' },
        { name: 'Shopping', type: 'debit', icon: 'cart' },
        { name: 'Entertainment', type: 'debit', icon: 'film' },
        { name: 'Other', type: 'debit', icon: 'help' }
      ];

      for (const cat of defaultCategories) {
        await this.db.run('INSERT INTO categories (name, type, icon) VALUES (?, ?, ?)', [cat.name, cat.type, cat.icon]);
      }
    }
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    if (!this.db) return [];
    const result = await this.db.query('SELECT * FROM categories');
    return result.values as Category[];
  }

  // Transactions
  async addTransaction(transaction: Transaction) {
    if (!this.db) return;
    const sql = 'INSERT INTO transactions (type, amount, category_id, description, date) VALUES (?, ?, ?, ?, ?)';
    const params = [transaction.type, transaction.amount, transaction.category_id, transaction.description, transaction.date];
    await this.db.run(sql, params);
  }

  async getTransactions(filters: {
    type?: string;
    categoryId?: number;
    startDate?: string;
    endDate?: string;
  } = {}): Promise<TransactionWithCategory[]> {
    if (!this.db) return [];
    
    let sql = `
      SELECT t.*, c.name as category_name, c.icon as category_icon 
      FROM transactions t 
      LEFT JOIN categories c ON t.category_id = c.id 
      WHERE 1=1
    `;
    const params: any[] = [];

    if (filters.type) {
      sql += ' AND t.type = ?';
      params.push(filters.type);
    }
    if (filters.categoryId) {
      sql += ' AND t.category_id = ?';
      params.push(filters.categoryId);
    }
    if (filters.startDate) {
      sql += ' AND t.date >= ?';
      params.push(filters.startDate);
    }
    if (filters.endDate) {
      sql += ' AND t.date <= ?';
      params.push(filters.endDate);
    }

    sql += ' ORDER BY t.date DESC';

    const result = await this.db.query(sql, params);
    return result.values as TransactionWithCategory[];
  }

  async getBalance() {
    if (!this.db) return { credit: 0, debit: 0, balance: 0 };
    
    const sql = 'SELECT type, SUM(amount) as total FROM transactions GROUP BY type';
    const result = await this.db.query(sql);
    let credit = 0;
    let debit = 0;
    
    if (result.values) {
      result.values.forEach((row: any) => {
        if (row.type === 'credit') credit = row.total;
        if (row.type === 'debit') debit = row.total;
      });
    }

    return { credit, debit, balance: credit - debit };
  }

  async deleteTransaction(id: number) {
    if (!this.db) return;
    await this.db.run('DELETE FROM transactions WHERE id = ?', [id]);
  }
}
