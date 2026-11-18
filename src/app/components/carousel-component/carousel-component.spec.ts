import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { FileEntityDto } from '../../interfaces/fileEntityDto';
import { CarouselComponent } from './carousel-component';

describe('Report evidence gallery', () => {
  it('renders the stored photo URLs as image sources for closed reports', async () => {
    await TestBed.configureTestingModule({ imports: [CarouselComponent] }).compileComponents();
    const fixture = TestBed.createComponent(CarouselComponent);
    const paths = ['/uploads/Reports/Report-2/IDF___2_.jpg', '/uploads/Reports/Report-2/IDF___3_.jpg'];
    fixture.componentRef.setInput('images', paths.map((filePath, id) => ({
      id, filePath, filename: filePath.split('/').pop(),
    })) as FileEntityDto[]);
    fixture.detectChanges();

    const gallery = fixture.nativeElement.querySelector('.evidence-gallery') as HTMLElement;
    expect(Array.from(gallery.querySelectorAll('img'), image => image.getAttribute('src'))).toEqual(paths);
    expect(gallery.querySelectorAll('.evidence-preview')).toHaveLength(2);
    expect(gallery.querySelector('.evidence-delete')).toBeNull();
  });
});
