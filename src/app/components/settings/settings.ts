import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BackupService } from '../../services/backup';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './settings.html',
  styleUrls: ['./settings.css']
})
export class SettingsComponent implements OnInit {
  isLoggedIn = false;
  backupStatus = '';
  clientId = '';

  constructor(private backupService: BackupService) {}

  ngOnInit() {
    this.clientId = this.backupService.getClientId() || '';
    this.backupService.handleAuthCallback();
    this.isLoggedIn = this.backupService.isAuthenticated();
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
}
