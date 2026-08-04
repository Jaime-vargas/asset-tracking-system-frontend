import {Injectable, signal} from '@angular/core';
import {FileCategoryDto} from '../interfaces/file-category.dto';

@Injectable({providedIn: 'root'})
export class FileCategoryStore{

  // Signals
  public selectedCategory = signal<FileCategoryDto | null>(null);
  public formMode = signal<"add"|"edit">("add");

}
