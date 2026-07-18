"use client";

import { useState, useEffect } from "react";
import { Users, GraduationCap, Building, Activity } from "lucide-react";

export default function InstitutionDashboard() {
  const [stats, setStats] = useState({
    students: 0,
    batches: 0,
    departments: 0,
    activeSessions: 0
  });

  useEffect(() => {
    // In a real implementation, we would fetch from /api/institution/stats
    // For now, let's mock it just to show the UI
    setStats({
      students: 450,
      batches: 8,
      departments: 4,
      activeSessions: 124
    });
  }, []);

  const statCards = [
    { name: "Total Students", value: stats.students, icon: Users, color: "bg-blue-50 text-blue-600" },
    { name: "Active Batches", value: stats.batches, icon: GraduationCap, color: "bg-green-50 text-green-600" },
    { name: "Departments", value: stats.departments, icon: Building, color: "bg-purple-50 text-purple-600" },
    { name: "Sessions This Month", value: stats.activeSessions, icon: Activity, color: "bg-orange-50 text-orange-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Overview</h2>
        <p className="text-gray-500">Welcome to your institution dashboard.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
              <div className={`p-4 rounded-xl ${stat.color}`}>
                <Icon size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-80">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Mood Trends</h3>
          <div className="flex h-full items-center justify-center text-gray-400">
            [Chart Placeholder]
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-80">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Sessions</h3>
          <div className="flex h-full items-center justify-center text-gray-400">
            [Activity List Placeholder]
          </div>
        </div>
      </div>
    </div>
  );
}
