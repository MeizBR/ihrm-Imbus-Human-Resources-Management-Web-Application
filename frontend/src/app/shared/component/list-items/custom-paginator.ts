import { MatPaginatorIntl } from '@angular/material/paginator';
import { TranslateService } from '@ngx-translate/core';

export function CustomPaginator(translate: TranslateService): MatPaginatorIntl {
  const customPaginatorIntl = new MatPaginatorIntl();
  translate.get('PAGINATION.PAGE_LABEL').subscribe((text: string) => {
    customPaginatorIntl.itemsPerPageLabel = text;
  });

  return customPaginatorIntl;
}
