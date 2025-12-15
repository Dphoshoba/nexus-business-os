
import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Video, MoreHorizontal, Clock, Settings2, Plus, Calendar as CalendarIcon, User, MapPin } from 'lucide-react';
import { Button, Card, SectionHeader, Tabs, Modal, Input, Badge } from '../components/ui/Primitives';
import { Service, Appointment } from '../types';
import { useNotifications } from '../components/ui/NotificationSystem';
import { useData } from '../context/DataContext';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const Bookings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Calendar');
  const { services, addService, appointments, addAppointment } = useData();
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const { addNotification } = useNotifications();

  // --- Calendar State ---
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'Month' | 'Week' | 'Day'>('Month');
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Form states for modals
  const [newSession, setNewSession] = useState({ client: '', type: 'Strategy Session', date: '', time: '' });
  const [newService, setNewService] = useState({ name: '', duration: '60', price: '100' });

  // --- Helpers ---
  const parseMockDate = (dateStr: string) => {
      const today = new Date();
      if (dateStr === 'Today') return today;
      if (dateStr === 'Tomorrow') {
          const d = new Date(today);
          d.setDate(d.getDate() + 1);
          return d;
      }
      return new Date(dateStr);
  };

  const isSameDate = (d1: Date, d2: Date) => {
      return d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
  };

  const getAppointmentsForDate = (date: Date) => {
      return appointments.filter(a => {
          const aDate = parseMockDate(a.date);
          return isSameDate(aDate, date);
      });
  };

  const getStartDate = () => {
      const d = new Date(currentDate);
      if (viewMode === 'Month') {
          d.setDate(1);
          const day = d.getDay();
          d.setDate(d.getDate() - day); // Go back to Sunday
          return d;
      } else if (viewMode === 'Week') {
          const day = d.getDay();
          d.setDate(d.getDate() - day);
          return d;
      }
      return d; // Day view
  };

  const calendarDays = useMemo(() => {
      const start = getStartDate();
      const days = [];
      const count = viewMode === 'Month' ? 42 : viewMode === 'Week' ? 7 : 1; 

      for (let i = 0; i < count; i++) {
          const d = new Date(start);
          d.setDate(d.getDate() + i);
          days.push(d);
      }
      return days;
  }, [currentDate, viewMode]);

  const navigate = (direction: 'prev' | 'next') => {
      const d = new Date(currentDate);
      const modifier = direction === 'next' ? 1 : -1;
      
      if (viewMode === 'Month') {
          d.setMonth(d.getMonth() + modifier);
      } else if (viewMode === 'Week') {
          d.setDate(d.getDate() + (modifier * 7));
      } else {
          d.setDate(d.getDate() + modifier);
      }
      setCurrentDate(d);
  };

  // --- Handlers ---
  const handleDateClick = (date: Date) => {
      setSelectedDate(date);
      if (viewMode === 'Month') {
          // Optional: switch to day view or just update sidebar
          // setViewMode('Day'); 
          // setCurrentDate(date);
      }
  };

  const openSessionModal = () => {
      const dateStr = selectedDate.toISOString().split('T')[0];
      setNewSession(prev => ({ ...prev, date: dateStr }));
      setIsSessionModalOpen(true);
  };

  const handleCreateSession = (e: React.FormEvent) => {
      e.preventDefault();
      const appointment: Appointment = {
          id: Date.now().toString(),
          clientName: newSession.client,
          type: newSession.type as any,
          date: newSession.date, // Store as ISO string usually, but sticking to simple string for mock consistency
          time: newSession.time,
          status: 'Pending'
      };
      addAppointment(appointment);
      setIsSessionModalOpen(false);
      setNewSession({ client: '', type: 'Strategy Session', date: '', time: '' });
      addNotification({ title: 'Session Scheduled', message: 'The appointment has been added to your calendar.', type: 'success' });
  };

  const handleCreateService = (e: React.FormEvent) => {
      e.preventDefault();
      const service: Service = {
          id: Date.now().toString(),
          name: newService.name,
          duration: parseInt(newService.duration),
          price: parseInt(newService.price),
          currency: 'USD',
          active: true
      };
      addService(service);
      setIsServiceModalOpen(false);
      setNewService({ name: '', duration: '60', price: '100' });
      addNotification({ title: 'Service Created', message: 'New service type is now available.', type: 'success' });
  };

  const selectedDayAppointments = getAppointmentsForDate(selectedDate);

  const formatHeaderDate = () => {
      if (viewMode === 'Day') return currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="h-full flex flex-col gap-6">
      <SectionHeader 
        title="Bookings" 
        subtitle="Manage your schedule, appointments and services."
        action={<Button icon={Video} size="sm" onClick={() => setIsSessionModalOpen(true)}>New Session</Button>}
      />

      <Tabs 
        tabs={['Calendar', 'Services']} 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />

      {activeTab === 'Calendar' && (
        <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
            {/* Calendar Grid */}
            <Card className="flex-1 flex flex-col overflow-hidden" padding="p-0">
                {/* Calendar Toolbar */}
                <div className="p-4 border-b border-border dark:border-border-dark flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h2 className="text-lg font-bold text-text-primary dark:text-text-primary-dark min-w-[140px]">{formatHeaderDate()}</h2>
                        <div className="flex gap-1 border border-border dark:border-border-dark rounded-md p-0.5 bg-surface-subtle dark:bg-surface-subtle-dark">
                            <button onClick={() => navigate('prev')} className="p-1 hover:bg-white dark:hover:bg-surface-dark hover:shadow-sm rounded-sm transition-all text-text-secondary dark:text-text-secondary-dark">
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button onClick={() => setCurrentDate(new Date())} className="px-2 text-xs font-medium hover:bg-white dark:hover:bg-surface-dark hover:shadow-sm rounded-sm transition-all text-text-secondary dark:text-text-secondary-dark">
                                Today
                            </button>
                            <button onClick={() => navigate('next')} className="p-1 hover:bg-white dark:hover:bg-surface-dark hover:shadow-sm rounded-sm transition-all text-text-secondary dark:text-text-secondary-dark">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    <div className="flex bg-surface-muted dark:bg-surface-muted-dark p-1 rounded-lg border border-border dark:border-border-dark">
                        {['Month', 'Week', 'Day'].map((m) => (
                            <button 
                                key={m}
                                onClick={() => setViewMode(m as any)}
                                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                                    viewMode === m 
                                    ? 'bg-white dark:bg-surface-dark shadow-sm text-text-primary dark:text-text-primary-dark' 
                                    : 'text-text-secondary dark:text-text-secondary-dark hover:text-text-primary dark:hover:text-text-primary-dark'
                                }`}
                            >
                                {m}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid Header */}
                <div className="grid grid-cols-7 border-b border-border dark:border-border-dark">
                    {viewMode !== 'Day' && DAYS.map(day => (
                        <div key={day} className="py-2 text-center text-[10px] font-bold text-text-tertiary uppercase tracking-wider bg-surface-subtle dark:bg-surface-subtle-dark border-r last:border-r-0 border-border dark:border-border-dark">
                            {day}
                        </div>
                    ))}
                    {viewMode === 'Day' && (
                        <div className="py-2 text-center text-[10px] font-bold text-text-tertiary uppercase tracking-wider bg-surface-subtle dark:bg-surface-subtle-dark w-full">
                            {DAYS[currentDate.getDay()]}
                        </div>
                    )}
                </div>

                {/* Grid Body */}
                <div className={`flex-1 bg-surface-subtle/30 dark:bg-surface-subtle-dark/10 overflow-y-auto ${viewMode === 'Day' ? 'block' : 'grid grid-cols-7'} ${viewMode === 'Month' ? 'grid-rows-6' : ''}`}>
                    {viewMode === 'Day' ? (
                        // Day View Layout
                        <div className="flex h-full">
                            {/* Time Column */}
                            <div className="w-16 border-r border-border dark:border-border-dark bg-surface-subtle dark:bg-surface-subtle-dark">
                                {Array.from({ length: 13 }, (_, i) => i + 8).map(hour => (
                                    <div key={hour} className="h-20 border-b border-border dark:border-border-dark text-[10px] text-text-tertiary p-1 text-center relative">
                                        <span className="-top-2 relative bg-surface-subtle dark:bg-surface-subtle-dark px-1">
                                            {hour > 12 ? hour - 12 : hour} {hour >= 12 ? 'PM' : 'AM'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            {/* Events Column */}
                            <div className="flex-1 relative">
                                {Array.from({ length: 13 }, (_, i) => i + 8).map(hour => (
                                    <div key={hour} className="h-20 border-b border-border/50 dark:border-border-dark/50"></div>
                                ))}
                                {/* Render Events Absolute */}
                                {getAppointmentsForDate(currentDate).map((apt, idx) => (
                                    <div 
                                        key={apt.id} 
                                        className="absolute left-2 right-2 p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800 text-xs shadow-sm overflow-hidden hover:z-10 hover:shadow-md transition-all cursor-pointer"
                                        style={{ 
                                            top: `${(parseInt(apt.time) - 8) * 80 + 10}px`, // Simple mapping, assuming format "10:00 AM" starts with int
                                            height: '70px'
                                        }}
                                    >
                                        <div className="font-bold text-primary-700 dark:text-primary-300">{apt.type}</div>
                                        <div className="text-primary-600 dark:text-primary-400">{apt.clientName}</div>
                                        <div className="absolute top-2 right-2 text-[10px] text-primary-500">{apt.time}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        // Month & Week View
                        calendarDays.map((date, idx) => {
                            const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                            const isSelected = isSameDate(date, selectedDate);
                            const isToday = isSameDate(date, new Date());
                            const dayEvents = getAppointmentsForDate(date);

                            return (
                                <div 
                                    key={idx} 
                                    onClick={() => handleDateClick(date)}
                                    className={`
                                        border-b border-r border-border dark:border-border-dark p-2 min-h-[100px] transition-colors relative group cursor-pointer
                                        ${!isCurrentMonth && viewMode === 'Month' ? 'bg-surface-subtle/50 dark:bg-surface-subtle-dark/30 text-text-tertiary' : 'bg-surface dark:bg-surface-dark hover:bg-surface-subtle dark:hover:bg-surface-muted-dark'}
                                        ${isSelected ? 'ring-2 ring-inset ring-primary-500 bg-primary-50/10' : ''}
                                    `}
                                >
                                    <div className="flex justify-between items-start">
                                        <span className={`
                                            text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full mb-1
                                            ${isToday ? 'bg-primary-600 text-white shadow-sm' : 'text-text-secondary dark:text-text-secondary-dark'}
                                        `}>
                                            {date.getDate()}
                                        </span>
                                        {dayEvents.length > 0 && (
                                            <span className="text-[10px] font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 px-1.5 rounded-full">
                                                {dayEvents.length}
                                            </span>
                                        )}
                                    </div>
                                    
                                    <div className="space-y-1 mt-1">
                                        {dayEvents.slice(0, 3).map((event, i) => (
                                            <div key={i} className="group/event p-1 bg-surface-muted dark:bg-surface-muted-dark border border-border dark:border-border-dark rounded text-[10px] truncate hover:border-primary-300 dark:hover:border-primary-700 transition-colors flex items-center gap-1">
                                                <div className={`w-1.5 h-1.5 rounded-full ${i % 2 === 0 ? 'bg-indigo-500' : 'bg-emerald-500'}`}></div>
                                                <span className="truncate text-text-primary dark:text-text-primary-dark">{event.type}</span>
                                            </div>
                                        ))}
                                        {dayEvents.length > 3 && (
                                            <div className="text-[9px] text-text-tertiary pl-1">+ {dayEvents.length - 3} more</div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </Card>

            {/* Side Panel */}
            <div className="w-full lg:w-80 space-y-6 flex flex-col">
                <Card className="flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex flex-col">
                            <h3 className="font-semibold text-text-primary dark:text-text-primary-dark">Schedule</h3>
                            <p className="text-xs text-text-secondary dark:text-text-secondary-dark">
                                {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                            </p>
                        </div>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                            <MoreHorizontal className="w-4 h-4" />
                        </Button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto space-y-4">
                        {selectedDayAppointments.length > 0 ? (
                            <div className="relative pl-4 space-y-6 border-l border-border dark:border-border-dark ml-1.5 py-2">
                                {selectedDayAppointments.map((apt, i) => (
                                    <div key={apt.id} className="relative">
                                        <div className={`absolute -left-[21px] top-3 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-surface-dark ring-1 ${i % 2 === 0 ? 'bg-indigo-500 ring-indigo-100 dark:ring-indigo-900' : 'bg-emerald-500 ring-emerald-100 dark:ring-emerald-900'}`}></div>
                                        <div className="group bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-lg p-3 shadow-sm hover:border-primary-300 dark:hover:border-primary-700 transition-all cursor-pointer">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="text-sm font-semibold text-text-primary dark:text-text-primary-dark">{apt.type}</h4>
                                                <Badge variant={apt.status === 'Confirmed' ? 'success' : 'warning'} className="text-[9px] px-1.5 py-0">
                                                    {apt.status}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-text-secondary dark:text-text-secondary-dark flex items-center gap-1.5 mb-3">
                                                <Clock className="w-3.5 h-3.5 text-text-tertiary" /> {apt.time}
                                            </p>
                                            <div className="flex items-center justify-between pt-2 border-t border-border/50 dark:border-border-dark/50">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-indigo-400 to-cyan-400 text-[9px] flex items-center justify-center font-bold text-white shadow-sm">
                                                        {apt.clientName.charAt(0)}
                                                    </div>
                                                    <span className="text-xs text-text-secondary dark:text-text-secondary-dark">{apt.clientName}</span>
                                                </div>
                                                <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-surface-muted dark:hover:bg-surface-muted-dark rounded">
                                                    <Video className="w-3 h-3 text-primary-600" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-48 text-center border-2 border-dashed border-border dark:border-border-dark rounded-xl bg-surface-subtle/50 dark:bg-surface-subtle-dark/50">
                                <CalendarIcon className="w-8 h-8 text-text-tertiary mb-2 opacity-50" />
                                <p className="text-sm text-text-secondary dark:text-text-secondary-dark font-medium">No sessions</p>
                                <p className="text-xs text-text-tertiary mt-1">Free day!</p>
                                <Button size="sm" variant="ghost" className="mt-4" onClick={openSessionModal}>Add Event</Button>
                            </div>
                        )}
                    </div>
                    
                    <div className="pt-4 border-t border-border dark:border-border-dark mt-4">
                        <Button className="w-full" onClick={openSessionModal}>Book Session</Button>
                    </div>
                </Card>
            </div>
        </div>
      )}

      {activeTab === 'Services' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {services.map(service => (
                  <Card key={service.id} className="group relative hover:border-primary-200 dark:hover:border-primary-700 transition-colors">
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                           <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full"><Settings2 className="w-4 h-4" /></Button>
                      </div>
                      <div className="flex items-start justify-between mb-4">
                          <div className={`p-3 rounded-xl ${service.active ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400' : 'bg-surface-muted text-text-tertiary dark:bg-surface-muted-dark'}`}>
                              <Video className="w-6 h-6" />
                          </div>
                      </div>
                      <h3 className="text-base font-bold text-text-primary dark:text-text-primary-dark">{service.name}</h3>
                      <div className="flex items-center gap-2 mt-2 text-sm text-text-secondary dark:text-text-secondary-dark">
                          <Clock className="w-4 h-4" />
                          <span>{service.duration} mins</span>
                          <span className="text-text-tertiary">•</span>
                          <span className="font-medium text-text-primary dark:text-text-primary-dark">{service.price === 0 ? 'Free' : `${service.currency} ${service.price}`}</span>
                      </div>
                      <div className="mt-4 pt-4 border-t border-border dark:border-border-dark flex items-center justify-between">
                           <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                               service.active 
                               ? 'bg-green-50 text-green-700 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30' 
                               : 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                           }`}>
                               {service.active ? 'Active' : 'Draft'}
                           </span>
                           <Button variant="ghost" size="sm" className="text-xs h-7">Copy Link</Button>
                      </div>
                  </Card>
              ))}
              <button 
                onClick={() => setIsServiceModalOpen(true)}
                className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border dark:border-border-dark rounded-xl hover:border-primary-300 hover:bg-primary-50/10 dark:hover:bg-primary-900/10 transition-all gap-2 text-text-secondary dark:text-text-secondary-dark hover:text-primary-600 dark:hover:text-primary-400 min-h-[200px]"
              >
                <div className="w-12 h-12 rounded-full bg-surface-muted dark:bg-surface-muted-dark flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Plus className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium">Add New Service</span>
             </button>
          </div>
      )}

      {/* --- Modals --- */}
      <Modal 
        isOpen={isSessionModalOpen} 
        onClose={() => setIsSessionModalOpen(false)} 
        title="Schedule New Session"
      >
          <form onSubmit={handleCreateSession} className="space-y-4">
              <div className="space-y-1.5">
                  <label className="text-xs font-medium text-text-secondary">Client</label>
                  <Input 
                    placeholder="Client Name" 
                    value={newSession.client}
                    onChange={(e) => setNewSession({...newSession, client: e.target.value})}
                    required 
                  />
              </div>
              <div className="space-y-1.5">
                  <label className="text-xs font-medium text-text-secondary">Service Type</label>
                  <select 
                    className="w-full h-[38px] px-3 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-lg text-sm text-text-primary dark:text-text-primary-dark focus:ring-2 focus:ring-primary-100 outline-none"
                    value={newSession.type}
                    onChange={(e) => setNewSession({...newSession, type: e.target.value})}
                  >
                      {services.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                      <label className="text-xs font-medium text-text-secondary">Date</label>
                      <Input 
                        type="date" 
                        value={newSession.date}
                        onChange={(e) => setNewSession({...newSession, date: e.target.value})}
                        required 
                      />
                  </div>
                  <div className="space-y-1.5">
                      <label className="text-xs font-medium text-text-secondary">Time</label>
                      <Input 
                        type="time" 
                        value={newSession.time}
                        onChange={(e) => setNewSession({...newSession, time: e.target.value})}
                        required 
                      />
                  </div>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                 <Button type="button" variant="ghost" onClick={() => setIsSessionModalOpen(false)}>Cancel</Button>
                 <Button type="submit">Schedule</Button>
             </div>
          </form>
      </Modal>

      <Modal 
        isOpen={isServiceModalOpen} 
        onClose={() => setIsServiceModalOpen(false)} 
        title="Create Service"
      >
          <form onSubmit={handleCreateService} className="space-y-4">
              <div className="space-y-1.5">
                  <label className="text-xs font-medium text-text-secondary">Service Name</label>
                  <Input 
                    placeholder="e.g. 1-on-1 Coaching" 
                    value={newService.name}
                    onChange={(e) => setNewService({...newService, name: e.target.value})}
                    required 
                  />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                      <label className="text-xs font-medium text-text-secondary">Duration (min)</label>
                      <Input 
                        type="number" 
                        placeholder="60" 
                        value={newService.duration}
                        onChange={(e) => setNewService({...newService, duration: e.target.value})}
                        required 
                      />
                  </div>
                  <div className="space-y-1.5">
                      <label className="text-xs font-medium text-text-secondary">Price ($)</label>
                      <Input 
                        type="number" 
                        placeholder="100" 
                        value={newService.price}
                        onChange={(e) => setNewService({...newService, price: e.target.value})}
                        required 
                      />
                  </div>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                 <Button type="button" variant="ghost" onClick={() => setIsServiceModalOpen(false)}>Cancel</Button>
                 <Button type="submit">Create Service</Button>
             </div>
          </form>
      </Modal>
    </div>
  );
};
