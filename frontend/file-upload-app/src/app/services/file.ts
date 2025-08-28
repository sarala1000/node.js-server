import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { File } from '../models/file';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  // Get all files
  getFiles(): Observable<File[]> {
    return this.http.get<File[]>(`${this.apiUrl}/files`);
  }

  // Get single file
  getFile(id: string): Observable<File> {
    return this.http.get<File>(`${this.apiUrl}/files/${id}`);
  }

  // Upload file
  uploadFile(file: any, description: string, replace: boolean = false): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('description', description);
    formData.append('replace', replace.toString());
    
    return this.http.post(`${this.apiUrl}/upload`, formData);
  }

  // Delete file
  deleteFile(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/files/${id}`);
  }

  // Download file
  downloadFile(id: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/files/${id}/download`, { responseType: 'blob' });
  }

  // Check API health
  checkHealth(): Observable<any> {
    return this.http.get(`${this.apiUrl}/health`);
  }
}
