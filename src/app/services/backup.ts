import { Injectable } from '@angular/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BackupService {
  private scope = 'https://www.googleapis.com/auth/drive.file';
  private redirectUri = window.location.origin + '/settings';
  private accessToken: string | null = null;

  constructor(private http: HttpClient) {}

  getClientId(): string | null {
    return localStorage.getItem('google_client_id');
  }

  setClientId(id: string) {
    localStorage.setItem('google_client_id', id);
  }

  login() {
    const clientId = this.getClientId();
    if (!clientId) {
      alert('Please set your Google Client ID in Settings first.');
      return;
    }
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${this.redirectUri}&response_type=token&scope=${this.scope}`;
    window.location.href = authUrl;
  }

  handleAuthCallback() {
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      this.accessToken = params.get('access_token');
      if (this.accessToken) {
        localStorage.setItem('google_drive_token', this.accessToken);
        // Clear hash from URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } else {
      this.accessToken = localStorage.getItem('google_drive_token');
    }
  }

  async backupDatabase() {
    if (!this.accessToken) {
      throw new Error('Not authenticated with Google Drive');
    }

    try {
      // 1. Read the database file
      // Note: The path depends on the platform and how capacitor-sqlite stores it.
      // Usually it's in the 'Databases' folder in the app's internal storage.
      const dbName = 'expense_tracker_db';
      const fileName = `${dbName}SQLite.db`;
      
      const fileResult = await Filesystem.readFile({
        path: `Databases/${fileName}`,
        directory: Directory.Data
      });

      const blob = this.base64ToBlob(fileResult.data as string, 'application/x-sqlite3');

      // 2. Upload to Google Drive
      const metadata = {
        name: `expense_tracker_backup_${new Date().toISOString().substring(0, 10)}.sqlite`,
        mimeType: 'application/x-sqlite3'
      };

      const formData = new FormData();
      formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      formData.append('file', blob);

      const headers = new HttpHeaders({
        'Authorization': `Bearer ${this.accessToken}`
      });

      await firstValueFrom(this.http.post('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', formData, { headers }));
      
      return true;
    } catch (err) {
      console.error('Backup failed', err);
      throw err;
    }
  }

  private base64ToBlob(base64: string, type: string) {
    const binStr = atob(base64);
    const len = binStr.length;
    const arr = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      arr[i] = binStr.charCodeAt(i);
    }
    return new Blob([arr], { type });
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }
}
