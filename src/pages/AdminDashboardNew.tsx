import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSubmissions } from '@/hooks/useSubmissions';
import { useChallenges } from '@/hooks/useChallenges';
import { useUsers } from '@/hooks/useUsers';
import { 
  Clock, 
  FileText, 
  Users, 
  ClipboardList,
  Plus,
  Settings,
  BarChart3
} from 'lucide-react';
import { PendingSubmissionsPage } from '@/components/admin/PendingSubmissionsPage';
import { CreateChallengePage } from '@/components/admin/CreateChallengePage';
import { ManageChallengesPage } from '@/components/admin/ManageChallengesPage';
import { UserManagementPage } from '@/components/admin/UserManagementPage';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const { pendingSubmissions } = useSubmissions();
  const { challenges, challengeRequests } = useChallenges();
  const { users } = useUsers();

  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'submissions', label: 'Pending Submissions', icon: Clock },
    { id: 'create-challenge', label: 'Create Challenge', icon: Plus },
    { id: 'manage-challenges', label: 'Manage Challenges', icon: FileText },
    { id: 'users', label: 'User Management', icon: Users },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'submissions':
        return <PendingSubmissionsPage />;
      case 'create-challenge':
        return <CreateChallengePage />;
      case 'manage-challenges':
        return <ManageChallengesPage />;
      case 'users':
        return <UserManagementPage />;
      default:
        return (
          <div className="space-y-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
              <p className="text-gray-600">
                Manage challenges, submissions, and users
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 flex flex-col items-center">
                  <Clock className="w-8 h-8 text-yellow-500" />
                  <p className="text-gray-600 mt-2 mb-1">Pending Reviews</p>
                  <p className="text-2xl font-bold">{pendingSubmissions.length}</p>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 flex flex-col items-center">
                  <FileText className="w-8 h-8 text-blue-500" />
                  <p className="text-gray-600 mt-2 mb-1">Total Challenges</p>
                  <p className="text-2xl font-bold">{challenges.length}</p>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 flex flex-col items-center">
                  <ClipboardList className="w-8 h-8 text-orange-500" />
                  <p className="text-gray-600 mt-2 mb-1">Pending Requests</p>
                  <p className="text-2xl font-bold">{challengeRequests.length}</p>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 flex flex-col items-center">
                  <Users className="w-8 h-8 text-green-500" />
                  <p className="text-gray-600 mt-2 mb-1">Total Users</p>
                  <p className="text-2xl font-bold">{users.length}</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button 
                onClick={() => setActiveTab('submissions')}
                className="h-20 flex flex-col gap-2 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-yellow-200"
                variant="outline"
              >
                <Clock className="w-6 h-6" />
                Review Submissions
              </Button>
              
              <Button 
                onClick={() => setActiveTab('create-challenge')}
                className="h-20 flex flex-col gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"
                variant="outline"
              >
                <Plus className="w-6 h-6" />
                Create Challenge
              </Button>
              
              <Button 
                onClick={() => setActiveTab('manage-challenges')}
                className="h-20 flex flex-col gap-2 bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200"
                variant="outline"
              >
                <Settings className="w-6 h-6" />
                Manage Challenges
              </Button>
              
              <Button 
                onClick={() => setActiveTab('users')}
                className="h-20 flex flex-col gap-2 bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
                variant="outline"
              >
                <Users className="w-6 h-6" />
                Manage Users
              </Button>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {pendingSubmissions.slice(0, 3).map((submission) => (
                    <div key={submission.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Clock className="w-5 h-5 text-yellow-500" />
                      <div className="flex-1">
                        <p className="font-medium">New submission from {submission.users?.username}</p>
                        <p className="text-sm text-gray-600">
                          {submission.submitted_at ? new Date(submission.submitted_at).toLocaleDateString() : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {challengeRequests.slice(0, 2).map((request) => (
                    <div key={request.id} className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                      <ClipboardList className="w-5 h-5 text-orange-500" />
                      <div className="flex-1">
                        <p className="font-medium">New challenge request: {request.title}</p>
                        <p className="text-sm text-gray-600">Awaiting review</p>
                      </div>
                    </div>
                  ))}
                  
                  {pendingSubmissions.length === 0 && challengeRequests.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No recent activity</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900">Admin Panel</h2>
        </div>
        <nav className="mt-6">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-6 py-3 text-left hover:bg-gray-50 transition-colors ${
                  activeTab === item.id
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
                {/* Show badges for pending items */}
                {item.id === 'submissions' && pendingSubmissions.length > 0 && (
                  <span className="ml-auto bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                    {pendingSubmissions.length}
                  </span>
                )}
                {item.id === 'manage-challenges' && challengeRequests.length > 0 && (
                  <span className="ml-auto bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                    {challengeRequests.length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {renderContent()}
      </div>
    </div>
  );
}
