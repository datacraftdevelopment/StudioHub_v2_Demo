import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, Filter, Calendar, Home, Briefcase, Bot, Clock, AlertTriangle, CheckCircle, Users, Eye, EyeOff } from 'lucide-react';

const StudioHubCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 6, 21)); // July 2025
  const [selectedDate, setSelectedDate] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('month'); // month, week
  const [filters, setFilters] = useState({
    status: {
      overdue: true,
      dueToday: true,
      upcoming: true,
      complete: false
    },
    departments: {
      Environmental: true,
      Graphics: true,
      Industrial: true,
      Structural: true
    }
  });

  // Sample user data
  const user = {
    name: "Joe DaSilva",
    userType: "manager",
    department: "Environmental",
    managedDepartments: ["Environmental", "Graphics", "Industrial", "Structural"],
    hasAIAccess: true,
    avatar: "JD"
  };

  // Sample calendar data with deliverables
  const deliverables = [
    // July 2025 deliverables
    { id: "H15320-01", project: "Circle K East", deliverable: "Final Art", date: "2025-07-18", assigned: "Kim Tebby", status: "Overdue", department: "Graphics", priority: "high" },
    { id: "H10053-01", project: "Becker's Signage", deliverable: "Concept Review", date: "2025-07-21", assigned: "Kim Tebby", status: "Due Today", department: "Graphics", priority: "medium" },
    { id: "H10231-01", project: "Mask Product Box", deliverable: "Prototype White", date: "2025-07-23", assigned: "Emily Rose", status: "Upcoming", department: "Industrial", priority: "medium" },
    { id: "H15067-02", project: "Walmart Retail", deliverable: "Client Meeting", date: "2025-07-24", assigned: "Joe DaSilva", status: "Upcoming", department: "Environmental", priority: "high" },
    { id: "H12098-03", project: "McDonald's Refresh", deliverable: "Design Concepts", date: "2025-07-25", assigned: "Sarah Chen", status: "Upcoming", department: "Graphics", priority: "medium" },
    { id: "H13445-01", project: "Shell Station", deliverable: "Environmental Review", date: "2025-07-28", assigned: "Mike Johnson", status: "Upcoming", department: "Environmental", priority: "low" },
    { id: "H14567-02", project: "Tim Hortons", deliverable: "Structural Analysis", date: "2025-07-29", assigned: "David Lee", status: "Upcoming", department: "Structural", priority: "high" },
    { id: "H11234-01", project: "Subway Rebrand", deliverable: "Final Approval", date: "2025-07-30", assigned: "Lisa Wang", status: "Complete", department: "Graphics", priority: "medium" },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Complete': return { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' };
      case 'Upcoming': return { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500' };
      case 'Due Today': return { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500' };
      case 'Overdue': return { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-800', dot: 'bg-gray-500' };
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-500';
    }
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getDeliverablesForDate = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return deliverables.filter(d => {
      const matchesDate = d.date === dateStr;
      const matchesDepartment = filters.departments[d.department];
      const matchesStatus = (
        (filters.status.overdue && d.status === 'Overdue') ||
        (filters.status.dueToday && d.status === 'Due Today') ||
        (filters.status.upcoming && d.status === 'Upcoming') ||
        (filters.status.complete && d.status === 'Complete')
      );
      return matchesDate && matchesDepartment && matchesStatus;
    });
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const renderCalendarGrid = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Header with day names
    dayNames.forEach(day => {
      days.push(
        <div key={day} className="p-2 text-center text-xs font-medium text-gray-500 bg-gray-50 border-b">
          {day}
        </div>
      );
    });

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2 bg-gray-25 border-b border-r border-gray-200"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayDeliverables = getDeliverablesForDate(day);
      const isToday = day === 21; // Current day highlight
      const hasDeliverables = dayDeliverables.length > 0;

      days.push(
        <div 
          key={day} 
          className={`p-1 min-h-[100px] border-b border-r border-gray-200 cursor-pointer hover:bg-gray-50 ${isToday ? 'bg-blue-50' : 'bg-white'}`}
          onClick={() => setSelectedDate(day)}
        >
          <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
            {day}
          </div>
          <div className="space-y-1">
            {dayDeliverables.slice(0, 3).map((deliverable, index) => {
              const colors = getStatusColor(deliverable.status);
              const priority = getPriorityColor(deliverable.priority);
              return (
                <div 
                  key={index} 
                  className={`text-xs p-1 rounded border-l-2 ${colors.bg} ${colors.text} ${priority} cursor-pointer hover:shadow-sm`}
                  title={`${deliverable.project} - ${deliverable.deliverable} (${deliverable.assigned})`}
                >
                  <div className="font-medium truncate">{deliverable.deliverable}</div>
                  <div className="text-xs opacity-75 truncate">{deliverable.assigned}</div>
                </div>
              );
            })}
            {dayDeliverables.length > 3 && (
              <div className="text-xs text-gray-500 font-medium">
                +{dayDeliverables.length - 3} more
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  const getSelectedDateDeliverables = () => {
    if (!selectedDate) return [];
    return getDeliverablesForDate(selectedDate);
  };

  const toggleStatusFilter = (status) => {
    setFilters(prev => ({
      ...prev,
      status: {
        ...prev.status,
        [status]: !prev.status[status]
      }
    }));
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
    const statusCount = Object.values(filters.status).filter(Boolean).length;
    const deptCount = Object.values(filters.departments).filter(Boolean).length;
    return statusCount + deptCount;
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
          <div className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-gray-600 rounded-lg cursor-pointer">
            <Home size={20} />
            <span>Dashboard</span>
          </div>
          <div className="flex items-center space-x-3 px-3 py-2 bg-gray-600 rounded-lg">
            <Calendar size={20} />
            <span className="font-medium">Calendar</span>
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
              <h1 className="text-2xl font-bold text-gray-900">Calendar View</h1>
              <div className="flex items-center space-x-4 mt-2">
                <div className="text-sm text-gray-600">
                  Showing {Object.values(filters.departments).filter(Boolean).length} of {Object.keys(filters.departments).length} departments
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-lg border ${showFilters ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
              >
                <Filter size={16} />
                <span>Filters</span>
                {getActiveFiltersCount() > 0 && (
                  <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-0.5 ml-1">
                    {getActiveFiltersCount()}
                  </span>
                )}
              </button>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Search deliverables..." 
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
              <div className="grid grid-cols-2 gap-6">
                {/* Status Filters */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Status</h4>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={filters.status.overdue}
                        onChange={() => toggleStatusFilter('overdue')}
                        className="rounded text-red-600"
                      />
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-sm text-gray-700">Overdue</span>
                      </div>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={filters.status.dueToday}
                        onChange={() => toggleStatusFilter('dueToday')}
                        className="rounded text-yellow-600"
                      />
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm text-gray-700">Due Today</span>
                      </div>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={filters.status.upcoming}
                        onChange={() => toggleStatusFilter('upcoming')}
                        className="rounded text-blue-600"
                      />
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-gray-700">Upcoming</span>
                      </div>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={filters.status.complete}
                        onChange={() => toggleStatusFilter('complete')}
                        className="rounded text-green-600"
                      />
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-700">Completed</span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Department Filters */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Departments</h4>
                  <div className="space-y-2">
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
            </div>
          )}
        </header>

        {/* Calendar Content */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="flex space-x-6">
            {/* Calendar Grid */}
            <div className="flex-1">
              {/* Calendar Header */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => navigateMonth(-1)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <ChevronLeft size={20} className="text-gray-600" />
                    </button>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {formatDate(currentDate)}
                    </h2>
                    <button
                      onClick={() => navigateMonth(1)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <ChevronRight size={20} className="text-gray-600" />
                    </button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg">
                      Month
                    </button>
                    <button className="px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg">
                      Week
                    </button>
                  </div>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7">
                  {renderCalendarGrid()}
                </div>
              </div>

              {/* Legend */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Legend</h3>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-xs text-gray-700">Overdue</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-xs text-gray-700">Due Today</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-xs text-gray-700">Upcoming</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-gray-700">Complete</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-2 bg-red-500"></div>
                    <span className="text-xs text-gray-700">High Priority</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-2 bg-yellow-500"></div>
                    <span className="text-xs text-gray-700">Medium Priority</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-2 bg-green-500"></div>
                    <span className="text-xs text-gray-700">Low Priority</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Detail Panel */}
            {selectedDate && (
              <div className="w-80">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {formatDate(currentDate).split(' ')[0]} {selectedDate}, {currentDate.getFullYear()}
                  </h3>
                  
                  {getSelectedDateDeliverables().length > 0 ? (
                    <div className="space-y-3">
                      {getSelectedDateDeliverables().map((deliverable, index) => {
                        const colors = getStatusColor(deliverable.status);
                        const priority = getPriorityColor(deliverable.priority);
                        return (
                          <div 
                            key={index} 
                            className={`p-3 rounded-lg border-l-4 ${colors.bg} ${priority}`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="text-sm font-medium text-gray-900">{deliverable.deliverable}</h4>
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${colors.bg} ${colors.text}`}>
                                {deliverable.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 mb-2">{deliverable.project}</p>
                            <div className="flex items-center justify-between text-xs text-gray-600">
                              <span>👤 {deliverable.assigned}</span>
                              <span>🏢 {deliverable.department}</span>
                            </div>
                            <div className="mt-2 text-xs text-gray-500">
                              Request: {deliverable.id}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No deliverables scheduled for this date</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudioHubCalendar;