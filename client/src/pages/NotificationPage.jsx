import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/common/Card';
import { Skeleton } from '../components/common/Skeleton';
import api from '../services/api';
import { Bell, CheckCircle2 } from 'lucide-react';

export const NotificationPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications');
        setNotifications(res.data.notifications || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notification Center"
        subtitle="System notifications for procurement approvals, bid deadlines, contract expiry, and shipment delays."
      />

      {loading ? (
        <Skeleton className="h-64" />
      ) : (
        <Card className="!p-0">
          <div className="divide-y divide-slate-800">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400">No notifications found.</div>
            ) : (
              notifications.map((n) => (
                <div key={n._id} className="p-4 flex items-start justify-between hover:bg-slate-900/50 transition-colors">
                  <div className="space-y-1">
                    <div className="font-bold text-slate-200 text-xs">{n.title}</div>
                    <p className="text-xs text-slate-400">{n.message}</p>
                    <span className="text-[10px] text-slate-500 font-mono">{new Date(n.createdAt).toLocaleString()}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${n.isRead ? 'bg-slate-800 text-slate-400' : 'bg-cyan-950 text-cyan-400 border border-cyan-800'}`}>
                    {n.isRead ? 'Read' : 'New'}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>
      )}
    </div>
  );
};
