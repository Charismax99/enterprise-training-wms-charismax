import { useState } from "react";
import { USERS, User, TrainingRequest } from "../data/mockData";
import { X, UserPlus, Users, Calendar, BookOpen } from "lucide-react";

export function NominationModal({
  manager,
  onClose,
  onCreate,
}: {
  manager: User;
  onClose: () => void;
  onCreate: (r: TrainingRequest) => void;
}) {
  const team = USERS.filter((u) => u.managerId === manager.id);
  const [employeeId, setEmployeeId] = useState(team[0]?.id ?? "");
  const [quarter, setQuarter] = useState("Q2-2026");
  const [competency, setCompetency] = useState(team[0]?.competency ?? "");

  const selectedEmp = team.find((t) => t.id === employeeId);

  const create = () => {
    const emp = USERS.find((u) => u.id === employeeId);
    if (!emp) return;
    const newReq: TrainingRequest = {
      id: `REQ-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      employeeId: emp.id,
      employeeName: emp.name,
      employeeDepartment: emp.department,
      nominatorId: manager.id,
      nominatorName: manager.name,
      competency: competency || emp.competency || "",
      quarter,
      courseTitle: "",
      instituteId: "",
      startDate: "",
      endDate: "",
      durationDays: 0,
      basicCost: 0,
      currency: "USD",
      usdCost: 0,
      venueType: "Onsite",
      city: "",
      status: "PendingEmployee",
      comments: [`Nominated by ${manager.name} (${manager.id}).`],
      createdAt: new Date().toISOString().split("T")[0],
    };
    onCreate(newReq);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div style={{ background: "linear-gradient(135deg, #1F4128 0%, #2D5A39 100%)" }} className="px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <UserPlus size={19} className="text-white" />
            </div>
            <div>
              <div className="text-white" style={{ fontWeight: 700 }}>Nominate Employee</div>
              <div className="text-green-200" style={{ fontSize: "0.73rem" }}>
                Nominating as: {manager.name}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white p-1 rounded-lg transition-colors">
            <X size={17} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {team.length === 0 ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users size={22} className="text-slate-400" />
              </div>
              <p className="text-[#2D3748]" style={{ fontWeight: 500 }}>No team members assigned</p>
              <p className="text-[#4A5568]" style={{ fontSize: "0.8rem" }}>Contact HR to assign employees to your team.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Employee selector */}
              <div>
                <label className="flex items-center gap-1.5 mb-1.5 text-[#4A5568]" style={{ fontSize: "0.8rem", fontWeight: 500 }}>
                  <Users size={12} /> Select Employee
                </label>
                <select
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-xl bg-white focus:outline-none focus:border-[#2D5A39] focus:ring-2 focus:ring-[#2D5A39]/10"
                  value={employeeId}
                  onChange={(e) => {
                    setEmployeeId(e.target.value);
                    const emp = team.find((t) => t.id === e.target.value);
                    setCompetency(emp?.competency ?? "");
                  }}
                >
                  {team.map((t) => (
                    <option key={t.id} value={t.id}>{t.name} ({t.id})</option>
                  ))}
                </select>
              </div>

              {/* Employee info card */}
              {selectedEmp && (
                <div className="bg-[#F7FAFC] border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#2D5A39] rounded-full flex items-center justify-center text-white flex-shrink-0"
                    style={{ fontWeight: 700, fontSize: "0.82rem" }}>
                    {selectedEmp.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                  </div>
                  <div>
                    <div className="text-[#2D5A39]" style={{ fontWeight: 700, fontSize: "0.9rem" }}>{selectedEmp.name}</div>
                    <div className="text-[#4A5568]" style={{ fontSize: "0.75rem" }}>
                      {selectedEmp.position} · {selectedEmp.department}
                    </div>
                    <div className="text-[#4A5568]" style={{ fontSize: "0.72rem" }}>
                      {selectedEmp.id} · Grade {selectedEmp.grade}
                    </div>
                  </div>
                </div>
              )}

              {/* Competency */}
              <div>
                <label className="flex items-center gap-1.5 mb-1.5 text-[#4A5568]" style={{ fontSize: "0.8rem", fontWeight: 500 }}>
                  <BookOpen size={12} /> Competency Area
                </label>
                <input
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:border-[#2D5A39] focus:ring-2 focus:ring-[#2D5A39]/10"
                  value={competency}
                  onChange={(e) => setCompetency(e.target.value)}
                  placeholder="e.g. Software Engineering"
                />
              </div>

              {/* Quarter */}
              <div>
                <label className="flex items-center gap-1.5 mb-1.5 text-[#4A5568]" style={{ fontSize: "0.8rem", fontWeight: 500 }}>
                  <Calendar size={12} /> Training Quarter
                </label>
                <select
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-xl bg-white focus:outline-none focus:border-[#2D5A39] focus:ring-2 focus:ring-[#2D5A39]/10"
                  value={quarter}
                  onChange={(e) => setQuarter(e.target.value)}
                >
                  {["Q1-2026", "Q2-2026", "Q3-2026", "Q4-2026"].map((q) => (
                    <option key={q}>{q}</option>
                  ))}
                </select>
              </div>

              {/* Info notice */}
              <div className="bg-[#2D5A39]/5 border border-[#2D5A39]/20 rounded-xl p-3 flex items-start gap-2">
                <span className="text-[#2D5A39] text-sm flex-shrink-0 mt-0.5">ℹ</span>
                <p className="text-[#2D5A39]" style={{ fontSize: "0.75rem" }}>
                  The employee will be notified to complete training details. The request then goes through AI review and management approval.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 border border-slate-300 rounded-xl text-[#4A5568] hover:bg-slate-50 transition-colors"
            style={{ fontSize: "0.88rem" }}>
            Cancel
          </button>
          <button onClick={create} disabled={team.length === 0}
            className="flex-1 py-2.5 bg-[#2D5A39] text-white rounded-xl hover:bg-[#1F4128] disabled:opacity-50 flex items-center justify-center gap-2 shadow-md transition-colors"
            style={{ fontWeight: 700, fontSize: "0.88rem" }}>
            <UserPlus size={15} />
            Create Nomination
          </button>
        </div>
      </div>
    </div>
  );
}
