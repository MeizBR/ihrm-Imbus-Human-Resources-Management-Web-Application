export interface CalendarsListFilter {
  calendarId: number;
  calendarName?: string;
  isChecked: boolean;
}

export interface UsersLeavesFilter {
  userId: number;
  userName?: string;
  isChecked: boolean;
}

export interface CalendarFilter {
  usersLeavesFilter: UsersLeavesFilter[];
  calendarsListFilter: CalendarsListFilter[];
}
