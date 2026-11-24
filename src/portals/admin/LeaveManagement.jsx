import React from 'react';
import CoachLeaveRequestsManager from '../common/CoachLeaveRequestsManager';

export default function LeaveManagement() {
  return (
    <div className="space-y-6">
      <CoachLeaveRequestsManager mode="admin" />
    </div>
  );
}
