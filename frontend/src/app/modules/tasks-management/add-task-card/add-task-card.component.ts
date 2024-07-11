import { AfterViewInit, Component } from '@angular/core';

@Component({
  selector: 'app-add-task-card',
  templateUrl: './add-task-card.component.html',
  styleUrls: ['./add-task-card.component.scss'],
})
export class AddTaskCardComponent implements AfterViewInit {
  // @Input() buttons: Button[];
  // @Input() typeData: string[];
  // @Input() statusData: string[];
  // @Input() projectData: string[];
  // @Input() cardData: CardDetails;
  // @Input() priorityData: string[];
  // @Input() assigneeData: string[];
  // @Input() kanban: KanbanComponent;

  constructor() {}

  ngAfterViewInit(): void {
    // if (this.kanban) {
    //   this.kanban.dialogModule.dialogObj.header =
    //     this.buttons && this.buttons.length === 2 ? this.translate.instant('TASKS_VIEW.CARD_DIALOG.ADD_CARD') : this.translate.instant('TASKS_VIEW.CARD_DIALOG.EDIT_CARD');
    // }
    // if (this.buttons && this.buttons.length) {
    //   this.buttons.forEach(btn => {
    //     btn.element.setAttribute('data-pw', btn.content.toLowerCase());
    //     btn.content =
    //       btn.content === DialogProperties.Save
    //         ? this.translate.instant(DialogProperties.TranslatedSave)
    //         : btn.content === DialogProperties.Cancel
    //         ? this.translate.instant(DialogProperties.TranslatedCancel)
    //         : this.translate.instant(DialogProperties.TranslatedDelete);
    //   });
    // }
  }
}
