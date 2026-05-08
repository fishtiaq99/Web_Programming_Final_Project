import { useState, useEffect } from 'react';
import { Users, FileText, Flag, MessageSquare, Bell, Check, BarChart3, UserX, UserCheck, Eye, Trash2, X, AlertTriangle } from 'lucide-react';
import api from '../api/axios';

const tabs = ['Stats', 'Users', 'Reports', 'Inquiries', 'Alerts', 'Audit Log'];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('Stats');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [auditLog, setAuditLog] = useState([]);
  const [newAlert, setNewAlert] = useState({ message: '', alertType: 'ANNOUNCEMENT' });
  const [answerForm, setAnswerForm] = useState({});
  const [reportFilter, setReportFilter] = useState('ALL');
  const [inquiryFilter, setInquiryFilter] = useState('ALL');
  // Report detail modal
  const [reportModal, setReportModal] = useState(null); // holds the report object
  const [reportContent, setReportContent] = useState(null); // holds fetched post/comment
  const [contentLoading, setContentLoading] = useState(false);

  useEffect(() => {
    api.get('/admin/stats')
      .then(r => setStats(r.data))
      .catch(err => console.error('Stats error:', err));
  }, []);

  useEffect(() => {
  if (activeTab === 'Users') api.get('/admin/users').then(r => setUsers(r.data)).catch(console.error);
  if (activeTab === 'Reports') api.get(`/admin/reports?filter=${reportFilter}`).then(r => setReports(r.data)).catch(console.error);
  if (activeTab === 'Inquiries') api.get(`/admin/inquiries?filter=${inquiryFilter}`).then(r => setInquiries(r.data)).catch(console.error);
  if (activeTab === 'Alerts') api.get('/admin/alerts').then(r => setAlerts(r.data)).catch(console.error);
  if (activeTab === 'Audit Log') api.get('/admin/audit').then(r => setAuditLog(r.data)).catch(console.error);
  }, [activeTab, reportFilter, inquiryFilter]);

  const toggleUser = async (id) => {
    try {
      await api.patch(`/admin/users/${id}/toggle`);
      setUsers(prev => prev.map(x =>
        x.userid === id ? { ...x, isactive: !x.isactive } : x
      ));
    } catch (err) { console.error(err); }
  };

  const resolveReport = async (id) => {
    try {
      await api.patch(`/admin/reports/${id}/resolve`, { actionTaken: 'REVIEWED', notes: 'Reviewed by admin' });
      setReports(prev => prev.map(x =>
        x.reportid === id ? { ...x, statusflag: 'RESOLVED' } : x
      ));
    } catch (err) { console.error(err); }
  };

  const openReportModal = async (report) => {
    setReportModal(report);
    setReportContent(null);
    setContentLoading(true);
    try {
      if (report.postid) {
        const res = await api.get(`/admin/content/post/${report.postid}`);
        setReportContent({ type: 'post', data: res.data });
      } else if (report.commentid) {
        const res = await api.get(`/admin/content/comment/${report.commentid}`);
        setReportContent({ type: 'comment', data: res.data });
      }
    } catch (err) {
      setReportContent({ type: 'error', data: null });
    } finally {
      setContentLoading(false);
    }
  };

  const removeContent = async () => {
    if (!reportModal) return;
    try {
      if (reportContent?.type === 'post') {
        await api.delete(`/admin/posts/${reportModal.postid}`, {
          data: { reason: `Reported: ${reportModal.reason}` }
        });
      } else if (reportContent?.type === 'comment') {
        await api.delete(`/admin/comments/${reportModal.commentid}`, {
          data: { reason: `Reported: ${reportModal.reason}` }
        });
      }
      // Also resolve the report
      await api.patch(`/admin/reports/${reportModal.reportid}/resolve`, {
        actionTaken: 'REMOVED_CONTENT',
        notes: 'Content removed by admin'
      });
      setReports(prev => prev.map(x =>
        x.reportid === reportModal.reportid ? { ...x, statusflag: 'RESOLVED' } : x
      ));
      setReportModal(null);
      setReportContent(null);
    } catch (err) {
      console.error(err);
    }
  };

  const answerInquiry = async (id) => {
    const response = answerForm[id];
    if (!response?.trim()) return;
    try {
      await api.post(`/admin/inquiries/${id}/answer`, { adminResponse: response });
      setInquiries(prev => prev.map(x =>
        x.inquiryid === id ? { ...x, statusflag: 1 } : x
      ));
      setAnswerForm(f => ({ ...f, [id]: '' }));
    } catch (err) { console.error(err); }
  };

  const createAlert = async (e) => {
    e.preventDefault();
    if (!newAlert.message.trim()) return;
    try {
      await api.post('/admin/alerts', newAlert);
      setNewAlert({ message: '', alertType: 'ANNOUNCEMENT' });
      const res = await api.get('/admin/alerts');
      setAlerts(res.data);
    } catch (err) { console.error(err); }
  };

  const statCards = stats ? [
    { label: 'Total Users', value: Number(stats.totalusers) || 0, icon: Users, color: 'text-blue-400' },
    { label: 'Total Posts', value: Number(stats.totalposts) || 0, icon: FileText, color: 'text-green-400' },
    { label: 'Pending Reports', value: Number(stats.pendingreports) || 0, icon: Flag, color: 'text-red-400' },
    { label: 'Open Inquiries', value: Number(stats.openinquiries) || 0, icon: MessageSquare, color: 'text-yellow-400' },
    { label: 'Inactive Users', value: Number(stats.inactiveusers) || 0, icon: UserX, color: 'text-gray-400' },
  ] : [];

  return (
    <div className="space-y-6">

      {/* Report Detail Modal */}
      {reportModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <AlertTriangle className="text-yellow-400" size={18} />
                <h3 className="font-bold text-sm uppercase tracking-widest text-white">
                  Reported {reportModal.postid ? 'Post' : 'Comment'}
                </h3>
              </div>
              <button
                onClick={() => { setReportModal(null); setReportContent(null); }}
                className="text-gray-500 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Report Reason */}
            <div className="px-5 py-3 bg-yellow-500/5 border-b border-yellow-500/20">
              <p className="text-xs text-yellow-400 font-bold uppercase tracking-wider mb-1">Report Reason</p>
              <p className="text-sm text-gray-300">{reportModal.reason}</p>
              <p className="text-xs text-gray-600 mt-1">
                Reported by @{reportModal.reporterusername} · {new Date(reportModal.reportdate).toLocaleDateString()}
              </p>
            </div>

            {/* Content */}
            <div className="px-5 py-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">
                {reportModal.postid ? 'Post' : 'Comment'} Content
              </p>
              {contentLoading ? (
                <div className="py-6 text-center text-gray-500 text-sm">Loading content...</div>
              ) : reportContent?.type === 'error' || !reportContent?.data ? (
                <div className="py-6 text-center text-gray-600 text-sm bg-[#1a1a1a] rounded-xl">
                  Content may have already been deleted
                </div>
              ) : (
                <div className="bg-[#1a1a1a] rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-black font-black text-xs">
                      {reportContent.data.username?.[0]?.toUpperCase()}
                    </div>
                    <span className="text-sm font-semibold text-white">@{reportContent.data.username}</span>
                    <span className="text-xs text-gray-600">
                      · {new Date(reportContent.data.creationdate).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-200 leading-relaxed">
                    {reportContent.type === 'post'
                      ? reportContent.data.contenttext
                      : reportContent.data.contenttext}
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="px-5 py-4 border-t border-white/10 flex gap-3">
              <button
                onClick={removeContent}
                disabled={!reportContent?.data}
                className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-400 disabled:opacity-40 text-white text-sm font-bold py-2.5 rounded-xl transition-colors"
              >
                <Trash2 size={14} />
                Remove {reportModal.postid ? 'Post' : 'Comment'}
              </button>
              <button
                onClick={() => { resolveReport(reportModal.reportid); setReportModal(null); setReportContent(null); }}
                className="flex-1 flex items-center justify-center gap-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 text-sm font-bold py-2.5 rounded-xl transition-colors border border-green-500/20"
              >
                <Check size={14} />
                No Action
              </button>
            </div>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-black uppercase tracking-widest mb-1 text-white">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm">Platform management & moderation</p>
      </div>

      {/* Stats Cards */}
      {stats ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {statCards.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-[#111] border border-white/10 rounded-xl p-4 text-center">
              <Icon className={`mx-auto mb-2 ${color}`} size={20} />
              <div className="text-2xl font-black text-white">{value}</div>
              <div className="text-gray-600 text-xs mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-gray-500 text-sm">Loading stats...</div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${
              activeTab === tab
                ? 'bg-orange-500 text-black'
                : 'bg-[#111] border border-white/10 text-gray-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden">

        {/* STATS */}
        {activeTab === 'Stats' && stats && (
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="text-orange-500" size={20} />
              <h2 className="font-bold text-white">Platform Overview</h2>
            </div>
            <div className="space-y-4">
              {statCards.map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={color} size={16} />
                    <span className="text-sm text-gray-400">{label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-500 rounded-full"
                        style={{ width: `${Math.min((value / (Number(stats.totalusers) || 1)) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-white w-8 text-right">{value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* USERS */}
        {activeTab === 'Users' && (
          <div className="divide-y divide-white/5">
            {users.length === 0 && <p className="p-6 text-gray-500 text-sm">No users found</p>}
            {users.map(u => (
              <div key={u.userid} className="px-5 py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-black font-black text-sm flex-shrink-0">
                    {u.username?.[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate text-white">@{u.username}</p>
                    <p className="text-gray-600 text-xs truncate">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-gray-600">{u.postcount} posts</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    u.isactive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {u.isactive ? 'Active' : 'Inactive'}
                  </span>
                  <button
                    onClick={() => toggleUser(u.userid)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      u.isactive
                        ? 'hover:bg-red-500/10 text-gray-500 hover:text-red-400'
                        : 'hover:bg-green-500/10 text-gray-500 hover:text-green-400'
                    }`}
                  >
                    {u.isactive ? <UserX size={14} /> : <UserCheck size={14} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* REPORTS */}
        {activeTab === 'Reports' && (
          <div className="divide-y divide-white/5">
            {/* Filter Bar */}
            <div className="px-5 py-3 flex gap-2 bg-[#0f0f0f]">
              {['ALL', 'PENDING', 'RESOLVED'].map(f => (
                <button
                  key={f}
                  onClick={() => setReportFilter(f)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                    reportFilter === f ? 'bg-orange-500 text-black' : 'bg-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            {reports.length === 0 && <p className="p-6 text-gray-500 text-sm">No reports found</p>}
            {reports.map(r => (
              <div key={r.reportid} className="px-5 py-4">
                <div className="flex justify-between items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-200">{r.reason}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      By @{r.reporterusername} · {new Date(r.reportdate).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-700 mt-0.5">
                      {r.postid ? `Post #${r.postid}` : `Comment #${r.commentid}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      r.statusflag === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'
                    }`}>
                      {r.statusflag}
                    </span>
                    <button
                      onClick={() => openReportModal(r)}
                      className="flex items-center gap-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs px-2.5 py-1.5 rounded-lg transition-colors"
                    >
                      <Eye size={12} /> View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* INQUIRIES */}
        {activeTab === 'Inquiries' && (
          <div className="divide-y divide-white/5">
            {/* Filter Bar */}
            <div className="px-5 py-3 flex gap-2 bg-[#0f0f0f]">
              {['ALL', 'PENDING', 'RESOLVED'].map(f => (
                <button
                  key={f}
                  onClick={() => setInquiryFilter(f)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                    inquiryFilter === f ? 'bg-orange-500 text-black' : 'bg-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            {inquiries.length === 0 && <p className="p-6 text-gray-500 text-sm">No inquiries found</p>}
            {inquiries.map(inq => (
              <div key={inq.inquiryid} className="px-5 py-4">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs text-gray-600">
                    @{inq.username} · {new Date(inq.submitdate).toLocaleDateString()}
                  </p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    inq.statusflag ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {inq.statusflag ? 'Resolved' : 'Pending'}
                  </span>
                </div>
                <p className="text-sm text-gray-200 mb-3">{inq.message}</p>
                {!inq.statusflag && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={answerForm[inq.inquiryid] || ''}
                      onChange={e => setAnswerForm({ ...answerForm, [inq.inquiryid]: e.target.value })}
                      className="flex-1 bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500/30 placeholder-gray-600"
                      placeholder="Type your response..."
                      onKeyDown={e => e.key === 'Enter' && answerInquiry(inq.inquiryid)}
                    />
                    <button
                      type="button"
                      onClick={() => answerInquiry(inq.inquiryid)}
                      className="bg-orange-500 hover:bg-orange-400 text-black text-xs font-bold px-3 py-2 rounded-lg transition-colors"
                    >
                      Reply
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ALERTS */}
        {activeTab === 'Alerts' && (
          <div className="p-5 space-y-4">
            <form onSubmit={createAlert} className="bg-[#1a1a1a] rounded-xl p-4 space-y-3">
              <h3 className="text-sm font-bold text-white">Create Alert</h3>
              <textarea
                value={newAlert.message}
                onChange={e => setNewAlert({ ...newAlert, message: e.target.value })}
                className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-sm text-white resize-none focus:outline-none focus:border-orange-500/30 placeholder-gray-600"
                rows={3}
                placeholder="Alert message..."
              />
              <div className="flex gap-2 flex-wrap">
                {['ANNOUNCEMENT', 'MAINTENANCE', 'SAFETY', 'URGENT'].map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setNewAlert({ ...newAlert, alertType: type })}
                    className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                      newAlert.alertType === type
                        ? 'bg-orange-500 text-black'
                        : 'bg-[#111] border border-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              <button type="submit" className="bg-orange-500 hover:bg-orange-400 text-black text-xs font-bold px-4 py-2 rounded-lg transition-colors">
                <Bell size={12} className="inline mr-1" />Send Alert
              </button>
            </form>
            <div className="space-y-2">
              {alerts.map(a => (
                <div key={a.alertid} className="flex justify-between items-center bg-[#1a1a1a] rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold flex-shrink-0 ${
                      a.alerttype === 'URGENT' ? 'bg-red-500/20 text-red-400' :
                      a.alerttype === 'MAINTENANCE' ? 'bg-yellow-500/20 text-yellow-400' :
                      a.alerttype === 'SAFETY' ? 'bg-orange-500/20 text-orange-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>{a.alerttype}</span>
                    <span className="text-sm text-gray-300 truncate">{a.message}</span>
                  </div>
                  <span className="text-xs text-gray-600 ml-3 flex-shrink-0">
                    {new Date(a.creationdate).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AUDIT LOG */}
        {activeTab === 'Audit Log' && (
          <div className="divide-y divide-white/5">
            {auditLog.length === 0 && <p className="p-6 text-gray-500 text-sm">No audit logs found</p>}
            {auditLog.map(log => (
              <div key={log.logid} className="px-5 py-2.5 flex items-center justify-between text-xs gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-orange-400 font-mono font-bold flex-shrink-0">{log.actiontype}</span>
                  <span className="text-gray-500 flex-shrink-0">{log.targetentity} #{log.targetid}</span>
                  <span className="text-gray-700 truncate">
                    by {log.userusername ? `@${log.userusername}` : `admin:${log.adminusername}`}
                  </span>
                </div>
                <span className="text-gray-700 flex-shrink-0">{new Date(log.timestamp).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}