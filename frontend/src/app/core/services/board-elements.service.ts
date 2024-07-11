import { Injectable } from '@angular/core';

import { select, Store } from '@ngrx/store';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { AppState } from '../reducers';
import { selectUserWorkspaceId } from '../reducers/auth';

import { BaseHttpService } from './base-http.service';

import { CardDetails, CardDetailsDTO, mapToCardDetails } from '../../shared/models/card-details';
import { ColumnDetails, ColumnDetailsDTO, mapToColumnDetails } from '../../shared/models/columnDetails';

@Injectable({
  providedIn: 'root',
})
export class BoardElementsService {
  private boardElementPath: string;

  constructor(private baseHttp: BaseHttpService, private store: Store<AppState>) {
    this.store.pipe(select(selectUserWorkspaceId)).subscribe(workspaceId => {
      this.boardElementPath = `/workspaces/${workspaceId}/boardElement`; // fake value
    });
  }

  /** CARD CALLS */
  public getCards(): Observable<CardDetails[]> {
    return this.baseHttp.get<CardDetailsDTO[]>(this.boardElementPath).pipe(map((data: CardDetailsDTO[]) => data.map(card => mapToCardDetails(card))));
  }

  public postCard(cardToAdd: CardDetails): Observable<CardDetails> {
    return this.baseHttp
      .post<CardDetailsDTO>(this.boardElementPath, { payload: cardToAdd })
      .pipe(map((data: CardDetailsDTO) => mapToCardDetails(data)));
  }

  // May be changed related to backend models even the url
  public patchCard(cardToUpdate: CardDetails): Observable<CardDetails> {
    return this.baseHttp
      .patch<CardDetails>(this.boardElementPath, { payload: cardToUpdate })
      .pipe(map((data: CardDetailsDTO) => mapToCardDetails(data)));
  }

  // The url may be changed
  public deleteCard(id: number): Observable<string> {
    return this.baseHttp
      .delete<string>(this.boardElementPath, { urlParams: id + '' })
      .pipe(map((data: string) => data));
  }

  /** COLUMNS CALLS */
  public getProgressColumns(): Observable<ColumnDetails[]> {
    return this.baseHttp.get<ColumnDetailsDTO[]>(this.boardElementPath).pipe(map((data: ColumnDetailsDTO[]) => data.map(col => mapToColumnDetails(col))));
  }

  public postProgressColumns(columnToAdd: ColumnDetails): Observable<ColumnDetails> {
    return this.baseHttp
      .post<ColumnDetails>(this.boardElementPath, { payload: columnToAdd })
      .pipe(map((data: ColumnDetailsDTO) => mapToColumnDetails(data)));
  }

  //  The url may be changed
  public deleteColumn(id: number): Observable<string> {
    return this.baseHttp
      .delete<string>(this.boardElementPath, { urlParams: id + '' })
      .pipe(map((data: string) => data));
  }
}
