import { signal } from "@angular/core";

export function createPagination(initialLimit = 10) {
  const currentPage = signal(1);
  const totalPages = signal(1);
  const limit = initialLimit;

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

  function setTotal(total: number) {
    totalPages.set(total);
  }

  return {
    currentPage,
    totalPages,
    limit,
    next,
    previous,
    goTo,
    setTotal
  };
}