'use client';
import { useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';

export function useStudyAlarm() {
    const { user } = useAuth();
    const lastAlerted = useRef<string | null>(null);

    useEffect(() => {
        if (!user) return;

        const checkSchedule = async () => {
            try {
                const res = await fetch('/api/user/study-schedules');
                if (!res.ok) return;
                const schedules = await res.json();

                const now = new Date();
                const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
                const currentTime = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

                const activeTask = schedules.find((s: any) => 
                    s.is_alarm_enabled && 
                    s.day_of_week === currentDay && 
                    s.start_time === currentTime
                );

                if (activeTask && lastAlerted.current !== `${activeTask.id}_${currentTime}`) {
                    // Trigger Alarm
                    if ('Notification' in window && Notification.permission === 'granted') {
                        new Notification(`Study Time! 📚`, {
                            body: `It's time to study ${activeTask.subject_code}. Let's go!`,
                            icon: '/icon.png'
                        });
                    } else {
                        alert(`⏰ Study Time: It's time for ${activeTask.subject_code}!`);
                    }
                    lastAlerted.current = `${activeTask.id}_${currentTime}`;
                }
            } catch (err) {
                console.error('Alarm check failed:', err);
            }
        };

        // Check every 30 seconds
        const interval = setInterval(checkSchedule, 30000);

        // Request permission on mount
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }

        return () => clearInterval(interval);
    }, [user]);
}
