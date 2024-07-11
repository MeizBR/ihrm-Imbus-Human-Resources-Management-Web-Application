import { CalendarDetails, CustomerDetails, LeaveDetails, ProjectDetails, UserDetails } from '../models';

type DataType = UserDetails | ProjectDetails | LeaveDetails | CustomerDetails | CalendarDetails;
export function sortingDataAccessor(data: DataType, sortHeaderId: string): string {
  return sortHeaderId === 'user'
    ? `${data['firstName']} ${data['lastName']}`.toLowerCase()
    : sortHeaderId === 'active'
    ? data['isActive']
    : typeof data[sortHeaderId] === 'string'
    ? data[sortHeaderId]?.toLowerCase()
    : data[sortHeaderId];
}
