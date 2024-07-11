import { Pipe, PipeTransform } from '@angular/core';
import { ProjectDetails } from '../models/project-models/project-models-index';

@Pipe({
  name: 'searchFilter',
})
export class SearchFilterPipe implements PipeTransform {
  // tslint:disable:no-any
  transform(list: any[], filterText: string): any[] {
    type isProject = ProjectDetails; /// !!!!
    if (!list) {
      return [];
    }
    if (!filterText) {
      return list;
    }
    filterText = filterText.toLocaleLowerCase();

    return list.filter(it => {
      if (it as isProject) {
        return (it as isProject).name.toLocaleLowerCase().includes(filterText);
      }
    });
  }
}
