"use client";

import { useState, useEffect } from "react";
import { Plus, Archive, MoreVertical, Edit2 } from "lucide-react";

export default function BatchesPage() {
  const [batches, setBatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBatches = async () => {
    try {
      const res = await fetch("/api/institution/batches");
      if (res.ok) {
        const data = await res.json();
        setBatches(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const archiveBatch = async (id: string) => {
    if (!confirm("Are you sure you want to archive this batch? Students in this batch will be set to graduated/read-only mode.")) return;
    try {
      const res = await fetch(`/api/institution/batches/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ARCHIVED" })
      });
      if (res.ok) {
        fetchBatches();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Batches</h2>
          <p className="text-gray-500">Manage student batches and graduation years.</p>
        </div>
        <button className="bg-brown-600 text-white px-4 py-2 rounded-xl flex items-center space-x-2 hover:bg-brown-700 transition-colors">
          <Plus size={18} />
          <span>Create Batch</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
            <tr>
              <th className="px-6 py-4">Batch Name</th>
              <th className="px-6 py-4">Graduation Year</th>
              <th className="px-6 py-4">Students</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500">Loading batches...</td>
              </tr>
            ) : batches.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500">No batches found. Create one to get started.</td>
              </tr>
            ) : (
              batches.map((batch) => (
                <tr key={batch.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 font-medium text-gray-900">{batch.name}</td>
                  <td className="px-6 py-4 text-gray-600">{batch.graduationYear || "N/A"}</td>
                  <td className="px-6 py-4 text-gray-600">{batch._count?.patients || 0}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                      batch.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                    }`}>
                      {batch.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-3 text-gray-400">
                      <button className="hover:text-blue-600 transition-colors">
                        <Edit2 size={16} />
                      </button>
                      {batch.status === "ACTIVE" && (
                        <button 
                          onClick={() => archiveBatch(batch.id)}
                          className="hover:text-red-600 transition-colors"
                          title="Archive Batch"
                        >
                          <Archive size={16} />
                        </button>
                      )}
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
