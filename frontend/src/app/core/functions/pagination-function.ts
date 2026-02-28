import { computed, signal } from "@angular/core";

export function createPagination(initialLimit = 10) {
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
    setTotal: setTotalPages,
    setTotalItems
  };
}