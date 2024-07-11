import { MatDialog } from '@angular/material/dialog';
import { Component, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'app-task-management',
  templateUrl: './task-management.component.html',
  styleUrls: ['./task-management.component.scss'],
})
export class TaskManagementComponent implements OnInit, OnDestroy {
  // @ViewChild('template') template: string;
  // @ViewChild('kanbanObj') kanbanObj: KanbanComponent;

  // private columnsList: ColumnsModel[] = [];
  // private subscriptions: Subscription[] = [];
  // private columnList: ColumnDetails[];

  // public columns: ColumnsModel[] = [
  //   { headerText: ProgressColumn.columnHeaderTextToString(ColumnHeaderText.ToDo), keyField: ColumnHeaderKey.Open, allowToggle: true, template: this.template },
  //   { headerText: ProgressColumn.columnHeaderTextToString(ColumnHeaderText.InProgress), keyField: ColumnHeaderKey.InProgress, allowToggle: true, template: this.template },
  //   { headerText: ProgressColumn.columnHeaderTextToString(ColumnHeaderText.InReview), keyField: ColumnHeaderKey.Review, allowToggle: true, template: this.template },
  //   { headerText: ProgressColumn.columnHeaderTextToString(ColumnHeaderText.Done), keyField: ColumnHeaderKey.Close, allowToggle: true, template: this.template },
  // ];
  // public cardSettings: CardSettingsModel = {
  //   contentField: CardSettings.Summary,
  //   headerField: CardSettings.Id,
  //   tagsField: CardSettings.Tags,
  //   grabberField: CardSettings.Color,
  //   footerCssField: CardSettings.ClassName,
  // };
  // public dataManager: DataManager;
  // public ProgressColumn = ProgressColumn;
  // public columns$: Observable<ColumnsModel[]> = new Observable();
  // public swimlaneSettings: SwimlaneSettingsModel = { keyField: 'Type' };
  // public kanbanData: Object[] = extend([], kanbanData, null, true) as Object[];
  // public dialogSettings: DialogSettingsModel = { model: { allowDragging: true, width: '500px', enableResize: true, closeOnEscape: true } };
  // public statusData: string[] = Object.values(CardStatus);
  // public PrioritySpace = PrioritySpace;
  // public CardTypeSpace = CardTypeSpace;
  // public assigneeData: string[] = ['Nancy Davloio', 'Andrew Fuller', 'Janet Leverling', 'Steven walker', 'Robert King', 'Margaret hamilt', 'Michael Suyama'];
  // public projectData: string[] = ['Project 1', 'Project 2', 'Project 3', 'Project 4', 'Project 5', 'Project 6'];

  constructor(public dialog: MatDialog) {
    // this.kanbanData.forEach((card: CardDetails) => {
    //   this.store.dispatch(tasksActions.addTaskAction({ task: card }));
    // });
    // this.columnList = ProgressColumn.getColumns();
    // this.columnList.forEach(column => this.store.dispatch(tasksActions.addProgressColumnAction({ progressColumn: column })));
  }

  ngOnInit(): void {
    // this.subscriptions.push(
    //   this.store.pipe(select(selectTasks)).subscribe(tasks => {
    //     this.dataManager = new DataManager(tasks);
    //   }),
    // );
    // this.columnList = [];
    // this.subscriptions.push(
    //   this.store.pipe(select(selectColumns)).subscribe((columns: ColumnDetails[]) => {
    //     this.columnList = columns;
    //   }),
    // );
    // this.columns$ = createObservable(this.columnsList, this.columnList, this.template);
  }

