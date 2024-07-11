import { initialEventsState } from '../event.reducer';
import { getEventCalendarsList, getEventsDetailedList, getEventsError, getEventsList, getEventsLoading, getSelectedEvent, getSelectedEventDetails } from '..';

import { EventType } from '../../../../shared/enum/event-type.enum';
import { Repetitive } from '../../../../shared/enum/repetitive.enum';
import { ErrorType } from '../../../../shared/validators/validation-error-type';
import { EventDetails } from '../../../../shared/models/event-models/event-details';

describe('Event state', () => {
  const eventA: EventDetails = {
    id: 1,
    calendarId: 1,
    start: new Date('2021-01-01T10:00:00.000Z'),
    end: new Date('2021-01-01T10:00:00.000Z'),
    title: 'First Event',
    description: 'Description for First Event',
    repetition: Repetitive.Monthly,
    allDay: true,
    creator: 2,
    eventType: EventType.Meeting,
    userPermission: { canDelete: true },
  };

  const eventB: EventDetails = {
    id: 2,
    calendarId: 2,
    start: new Date('2021-02-01T09:00:00.000Z'),
    end: new Date('2021-02-01T09:30:00.000Z'),
    title: 'Second Event',
    description: 'Description for Second Event',
    repetition: Repetitive.Monthly,
    allDay: false,
    creator: 1,
    eventType: EventType.Meeting,
    userPermission: { canDelete: true },
  };

  const calendarA = {
    id: 1,
    project: 1,
    projectName: 'Projet A1',
    name: 'Calendar N° 1',
    description: 'Description',
    isPrivate: false,
    userId: 1,
    timeZone: 'Africa/Tunis',
  };
  const calendarB = {
    id: 2,
    project: 2,
    projectName: 'Projet B1',
    name: 'Calendar N° 2',
    description: 'Description',
    isPrivate: true,
    userId: 2,
    timeZone: 'Africa/Tunis',
  };

  it('Should select the events list', () => {
    let result = getEventsList.projector(initialEventsState);
    expect(result).toEqual(undefined);
    result = getEventsList.projector({ initialEventState: initialEventsState, eventsList: [eventA, eventB] });

    expect(result.length).toEqual(2);
    expect(result[0]).toEqual(eventA);
    expect(result[1]).toEqual(eventB);
  });

  it('Should select the detailed events list', () => {
    const result = getEventsDetailedList.projector([eventA, eventB], [calendarA, calendarB], {
      workspaceId: 1,
      userId: 1,
      token: 'ABC',
      globalRoles: ['Administrator'],
    });
    expect(result).toEqual([
      {
        id: 1,
        calendarId: 1,
        calendarName: 'Calendar N° 1',
        start: new Date('2021-01-01T10:00:00.000Z'),
        end: new Date('2021-01-01T10:00:00.000Z'),
        title: 'First Event',
        description: 'Description for First Event',
        repetition: Repetitive.Monthly,
        allDay: true,
        creator: 2,
        eventType: EventType.Meeting,
        userPermission: { canDelete: true },
      },
      {
        id: 2,
        calendarId: 2,
        calendarName: 'Calendar N° 2',
        start: new Date('2021-02-01T09:00:00.000Z'),
        end: new Date('2021-02-01T09:30:00.000Z'),
        title: 'Second Event',
        description: 'Description for Second Event',
        repetition: Repetitive.Monthly,
        allDay: false,
        creator: 1,
        eventType: EventType.Meeting,
        userPermission: { canDelete: true },
      },
    ]);
  });

  it('Should get the selected event details', () => {
    const result = getSelectedEvent.projector({ ...initialEventsState, eventsList: [eventA, eventB], selectedEvent: eventA });
    expect(result).toEqual(eventA);
  });

  it('Should get the detailed selected event details', () => {
    const result = getSelectedEventDetails.projector(eventA, [calendarA, calendarB], { workspaceId: 1, userId: 1, token: 'token', globalRoles: ['Administrator'] });
    expect(result).toEqual({ ...eventA, calendarName: 'Calendar N° 1' });
  });

  it('Should select the events error', () => {
    let result = getEventsError.projector(initialEventsState);
    expect(result).toEqual(undefined);

    result = getEventsError.projector({ initialEventState: initialEventsState, eventsList: [eventA, eventB], error: ErrorType.NotTrimmed });

    expect(result).toEqual('notTrimmed');
  });

  it('Should select the loading events error', () => {
    let result = getEventsLoading.projector(initialEventsState);
    expect(result).toEqual(false);

    result = getEventsLoading.projector({
      initialEventState: initialEventsState,
      eventsList: [eventA, eventB],
      error: ErrorType.NotTrimmed,
      loadingAction: true,
    });

    expect(result).toEqual(true);
  });

  it('Should select the available calendars for the selected event error', () => {
    let result = getEventCalendarsList.projector(null, null, {
      workspaceId: 1,
      userId: 1,
      token: 'ABC',
      globalRoles: ['Administrator'],
    });
    expect(result).toEqual(undefined);

    result = getEventCalendarsList.projector([calendarA, calendarB], eventA, {
      workspaceId: 1,
      userId: 1,
      token: 'ABC',
      globalRoles: ['Administrator'],
    });
    expect(result).toEqual([calendarA]);

    result = getEventCalendarsList.projector([calendarA, calendarB], eventB, {
      workspaceId: 1,
      userId: 1,
      token: 'ABC',
      globalRoles: ['Administrator'],
    });
    expect(result).toEqual([calendarA, calendarB]);
  });
});
