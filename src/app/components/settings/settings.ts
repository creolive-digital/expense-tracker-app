import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BackupService } from '../../services/backup';
import { DatabaseService } from '../../services/database';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './settings.html',
  styleUrls: ['./settings.css']
})
export class SettingsComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  backupStatus = '';
  clientId = '';
  dbStatus = 'Checking...';
  private sub = new Subscription();

  constructor(
    private backupService: BackupService,
    private databaseService: DatabaseService
  ) {}

  ngOnInit() {
    this.clientId = this.backupService.getClientId() || '';
    this.backupService.handleAuthCallback();
    this.isLoggedIn = this.backupService.isAuthenticated();
    
    this.sub.add(this.databaseService.dbStatus.subscribe(status => {
      this.dbStatus = status;
    }));
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  saveClientId() {
    this.backupService.setClientId(this.clientId);
    alert('Client ID saved!');
  }

  login() {
    this.backupService.login();
  }

  async backup() {
    this.backupStatus = 'Backing up...';
    try {
      await this.backupService.backupDatabase();
      this.backupStatus = 'Backup successful!';
    } catch (err) {
      this.backupStatus = 'Backup failed: ' + (err as any).message;
    }
  }

  retryDb() {
    this.databaseService.initializePlugin();
  }
}
