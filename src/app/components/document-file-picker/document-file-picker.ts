import { Component, input, output, signal } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconDirective } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-document-file-picker',
  imports: [NzButtonModule, NzIconDirective],
  templateUrl: './document-file-picker.html',
  styleUrl: './document-file-picker.css',
})
export class DocumentFilePicker {
  file = input<File | null>(null);
  disabled = input(false);
  label = input('Document file');
  extension = input('');
  fileChange = output<File | null>();
  dragging = signal(false);
  error = signal('');
  dragOver(event: DragEvent) {
    event.preventDefault();
    if (this.disabled()) return;
    this.dragging.set(true);
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
  }
  dragLeave(event: DragEvent) {
    if (!(event.relatedTarget instanceof Node) || !(event.currentTarget as HTMLElement).contains(event.relatedTarget)) this.dragging.set(false);
  }
  drop(event: DragEvent) {
    event.preventDefault();
    this.dragging.set(false);
    if (!this.disabled()) this.choose(event.dataTransfer?.files ?? null);
  }
  select(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!this.disabled()) this.choose(input.files);
    input.value = '';
  }
  private choose(files: FileList | null) {
    if (!files?.length) return;
    if (files.length !== 1) { this.error.set('Choose one file at a time.'); return; }
    const file = files[0];
    const extension = this.extension();
    if (extension && !file.name.toLowerCase().endsWith(extension)) {
      this.error.set('Choose a file ending in ' + extension + '.');
      this.fileChange.emit(null);
      return;
    }
    this.error.set('');
    this.fileChange.emit(file);
  }
}
