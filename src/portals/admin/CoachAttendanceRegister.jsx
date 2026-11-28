import React from 'react';
import CoachAttendanceCalendar from '../common/CoachAttendanceCalendar';

export default function CoachAttendanceRegister({ 
  currentPortal = 'admin', 
  defaultCoachId = null, 
  allowedCoaches = null,
  allowedLocations = null 
}) {
  return (
    <CoachAttendanceCalendar
      portalRole={currentPortal}
      defaultCoachId={defaultCoachId}
      allowedCoaches={allowedCoaches}
      allowedLocations={allowedLocations}
    />
  );
}
