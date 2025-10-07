"use client";

import { useAppStore } from '@/hooks/use-app-store';
import Header from '@/components/app/header';
import Navigation from '@/components/app/navigation';
import ParentDashboard from '@/components/app/dashboards/parent-dashboard';
import ReceptionDashboard from '@/components/app/dashboards/reception-dashboard';
import TeacherDashboard from '@/components/app/dashboards/teacher-dashboard';
import LocationMapView from '@/components/app/views/location-map-view';
import PickupRequestView from '@/components/app/views/pickup-request-view';
import VehicleRegistrationView from '@/components/app/views/vehicle-registration-view';
import AttendanceView from '@/components/app/views/attendance-view';
import EarlyDeparturesView from '@/components/app/views/early-departures-view';
import VehicleAccessView from '@/components/app/views/vehicle-access-view';
import AccessLogsView from '@/components/app/views/access-logs-view';
import PickupRequestsManagementView from '@/components/app/views/pickup-requests-management-view';


export default function MainLayout() {
  const { currentUser, activeTab } = useAppStore();

  const renderContent = () => {
    switch (currentUser.type) {
      case 'parent':
        switch (activeTab) {
          case 'dashboard':
            return <ParentDashboard />;
          case 'locations':
            return <LocationMapView />;
          case 'requests':
            return <PickupRequestView />;
          case 'register':
            return <VehicleRegistrationView />;
          default:
            return <ParentDashboard />;
        }
      case 'teacher':
        switch (activeTab) {
          case 'dashboard':
            return <TeacherDashboard />;
          case 'attendance':
            return <AttendanceView />;
          case 'early-departures':
            return <EarlyDeparturesView />;
          default:
            return <TeacherDashboard />;
        }
      case 'reception':
        switch (activeTab) {
          case 'dashboard':
            return <ReceptionDashboard />;
          case 'requests':
            return <PickupRequestsManagementView />;
          case 'vehicles':
            return <VehicleAccessView />;
          case 'logs':
            return <AccessLogsView />;
          default:
            return <ReceptionDashboard />;
        }
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-br from-ats-dark-blue via-ats-blue to-ats-light-blue pb-8">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Navigation />
        </main>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        {renderContent()}
      </div>
    </div>
  );
}
