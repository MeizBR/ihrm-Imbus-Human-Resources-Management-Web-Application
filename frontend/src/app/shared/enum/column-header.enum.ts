import { ColumnDetails } from '../models/columnDetails';

export enum ColumnHeaderKey {
  Open = 'Open',
  InProgress = 'InProgress',
  Review = 'Review',
  Close = 'Close',
  Other = 'Other',
}

export enum ColumnHeaderText {
  ToDo = 'ToDo',
  InProgress = 'InProgress',
  InReview = 'InReview',
  Done = 'Done',
  Other = 'Other',
}

// NOTE: it's better to export a namespace which contains all column details (column name, column id, column text....)
export namespace ProgressColumn {
  export const getColumnHeaderTextValues = () => [ColumnHeaderText.ToDo, ColumnHeaderText.InProgress, ColumnHeaderText.InReview, ColumnHeaderText.Done, ColumnHeaderText.Other];
  export const getColumnHeaderKeyValues = () => [ColumnHeaderKey.Open, ColumnHeaderKey.InProgress, ColumnHeaderKey.Review, ColumnHeaderKey.Close, ColumnHeaderKey.Other];

  export function columnHeaderTextToString(col: ColumnHeaderText): string {
    switch (col) {
      case ColumnHeaderText.ToDo:
        return 'To Do';

      case ColumnHeaderText.InProgress:
        return 'In Progress';

      case ColumnHeaderText.InReview:
        return 'In Review';

      case ColumnHeaderText.Done:
        return 'Done';

      case ColumnHeaderText.Other:
        return 'Other';

      default:
        return 'Other';
    }
  }

  export function getCorrespondingKey(colName: string): ColumnHeaderKey {
    switch (colName) {
      case 'To Do':
        return ColumnHeaderKey.Open;

      case 'In Progress':
        return ColumnHeaderKey.InProgress;

      case 'In Review':
        return ColumnHeaderKey.Review;

      case 'Done':
        return ColumnHeaderKey.Close;

      case 'Other':
        return ColumnHeaderKey.Other;

      default:
        return undefined;
    }
  }

  export function getColumns(): ColumnDetails[] {
    const columnsToAdd: ColumnDetails[] = [];
    ProgressColumn.getColumnHeaderTextValues().forEach(headerText => {
      switch (headerText) {
        case 'ToDo':
          columnsToAdd.push({ columnName: ProgressColumn.columnHeaderTextToString(headerText), index: 0 });
          break;

        case 'InProgress':
          columnsToAdd.push({ columnName: ProgressColumn.columnHeaderTextToString(headerText), index: 1 });
          break;

        case 'InReview':
          columnsToAdd.push({ columnName: ProgressColumn.columnHeaderTextToString(headerText), index: 2 });
          break;

        case 'Done':
          columnsToAdd.push({ columnName: ProgressColumn.columnHeaderTextToString(headerText), index: 3 });
          break;

        default:
          break;
      }
    });

    return columnsToAdd;
  }
}
