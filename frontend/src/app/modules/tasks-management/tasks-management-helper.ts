import * as lodash from 'lodash';
import { Observable } from 'rxjs';
import { ColumnsModel } from '@syncfusion/ej2-angular-kanban';

import { ColumnDetails } from '../../shared/models/columnDetails';
import { ProgressColumn } from '../../shared/enum/column-header.enum';

export function getStateColumnModel(list: ColumnDetails[], columns: ColumnsModel[]): ColumnsModel[] {
  return lodash.differenceBy(
    columns,
    list.map(item => ({ headerText: item.columnName })),
    'headerText',
  );
}

export function createObservable(list: ColumnsModel[], columnList: ColumnDetails[], template: string): Observable<ColumnsModel[]> {
  list.push(
    ...columnList.map(column => ({
      headerText: column.columnName,
      keyField: ProgressColumn.getCorrespondingKey(column.columnName),
      allowToggle: true,
      isExpanded: true,
      template: template,
    })),
  );

  return new Observable(observer => {
    observer.next(list);
    observer.complete();
  });
}
