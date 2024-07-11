import { By } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { TranslateModule } from '@ngx-translate/core';

import { ConfirmDialogComponent } from './confirm-dialog.component';
import { AngularMaterialModule } from '../../angular-material/angular-material.module';

describe('ConfirmDialogComponent', () => {
  let component: ConfirmDialogComponent;
  let fixture: ComponentFixture<ConfirmDialogComponent>;

  const dialogMock = {
    close: () => {},
  };
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [AngularMaterialModule, HttpClientModule, ReactiveFormsModule, BrowserAnimationsModule, TranslateModule.forRoot()],
      declarations: [ConfirmDialogComponent],
      providers: [
        {
          provide: MatDialogRef,
          useValue: dialogMock,
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {},
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmDialogComponent);
    component = fixture.componentInstance;
    component.title = 'Delete title';
    component.message = 'Delete message';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the confirm dialog correctly', () => {
    const confirmDialogContainer = fixture.debugElement.query(By.css('.confirm-dialog-container'));
    expect(confirmDialogContainer).toBeTruthy();
    expect(confirmDialogContainer.nativeElement.childElementCount).toEqual(3);

    const title = fixture.debugElement.query(By.css('.mat-dialog-title'));
    expect(title).toBeTruthy();
    expect(title.nativeElement.textContent).toEqual('Delete title');

    const dialogContent = fixture.debugElement.query(By.css('.mat-dialog-content'));
    expect(dialogContent).toBeTruthy();
    expect(dialogContent.nativeElement.childElementCount).toEqual(1);

    const message = fixture.debugElement.query(By.css('.mat-dialog-content p'));
    expect(message).toBeTruthy();
    expect(message.nativeElement.textContent).toEqual('Delete message');

    const dialogActions = fixture.debugElement.query(By.css('.mat-dialog-actions'));
    expect(dialogActions).toBeTruthy();
    expect(dialogActions.nativeElement.childElementCount).toEqual(2);

    const yesButton = fixture.debugElement.query(By.css('.yes-button'));
    expect(yesButton).toBeTruthy();
    expect(yesButton.nativeElement.textContent).toEqual('YES');

    const noButton = fixture.debugElement.query(By.css('.no-button'));
    expect(noButton).toBeTruthy();
    expect(noButton.nativeElement.textContent).toEqual('NO');
  });

  it('should handle confirm actions correctly', () => {
    const yesButton = fixture.debugElement.query(By.css('.yes-button'));
    const noButton = fixture.debugElement.query(By.css('.no-button'));
    const spyOnConfirm = spyOn(component, 'onConfirm').and.callThrough();
    const spyOnDismiss = spyOn(component, 'onDismiss').and.callThrough();
    const spyOnDialogClose = spyOn(component.dialogRef, 'close').and.callThrough();

    yesButton.nativeElement.click();
    fixture.detectChanges();
    expect(spyOnConfirm).toHaveBeenCalled();
    expect(spyOnDialogClose).toHaveBeenCalledWith(true);

    noButton.nativeElement.click();
    fixture.detectChanges();
    expect(spyOnDismiss).toHaveBeenCalled();
    expect(spyOnDialogClose).toHaveBeenCalledWith(true);
  });
});
