import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconModule } from '@angular/material/icon';

import { TranslateModule } from '@ngx-translate/core';

import { SelectItemComponent } from './select-item.component';
import { SearchFilterPipe } from '../../custom-pipes/search-filter.pipe';
import { AngularMaterialModule } from '../../angular-material/angular-material.module';

describe('SelectItemComponent', () => {
  // tslint:disable:no-any
  let component: SelectItemComponent<any>;
  let fixture: ComponentFixture<SelectItemComponent<any>>;

  let mockList = [
    { id: 1, customerId: 2, name: 'first name', description: 'first description', isActive: true },
    { id: 2, customerId: 1, name: 'second name', description: 'second description', isActive: true },
  ];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [AngularMaterialModule, BrowserAnimationsModule, TranslateModule.forRoot(), FormsModule, MatIconModule],
      declarations: [SelectItemComponent, SearchFilterPipe],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectItemComponent);
    component = fixture.componentInstance;
    component.list = mockList;
    component.searchKey = 'n';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display items list according to search-key', () => {
    const searchFormField = fixture.debugElement.query(By.css('.search-form-field'));
    const searchInput = fixture.debugElement.query(By.css('[name="searchKey"]'));

    expect(searchFormField).toBeTruthy();
    expect(searchFormField.attributes.floatLabel).toEqual('never');

    searchInput.nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(searchInput).toBeTruthy();
    expect(searchInput.attributes.autocomplete).toEqual('off');
    expect(searchInput.attributes.placeholder).toEqual('TIME_TRACKER_VIEW.PROJECT_LIST.FILTER');
    expect(searchInput.properties.type).toEqual('text');

    searchInput.nativeElement.value = 'new';
    searchInput.nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(component.searchKey).toEqual('new');

    mockList = [
      { id: 1, customerId: 2, name: 'first new name', description: 'first description', isActive: true },
      { id: 1, customerId: 2, name: 'first without name', description: 'first description', isActive: true },
      { id: 2, customerId: 1, name: 'second new name', description: 'second description', isActive: true },
      { id: 2, customerId: 1, name: 'second without name', description: 'second description', isActive: true },
    ];
    component.list = mockList;
    searchInput.nativeElement.value = 'without';
    searchInput.nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const viewport = fixture.debugElement.query(By.css('.items-viewport'));
    expect(viewport.attributes.itemSize).toEqual('5');

    let panels = fixture.debugElement.queryAll(By.css('.list-panel'));
    expect(panels.length).toEqual(2);
    expect(panels[0].query(By.css('span')).nativeElement.textContent).toEqual('first without name');
    expect(panels[1].query(By.css('span')).nativeElement.textContent).toEqual('second without name');

    searchInput.nativeElement.value = 'new';
    searchInput.nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    panels = fixture.debugElement.queryAll(By.css('.list-panel'));
    expect(panels.length).toEqual(2);
    expect(panels[0].query(By.css('span')).nativeElement.textContent).toEqual('first new name');
    expect(panels[1].query(By.css('span')).nativeElement.textContent).toEqual('second new name');
  });

  it('should display no data when list is null, undefined or empty', () => {
    mockList = null;
    component.list = mockList;
    fixture.detectChanges();
    let noDataSpan = fixture.debugElement.query(By.css('.no-data-span span'));

    expect(noDataSpan).toBeTruthy();
    expect(noDataSpan.nativeElement.textContent).toEqual('TIME_TRACKER_VIEW.PROJECT_LIST.NO_DATA..');

    mockList = [];
    component.list = mockList;
    fixture.detectChanges();

    noDataSpan = fixture.debugElement.query(By.css('.no-data-span span'));
    expect(noDataSpan).toBeTruthy();

    mockList = [
      { id: 1, customerId: 2, name: 'first name', description: 'first description', isActive: true },
      { id: 2, customerId: 1, name: 'second name', description: 'second description', isActive: true },
    ];
    component.list = mockList;
    fixture.detectChanges();

    noDataSpan = fixture.debugElement.query(By.css('.no-data-span span'));
    expect(noDataSpan).toBeNull();
  });

  it('should emit the selected item', () => {
    mockList = [
      { id: 1, customerId: 2, name: 'first name', description: 'first description', isActive: true },
      { id: 2, customerId: 1, name: 'second name', description: 'second description', isActive: true },
    ];
    component.list = mockList;
    fixture.detectChanges();
    const listPanel = fixture.debugElement.queryAll(By.css('.list-panel'));
    const listPanelItems = fixture.debugElement.queryAll(By.css('.list-panel a span'));
    const spyOnSelectItem = spyOn(component, 'selectItem');

    expect(listPanel.length).toEqual(2);
    expect(listPanelItems.length).toEqual(2);
    expect(listPanelItems[0].nativeElement.innerText).toEqual('first name');
    expect(listPanelItems[1].nativeElement.innerText).toEqual('second name');

    listPanelItems[0].nativeElement.dispatchEvent(new Event('click'));
    fixture.detectChanges();
    expect(spyOnSelectItem).toHaveBeenCalledWith(mockList[0].id);

    listPanelItems[1].nativeElement.dispatchEvent(new Event('click'));
    fixture.detectChanges();
    expect(spyOnSelectItem).toHaveBeenCalledWith(mockList[1].id);
  });
});
