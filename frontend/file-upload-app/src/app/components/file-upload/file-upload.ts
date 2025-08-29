import { Component, EventEmitter, Output, ChangeDetectorRef, OnInit, NgZone, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { FileService } from '../../services/file';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './file-upload.html',
  styleUrl: './file-upload.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileUploadComponent implements OnInit {
  @Output() fileUploaded = new EventEmitter<void>();

  selectedFile: File | null = null;
  description: string = '';
  isDragging = false;
  isUploading = false;
  uploadProgress = 0;
  statusMessage = '';
  statusType: 'success' | 'error' | '' = '';
  showDuplicateDialog = false;
  duplicateFileName = '';

  constructor(private fileService: FileService, private cdr: ChangeDetectorRef, private ngZone: NgZone) {}

  ngOnInit(): void {
    console.log('FileUploadComponent initialized');
  }

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
    console.log('File selected:', file.name, file.size);
    
    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      this.showStatus('File size exceeds 10MB limit', 'error');
      return;
    }

    this.selectedFile = file;
    console.log('Selected file set to:', this.selectedFile?.name);
    
    // Force change detection immediately - NO DELAY!
    this.cdr.detectChanges();
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

      // Check if the response indicates a duplicate file
      if (result.message && result.message.includes('already exists')) {
        this.duplicateFileName = this.selectedFile.name;
        this.showDuplicateDialog = true;
        this.isUploading = false;
        this.uploadProgress = 0;
        this.cdr.markForCheck();
        return;
      }

      this.showStatus('File uploaded successfully!', 'success');
      this.resetForm();
      this.fileUploaded.emit();
      console.log('File upload completed, emitting event');

    } catch (error: any) {
      // Check if it's a duplicate file error
      if (error.error?.error && error.error.error.includes('already exists')) {
        this.duplicateFileName = this.selectedFile.name;
        this.showDuplicateDialog = true;
        this.isUploading = false;
        this.uploadProgress = 0;
        this.cdr.markForCheck();
        return;
      }
      
      this.showStatus(error.error?.error || 'Upload failed', 'error');
    } finally {
      this.isUploading = false;
      setTimeout(() => {
        this.uploadProgress = 0;
      }, 2000);
    }
  }

  async replaceFile(): Promise<void> {
    this.showDuplicateDialog = false;
    this.isUploading = true;
    this.uploadProgress = 0;

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        if (this.uploadProgress < 90) {
          this.uploadProgress += 10;
        }
      }, 100);

      // Add a flag to indicate replacement
      const result = await firstValueFrom(this.fileService.uploadFile(this.selectedFile, this.description, true));
      
      clearInterval(progressInterval);
      this.uploadProgress = 100;

      this.showStatus('File replaced successfully!', 'success');
      this.resetForm();
      this.fileUploaded.emit();
      console.log('File replace completed, emitting event');

    } catch (error: any) {
      this.showStatus(error.error?.error || 'Replace failed', 'error');
    } finally {
      this.isUploading = false;
      setTimeout(() => {
        this.uploadProgress = 0;
      }, 2000);
    }
  }

  cancelReplace(): void {
    this.showDuplicateDialog = false;
    this.duplicateFileName = '';
    this.resetForm();
    this.cdr.markForCheck();
    console.log('File upload cancelled');
  }

  private resetForm(): void {
    this.selectedFile = null;
    this.description = '';
    this.cdr.markForCheck();
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  private showStatus(message: string, type: 'success' | 'error'): void {
    this.statusMessage = message;
    this.statusType = type;
    this.cdr.markForCheck();
    
    setTimeout(() => {
      this.statusMessage = '';
      this.statusType = '';
      this.cdr.markForCheck();
    }, 5000);
  }
}
