import StaffLeaveRequests from '../../components/staff/StaffLeaveRequests';

function ChefLeave() {
  return (
    <StaffLeaveRequests
      leaveApiBase="/chef/leave"
      pageTitle="Leave Requests"
      pageSubtitle="Apply for annual, casual, or medical leave. Your admin will review and approve requests."
    />
  );
}

export default ChefLeave;
