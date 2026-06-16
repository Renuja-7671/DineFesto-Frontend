import StaffLeaveRequests from '../../components/staff/StaffLeaveRequests';

function WaiterLeave() {
  return <StaffLeaveRequests leaveApiBase="/employees/leave" />;
}

export default WaiterLeave;
