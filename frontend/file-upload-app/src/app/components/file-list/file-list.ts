import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileService } from '../../services/file';
import { File } from '../../models/file';

@Component({
  selector: 'app-file-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './file-list.html',
  styleUrl: './file-list.scss'
})
export class FileListComponent implements OnInit {
  files: File[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(private fileService: FileService) {}

  ngOnInit(): void {
    this.loadFiles();
  }

  loadFiles(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.fileService.getFiles().subscribe({
      next: (files) => {
        console.log('Files received from backend:', files.map(f => ({ id: f.id, filename: f.filename })));
        this.files = files;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Error loading files';
        this.isLoading = false;
        console.error('Error loading files:', error);
      }
    });
  }

  deleteFile(fileId: string): void {
    console.log('Attempting to delete file with ID:', fileId);
    if (!confirm('Are you sure you want to delete this file?')) {
      return;
    }

    this.fileService.deleteFile(fileId).subscribe({
      next: () => {
        this.loadFiles(); // Reload the list
      },
      error: (error) => {
        console.error('Error deleting file:', error);
        alert('Error deleting file');
      }
    });
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  downloadFile(fileId: string): void {
    this.fileService.downloadFile(fileId).subscribe({
      next: (blob) => {
        // Find the file to get its name
        const file = this.files.find(f => f.id === fileId);
        const fileName = file ? file.filename : 'download';
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error downloading file:', error);
        alert('Error downloading file');
      }
    });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
}
