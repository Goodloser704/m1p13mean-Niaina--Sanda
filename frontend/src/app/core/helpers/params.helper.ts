import { HttpParams } from "@angular/common/http";

export function buildQueryParams(params?: any) {
  let httpParams = new HttpParams();

  if (!params) return httpParams;

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      httpParams = httpParams.set(key, value.toString());
    }
  });

  return httpParams;
}