  ngOnDestroy(): void {
    // this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // public onAddCard(): void {
  //   this.kanbanObj.openDialog('Add', { Id: getNextId(this.kanbanObj.kanbanData) });
  // }

  // public onAddColumn(): void {
  //   this.columnList = [];
  //   const headerText = [];
  //   const title = DialogProperties.TranslatedColumnTitle;
  //   this.subscriptions.push(
  //     this.columns$.subscribe({
  //       next(columns: ColumnsModel[]): void {
  //         this.columnsList = columns;
  //       },
  //     }),
  //   );

  //   this.columnsList.forEach(column => {
  //     headerText.push(column.headerText);
  //   });
  //   const columnHeaderText = lodash.difference(
  //     this.ProgressColumn.getColumnHeaderTextValues().map(col => this.ProgressColumn.columnHeaderTextToString(col)),
  //     headerText,
  //   );
  //   if (columnHeaderText.length !== 0) {
  //     const dialogRef = KanbanColumnDialogConfig(this.dialog, title, columnForm, headerText, initializeColumnFormGroup);
  //     dialogRef.componentInstance.onSubmitItem.subscribe(data => {
  //       if (data.key && data.key !== undefined && data.form.columnName && data.form.index !== undefined) {
  //         const columnToAdd: ColumnDetails = { columnName: data.form.columnName, index: data.form.index };
  //         this.store.dispatch(tasksActions.addProgressColumnAction({ progressColumn: columnToAdd }));
  //         this.subscriptions.push(
  //           this.store.pipe(select(selectColumns)).subscribe((columns: ColumnDetails[]) => {
  //             this.columnList = columns;
  //           }),
  //         );

  //         this.columnList.forEach((column: ColumnDetails) => {
  //           const columnToDisplay: ColumnsModel = {
  //             headerText: column.columnName,
  //             keyField: ProgressColumn.getCorrespondingKey(column.columnName),
  //             allowToggle: true,
  //             isExpanded: true,
  //             template: this.template,
  //           };
  //           if (!this.columnsList.find((columnModel: ColumnsModel) => columnModel.keyField === columnToDisplay.keyField)) {
  //             this.kanbanObj.addColumn(columnToDisplay, column.index);
  //             this.columnsList.splice(column && column.index && column.index, 0, columnToDisplay);
  //             this.statusData.push(data.key);
  //           }
  //         });
  //       }
  //     });
  //   } else {
  //     const data: ConfirmDialogModel = { title: '', message: 'No more columns to add' };
  //     this.dialog.open(WarningDialogComponent, { maxWidth: '400px', data });
  //   }
  // }

  // public onDeleteColumn(key: string): void {
  //   this.subscriptions.push(
  //     this.columns$.subscribe({
  //       next(columns: ColumnsModel[]): void {
  //         this.columnsList = columns;
  //       },
  //     }),
  //   );
  //   const elementIndex = this.columnsList.findIndex(column => column.keyField === key);
  //   this.store.dispatch(tasksActions.deleteProgressColumnAction({ index: elementIndex }));
  //   this.subscriptions.push(
  //     this.store.pipe(select(selectColumns)).subscribe((stateColumns: ColumnDetails[]) => {
  //       this.columnList = stateColumns;
  //     }),
  //   );
  //   const elementToDelete = getStateColumnModel(this.columnList, this.columnsList);
  //   if (elementToDelete) {
  //     this.columnsList = this.columnsList.filter(col => col.keyField !== elementToDelete[0].keyField);
  //     this.kanbanObj.deleteColumn(elementIndex);
  //   }
  // }

  // public onActionBegin(event: ActionEventArgs): void {
  //   switch (event.requestType) {
  //     case 'cardCreate':
  //       event.cancel = true;
  //       const cardToCreate = event.addedRecords[0] as CardDetails;
  //       this.store.dispatch(tasksActions.addTaskAction({ task: cardToCreate }));
  //       break;

  //     case 'cardChange':
  //       event.cancel = true;
  //       const cardToUpdate = event.changedRecords[0] as CardDetails;
  //       this.store.dispatch(tasksActions.updateTaskAction({ task: cardToUpdate }));
  //       break;

  //     case 'cardRemove':
  //       event.cancel = true;
  //       const cardToRemove = event.deletedRecords[0] as CardDetails;
  //       this.store.dispatch(tasksActions.deleteTaskAction({ task: cardToRemove }));
  //       break;

  //     default:
  //       break;
  //   }
  // }
}
