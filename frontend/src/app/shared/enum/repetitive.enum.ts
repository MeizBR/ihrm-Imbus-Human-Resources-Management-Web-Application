export enum Repetitive {
  Daily = 'Daily',
  Weekly = 'Weekly',
  Monthly = 'Monthly',
  Yearly = 'Yearly',
  Unrepeatable = 'Unrepeatable',
}

export namespace Repetitive {
  export type ApiValue = 'Daily' | 'Weekly' | 'Monthly' | 'Yearly' | 'Unrepeatable';

  export function getValues(): Repetitive[] {
    return [Repetitive.Daily, Repetitive.Weekly, Repetitive.Monthly, Repetitive.Yearly, Repetitive.Unrepeatable];
  }

  export function fromApiValue(value: ApiValue): Repetitive {
    switch (value) {
      case 'Daily':
        return Repetitive.Daily;

      case 'Weekly':
        return Repetitive.Weekly;

      case 'Monthly':
        return Repetitive.Monthly;

      case 'Yearly':
        return Repetitive.Yearly;

      case 'Unrepeatable':
        return Repetitive.Unrepeatable;

      default:
        break;
    }
  }

  export function toApiValue(value: Repetitive): string | undefined {
    switch (value) {
      case Repetitive.Daily:
        return 'Daily';

      case Repetitive.Weekly:
        return 'Weekly';

      case Repetitive.Monthly:
        return 'Monthly';

      case Repetitive.Yearly:
        return 'Yearly';

      case Repetitive.Unrepeatable:
        return 'Unrepeatable';

      default:
        return undefined;
    }
  }

  export function getTranslate(value: Repetitive | undefined): string {
    switch (value) {
      case Repetitive.Daily:
        return 'EVENTS_VIEW.REPETITIVE_ENUM.DAILY';

      case Repetitive.Weekly:
        return 'EVENTS_VIEW.REPETITIVE_ENUM.WEEKLY';

      case Repetitive.Monthly:
        return 'EVENTS_VIEW.REPETITIVE_ENUM.MONTHLY';

      case Repetitive.Yearly:
        return 'EVENTS_VIEW.REPETITIVE_ENUM.YEARLY';

      case Repetitive.Unrepeatable:
        return 'EVENTS_VIEW.REPETITIVE_ENUM.UNREPEATABLE';

      default:
        break;
    }
  }
}
