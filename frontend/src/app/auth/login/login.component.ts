import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';

import { Subscription } from 'rxjs';

import { select, Store } from '@ngrx/store';
import { TranslatePipe } from '@ngx-translate/core';

import { PostUserSession } from './../../generated/postUserSession';

import { AppState } from './../../core/reducers/index';
import { getAuthenticationError } from '../../core/reducers/auth';
import { authActions } from './../../core/reducers/auth/auth.actions';

import { ErrorType } from '../../shared/validators/validation-error-type';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [TranslatePipe],
})
export class LoginComponent implements OnInit {
  private subscription$: Subscription[] = [];

  public loginForm: FormGroup;
  public showPassword = false;
  public errorMessage: string;
  public ErrorType = ErrorType;

  constructor(private formBuilder: FormBuilder, private store: Store<AppState>) {
    this.loginForm = this.formBuilder.group({
      workspace: [''],
      login: [''],
      password: [''],
    });
  }

  ngOnInit(): void {
    this.subscription$.push(
      this.store.pipe(select(getAuthenticationError)).subscribe(error => {
        this.handleError(error);
      }),
    );
  }

  get loginFormControls(): { [key: string]: AbstractControl } {
    return this.loginForm.controls;
  }

  login(): void {
    const user: PostUserSession = {
      workspace: this.loginFormControls.workspace.value,
      login: this.loginFormControls.login.value,
      password: this.loginFormControls.password.value,
    };
    this.store.dispatch(authActions.loginAction({ user }));
  }

  private handleError(errorType: ErrorType | undefined): void {
    switch (errorType) {
      case ErrorType.WrongCredentials:
        this.errorMessage = 'LOG_VIEW.INVALID_CREDENTIALS';
        break;

      case ErrorType.InactiveUser:
        this.errorMessage = 'LOG_VIEW.INACTIVE_USER';
        break;

      default:
        break;
    }
  }
}
