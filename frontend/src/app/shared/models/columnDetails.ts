export interface ColumnDetails {
  id?: number;
  columnName: string;
  columnKey?: string;
  index: number;
}

export function mapToColumnDetails(column: ColumnDetailsDTO): ColumnDetails {
  return {
    id: column.id,
    columnName: column.columnName,
    index: column.index,
  };
}

// NOTE: to be removed after backend implementation
export interface ColumnDetailsDTO {
  id: number;
  columnName: string;
  index: number;
}
