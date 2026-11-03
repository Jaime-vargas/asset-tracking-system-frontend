import { Component, computed, input, output } from '@angular/core';
@Component({
  selector: 'app-list-pagination',
  template: `@if (total() > pageSize()) {
    <nav aria-label="List pagination">
      <span>{{ start() }}–{{ end() }} of {{ total() }}</span>
      <div>
        <button
          type="button"
          [disabled]="page() <= 1"
          (click)="pageChange.emit(page() - 1)"
          aria-label="Previous page"
        >
          ←
        </button>
        <span>{{ page() }} / {{ pages() }}</span
        ><button
          type="button"
          [disabled]="page() >= pages()"
          (click)="pageChange.emit(page() + 1)"
          aria-label="Next page"
        >
          →
        </button>
      </div>
    </nav>
  }`,
  styles: `
    nav,
    nav div {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    nav {
      justify-content: space-between;
      padding-top: 20px;
      color: var(--app-muted);
      font-size: 13px;
    }
    button {
      width: 34px;
      height: 34px;
      background: white;
      border: 1px solid var(--app-border);
      border-radius: 9px;
      cursor: pointer;
      color: var(--app-accent);
    }
    button:disabled {
      opacity: 0.4;
      cursor: default;
    }
    button:focus-visible {
      outline: 3px solid #749ee9;
      outline-offset: 2px;
    }
  `,
})
export class ListPagination {
  total = input.required<number>();
  page = input.required<number>();
  pageSize = input.required<number>();
  pageChange = output<number>();
  pages = computed(() => Math.max(1, Math.ceil(this.total() / this.pageSize())));
  start = computed(() => (this.page() - 1) * this.pageSize() + 1);
  end = computed(() => Math.min(this.page() * this.pageSize(), this.total()));
}
