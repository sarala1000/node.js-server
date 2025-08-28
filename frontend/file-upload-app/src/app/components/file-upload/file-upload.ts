import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { FileService } from '../../services/file';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './file-upload.html',
  styleUrl: './file-upload.scss'
})
export class FileUploadComponent {
  @Output() fileUploaded = new EventEmitter<void>();

  selectedFile: File | null = null;
  description: string = '';
  isDragging = false;
  isUploading = false;
  uploadProgress = 0;
  statusMessage = '';
  statusType: 'success' | 'error' | '' = '';

  constructor(private fileService: FileService) {}

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFileSelect(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      this.handleFileSelect(target.files[0]);
    }
  }

  private handleFileSelect(file: File): void {
    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      this.showStatus('File size exceeds 10MB limit', 'error');
      return;
    }

    this.selectedFile = file;
  }

  async uploadFile(): Promise<void> {
    if (!this.selectedFile) {
      this.showStatus('Please select a file first', 'error');
      return;
    }

    this.isUploading = true;
    this.uploadProgress = 0;

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        if (this.uploadProgress < 90) {
          this.uploadProgress += 10;
        }
      }, 100);

      const result = await firstValueFrom(this.fileService.uploadFile(this.selectedFile, this.description));
      
      clearInterval(progressInterval);
      this.uploadProgress = 100;

      this.showStatus('File uploaded successfully!', 'success');
      this.resetForm();
      this.fileUploaded.emit();

    } catch (error: any) {
      this.showStatus(error.error?.error || 'Upload failed', 'error');
    } finally {
      this.isUploading = false;
      setTimeout(() => {
        this.uploadProgress = 0;
      }, 2000);
    }
  }

  private resetForm(): void {
    this.selectedFile = null;
    this.description = '';
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  private showStatus(message: string, type: 'success' | 'error'): void {
    this.statusMessage = message;
    this.statusType = type;
    
    setTimeout(() => {
      this.statusMessage = '';
      this.statusType = '';
    }, 5000);
  }
}
