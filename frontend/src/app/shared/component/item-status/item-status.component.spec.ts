import { By } from '@angular/platform-browser';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemStatusComponent } from './item-status.component';

describe('ItemStatusComponent', () => {
  let component: ItemStatusComponent;
  let fixture: ComponentFixture<ItemStatusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ItemStatusComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemStatusComponent);
    component = fixture.componentInstance;
    component.item = 'Text';
    component.isActiveItem = true;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the active or active item correctly', () => {
    let inactiveItem = fixture.debugElement.query(By.css('.item-status-section'));
    expect(inactiveItem.classes['inactive-item']).toBeFalsy();

    const inactiveItemSpan = fixture.debugElement.query(By.css('.item-status-section span'));
    expect(inactiveItemSpan).toBeTruthy();
    expect(inactiveItemSpan.nativeElement.textContent).toEqual('Text');

    let inactiveItemIcon = fixture.debugElement.query(By.css('.item-status-section mat-icon'));
    expect(inactiveItemIcon).toBeFalsy();

    component.isActiveItem = false;
    fixture.detectChanges();

    inactiveItem = fixture.debugElement.query(By.css('.item-status-section'));
    expect(inactiveItem.classes['inactive-item']).toBeTruthy();

    inactiveItemIcon = fixture.debugElement.query(By.css('.item-status-section mat-icon'));
    expect(inactiveItemIcon).toBeTruthy();
    expect(inactiveItemIcon.nativeElement.textContent).toEqual('clear');
  });
});
