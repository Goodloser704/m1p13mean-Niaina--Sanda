import { computed, Signal, signal, WritableSignal } from "@angular/core";

export interface PaginationType {
  currentPage: WritableSignal<number>,
  totalPages: WritableSignal<number>,
  totalItems: WritableSignal<number>,
  limit: number,
  pagesArray: Signal<number[]>,
  next: () => void,
  previous: () => void,
  goTo: (page: number) => void,
  setTotalPages: (totalPages: number) => void
  setTotalItems: (totalItems: number) => void
}

export function createPagination(initialLimit = 10): PaginationType {
  const currentPage = signal(1);
  const totalPages = signal(1);
  const totalItems = signal(0);
  const limit = initialLimit;
  const pagesArray = computed(() => Array.from({ length: totalPages() }, (_, i) => i + 1));

  function next() {
    if (currentPage() < totalPages()) {
      currentPage.set(currentPage() + 1);
    }
  }

  function previous() {
    if (currentPage() > 1) {
      currentPage.set(currentPage() - 1);
    }
  }

  function goTo(page: number) {
    if (page >= 1 && page <= totalPages()) {
      currentPage.set(page);
    }
  }

  function setTotalPages(total: number) {
    totalPages.set(total);
  }

  function setTotalItems(total: number) {
    totalItems.set(total);
  }

  return {
    currentPage,
    totalPages,
    totalItems,
    limit,
    pagesArray,
    next,
    previous,
    goTo,
    setTotalPages,
    setTotalItems
  };
}