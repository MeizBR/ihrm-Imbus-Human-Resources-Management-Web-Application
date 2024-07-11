import { By } from '@angular/platform-browser';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { TranslateModule } from '@ngx-translate/core';

import { NoItemsComponent } from './no-items.component';
import { AngularMaterialModule } from '../../../shared/angular-material/angular-material.module';

describe('NoItemsComponent', () => {
  let component: NoItemsComponent;
  let fixture: ComponentFixture<NoItemsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), AngularMaterialModule, BrowserAnimationsModule],
      declarations: [NoItemsComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NoItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the message', () => {
    component.message = 'No items';
    fixture.detectChanges();

    const msgCard = fixture.debugElement.query(By.css('.no-items-msg'));
    expect(msgCard).toBeTruthy();
    expect(msgCard.nativeElement.textContent).toEqual('No items');
  });
});
