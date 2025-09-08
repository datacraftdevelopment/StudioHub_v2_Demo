import React, { useState } from 'react';
import { Search, ChevronDown, TrendingUp, Clock, AlertTriangle, CheckCircle, BarChart3, PieChart, MessageSquare, ExternalLink, Calendar, Home, Briefcase, Bot } from 'lucide-react';

const StudioHubDashboard = () => {
  const [currentView, setCurrentView] = useState('department');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    departments: {
      Environmental: true,
      Graphics: true,
      Industrial: true,
      Structural: true
    }
  });
  
  // Sample user data - this would come from your FileMaker system
  const user = {
    name: "Joe DaSilva",
    userType: "manager", // "designer" | "manager"
    department: "Environmental",
    managedDepartments: ["Environmental", "Graphics", "Industrial", "Structural"],
    hasAIAccess: true,
    avatar: "JD"
  };

  // Sample dashboard data - this would come from your API
  const dashboardData = {
    atRisk: { overdue: 3, dueToday: 2 },
    completionRate: 78,
    completionChange: "+5%",
    nextSevenDays: { 
      pastDue: 4,        // Items that were due but not completed
      upcoming: 3        // Items coming up in next 7 business days
    },
    departmentBreakdown: [
      { name: "Graphics", value: 45, color: "#3b82f6" },
      { name: "Industrial", value: 30, color: "#8b5cf6" },
      { name: "Environmental", value: 25, color: "#10b981" }
    ],
    recentlyCompleted: { thisWeek: 2, thisMonth: 10 }
  };

  // Sample deliverables data - sorted with overdue items first
  const upcomingDeliverables = [
    // Overdue items first (regardless of due date)
    { id: "H15320-01", project: "Circle K East", deliverable: "Final Art", dueDate: "Fri 18", assigned: "Kim Tebby", status: "Overdue" },
    // Then upcoming items by due date
    { id: "H10053-01", project: "Becker's Signage", deliverable: "Concept Flat Art", dueDate: "Mon 21", assigned: "Kim Tebby", status: "Complete" },
    { id: "H10231-01", project: "Mask Product Box", deliverable: "Prototype White", dueDate: "Wed 23", assigned: "Emily Rose", status: "In Progress" },
    { id: "H15067-02", project: "Walmart Retail", deliverable: "Meeting", dueDate: "Thu 24", assigned: "Joe DaSilva", status: "Pending" }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Complete': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const toggleDepartmentFilter = (department) => {
    setFilters(prev => ({
      ...prev,
      departments: {
        ...prev.departments,
        [department]: !prev.departments[department]
      }
    }));
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters.departments).filter(Boolean).length;
  };

  const getStatusDot = (status) => {
    switch (status) {
      case 'Complete': return 'bg-green-500';
      case 'In Progress': return 'bg-blue-500';
      case 'Pending': return 'bg-yellow-500';
      case 'Overdue': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-gray-700 text-white flex flex-col">
        {/* User Profile */}
        <div className="p-6 border-b border-gray-600">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center text-sm font-medium">
              {user.avatar}
            </div>
            <div>
              <div className="font-medium">{user.name}</div>
              <div className="text-sm text-gray-400">Jul 21</div>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2">
          <div className="flex items-center space-x-3 px-3 py-2 bg-gray-600 rounded-lg">
            <Home size={20} />
            <span className="font-medium">Dashboard</span>
          </div>
          <div className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-gray-600 rounded-lg cursor-pointer">
            <Calendar size={20} />
            <span>Calendar</span>
          </div>
          <div className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-gray-600 rounded-lg cursor-pointer">
            <Briefcase size={20} />
            <span>My Work</span>
          </div>
          {user.hasAIAccess && (
            <div className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-gray-600 rounded-lg cursor-pointer">
              <Bot size={20} />
              <span>AI Assistant</span>
            </div>
          )}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">StudioHub Dashboard</h1>
              <div className="flex items-center space-x-4 mt-2">
                {user.userType === "designer" ? (
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => setCurrentView('personal')}
                      className={`px-3 py-1 rounded-md text-sm font-medium ${currentView === 'personal' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                      👤 My Deliverables
                    </button>
                    <button 
                      onClick={() => setCurrentView('department')}
                      className={`px-3 py-1 rounded-md text-sm font-medium ${currentView === 'department' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                      🏢 {user.department} Department
                    </button>
                  </div>
                ) : (
                  <div className="text-sm text-gray-600">
                    Showing {getActiveFiltersCount()} of {Object.keys(filters.departments).length} departments
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {user.userType === "manager" && (
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-lg border ${showFilters ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                >
                  <span>🏢</span>
                  <span>Departments</span>
                  {getActiveFiltersCount() > 0 && (
                    <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-0.5 ml-1">
                      {getActiveFiltersCount()}
                    </span>
                  )}
                </button>
              )}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Department Filter Panel */}
        {showFilters && user.userType === "manager" && (
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="bg-gray-50 rounded-lg border p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Departments</h4>
              <div className="grid grid-cols-2 gap-4">
                {user.managedDepartments.map(dept => (
                  <label key={dept} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.departments[dept]}
                      onChange={() => toggleDepartmentFilter(dept)}
                      className="rounded text-blue-600"
                    />
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">🏢</span>
                      <span className="text-sm text-gray-700">{dept}</span>
                    </div>
                  </label>
                ))}
              </div>
              
              {/* Quick Actions */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setFilters(prev => ({
                      ...prev,
                      departments: Object.keys(prev.departments).reduce((acc, dept) => ({ ...acc, [dept]: true }), {})
                    }))}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Select All
                  </button>
                  <span className="text-xs text-gray-400">•</span>
                  <button
                    onClick={() => setFilters(prev => ({
                      ...prev,
                      departments: Object.keys(prev.departments).reduce((acc, dept) => ({ ...acc, [dept]: false }), {})
                    }))}
                    className="text-xs text-gray-600 hover:text-gray-700 font-medium"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Content */}
        <main className="flex-1 p-6 overflow-auto">
          {/* Dashboard Cards Grid - Compact Layout */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            {/* At Risk Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="text-red-500" size={16} />
                <h3 className="font-medium text-gray-900 text-sm">At Risk</h3>
              </div>
              <div className="text-xl font-bold text-red-600 mb-1">{dashboardData.atRisk.overdue + dashboardData.atRisk.dueToday}</div>
              <div className="text-xs text-gray-600 mb-2">{dashboardData.atRisk.overdue} Overdue, {dashboardData.atRisk.dueToday} Today</div>
              <button className="text-red-600 text-xs font-medium hover:text-red-700">View All →</button>
            </div>

            {/* Completion Rate Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center space-x-2 mb-2">
                <BarChart3 className="text-blue-500" size={16} />
                <h3 className="font-medium text-gray-900 text-sm">Completion</h3>
              </div>
              <div className="text-xl font-bold text-blue-600 mb-1">{dashboardData.completionRate}%</div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                <div 
                  className="bg-blue-600 h-1.5 rounded-full" 
                  style={{ width: `${dashboardData.completionRate}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Next 7 Days</span>
                <span className="text-xs font-medium text-green-600">{dashboardData.completionChange}</span>
              </div>
            </div>

            {/* Next 7 Business Days Card - with Past Due breakdown */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="text-blue-500" size={16} />
                <h3 className="font-medium text-gray-900 text-sm">Next 7 Days</h3>
              </div>
              <div className="space-y-1 mb-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-red-600">Past Due</span>
                  <span className="text-sm font-bold text-red-600">{dashboardData.nextSevenDays.pastDue}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-blue-600">Upcoming</span>
                  <span className="text-sm font-bold text-blue-600">{dashboardData.nextSevenDays.upcoming}</span>
                </div>
              </div>
              <button className="text-blue-600 text-xs font-medium hover:text-blue-700">View All →</button>
            </div>

            {/* Department Breakdown Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center space-x-2 mb-2">
                <PieChart className="text-purple-500" size={16} />
                <h3 className="font-medium text-gray-900 text-sm">Departments</h3>
              </div>
              <div className="space-y-1 mb-2">
                {dashboardData.departmentBreakdown.slice(0, 2).map((dept, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <div 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: dept.color }}
                      ></div>
                      <span className="text-xs text-gray-700">{dept.name}</span>
                    </div>
                    <span className="text-xs font-medium">{dept.value}%</span>
                  </div>
                ))}
              </div>
              <button className="text-purple-600 text-xs font-medium hover:text-purple-700">View All →</button>
            </div>

            {/* Recently Completed Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="text-green-500" size={16} />
                <h3 className="font-medium text-gray-900 text-sm">Completed</h3>
              </div>
              <div className="text-xl font-bold text-green-600 mb-1">{dashboardData.recentlyCompleted.thisWeek}</div>
              <div className="text-xs text-gray-600 mb-2">This Week</div>
              <button className="text-green-600 text-xs font-medium hover:text-green-700">View Report →</button>
            </div>

            {/* AI Insights Card - Conditional */}
            {user.hasAIAccess && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <MessageSquare className="text-blue-500" size={16} />
                  <h3 className="font-medium text-gray-900 text-sm">AI Insights</h3>
                </div>
                <div className="text-xs text-gray-600 mb-3">Generate charts and insights</div>
                <button className="w-full bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 px-2 py-1.5 rounded text-xs font-medium transition-colors">
                  Ask AI
                </button>
              </div>
            )}
          </div>

          {/* Data Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">REQUEST DELIVERABLES - NEXT 7 BUSINESS DAYS</h2>
              <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm font-medium">
                <ExternalLink size={16} />
                <span>Open in FileMaker</span>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deliverable</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {upcomingDeliverables.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer">
                        {item.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.project}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.deliverable}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.dueDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.assigned}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${getStatusDot(item.status)}`}></div>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                            {item.status}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudioHubDashboard;