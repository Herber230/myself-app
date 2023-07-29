import { findValue } from '@utils/object';

export interface AppErrorConstructorOptions {
  message: string;
  isException: boolean;
  originalError?: unknown;
}

export class AppError extends Error {
  //#region properties
  private _isException: boolean;
  private _originalError: unknown | undefined;
  //#endregion properties

  //#region methods
  constructor({
    message,
    isException,
    originalError,
  }: AppErrorConstructorOptions) {
    super(message);

    this._isException = isException;
    this._originalError = originalError;
  }
  //#endregion methods

  //#region accessors
  get isException(): boolean {
    return this._isException;
  }

  get originalError(): unknown | undefined {
    return this._originalError;
  }
  //#endregion accessors

  //#region static
  static handleError(error: unknown): AppError {
    if (error instanceof AppError) {
      return error;
    }

    return new AppError({
      message:
        findValue<string>(error, ['message', 'toString']) ??
        'Unknown exception',
      originalError: error,
      isException: true,
    });
  }
  //#endregion static
}
