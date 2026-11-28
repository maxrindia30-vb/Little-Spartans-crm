import React from 'react';
import CommonCoachAttendanceCalendar from '../common/CoachAttendanceCalendar';

export default function CoachAttendanceCalendar({ 
  allowedLocations = [], 
  allowedCoaches = null,
  defaultCoachId = null 
}) {
  return (
    <CommonCoachAttendanceCalendar
      portalRole="super_coach"
      allowedLocations={allowedLocations}
      allowedCoaches={allowedCoaches}
      defaultCoachId={defaultCoachId}
    />
  );
}
