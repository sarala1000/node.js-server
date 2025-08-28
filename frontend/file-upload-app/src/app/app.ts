import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileUploadComponent } from './components/file-upload/file-upload';
import { FileListComponent } from './components/file-list/file-list';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FileUploadComponent, FileListComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  title = 'file-upload-app';
  
  @ViewChild(FileListComponent) fileListComponent!: FileListComponent;

  onFileUploaded(): void {
    // Reload the file list when a file is uploaded successfully
    if (this.fileListComponent) {
      this.fileListComponent.loadFiles();
    }
  }
}
