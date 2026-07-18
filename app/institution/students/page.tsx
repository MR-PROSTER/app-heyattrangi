"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Ban, Unlock, MoreVertical } from "lucide-react";

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStudents = async () => {
    try {
      const res = await fetch("/api/institution/students");
      if (res.ok) {
        const data = await res.json();
        setStudents(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const toggleStudentStatus = async (studentId: string, currentStatus: string) => {
    const newStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    const action = currentStatus === "ACTIVE" ? "suspend" : "reactivate";
    
    if (!confirm(`Are you sure you want to ${action} this student account?`)) return;

    try {
      const res = await fetch(`/api/institution/students/${studentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentStatus: newStatus })
      });
      if (res.ok) {
        fetchStudents();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Students</h2>
          <p className="text-gray-500">Manage student access and assignments.</p>
        </div>
        <button className="bg-brown-600 text-white px-4 py-2 rounded-xl flex items-center space-x-2 hover:bg-brown-700 transition-colors">
          <Plus size={18} />
          <span>Add Student</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-100 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, email, or roll number..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-brown-500/20"
            />
          </div>
          <select className="bg-gray-50 border-none rounded-xl px-4 py-2 focus:ring-2 focus:ring-brown-500/20">
            <option>All Batches</option>
          </select>
        </div>

        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
            <tr>
              <th className="px-6 py-4">Student Info</th>
              <th className="px-6 py-4">Batch / Dept</th>
              <th className="px-6 py-4">Roll Number</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500">Loading students...</td>
              </tr>
            ) : students.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500">No students found. Add one to get started.</td>
              </tr>
            ) : (
              students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brown-100 text-brown-700 flex items-center justify-center font-bold text-sm">
                        {(student.user?.name || "S")[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{student.user?.name}</p>
                        <p className="text-xs text-gray-500">{student.user?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-900">{student.batch?.name || "Unassigned"}</p>
                    <p className="text-xs text-gray-500">{student.department?.name || ""}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-600 font-mono text-sm">
                    {student.rollNumber || "N/A"}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                      student.studentStatus === "ACTIVE" ? "bg-green-100 text-green-700" : 
                      student.studentStatus === "GRADUATED" ? "bg-blue-100 text-blue-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {student.studentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-3 text-gray-400">
                      <button 
                        onClick={() => toggleStudentStatus(student.id, student.studentStatus)}
                        className={`transition-colors ${student.studentStatus === "ACTIVE" ? "hover:text-red-600" : "hover:text-green-600"}`}
                        title={student.studentStatus === "ACTIVE" ? "Suspend Account" : "Reactivate Account"}
                      >
                        {student.studentStatus === "ACTIVE" ? <Ban size={16} /> : <Unlock size={16} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
