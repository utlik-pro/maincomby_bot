'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    LayoutDashboard,
    Users,
    Calendar,
    BarChart3,
    Settings,
    Bell,
    Search,
    Plus,
    MoreVertical,
    TrendingUp,
    TrendingDown,
    UserPlus,
    UserMinus,
    Eye,
    Edit,
    Trash2,
    CheckCircle,
    XCircle,
    Clock,
    DollarSign,
    Activity,
    Filter,
    Download
} from 'lucide-react'

interface AdminPhoneMockupProps {
    activeTab?: number
    onTabChange?: (tab: number) => void
}

export function AdminPhoneMockup({ activeTab: controlledTab, onTabChange }: AdminPhoneMockupProps = {}) {
    const [internalTab, setInternalTab] = useState(0)
    const activeTab = controlledTab !== undefined ? controlledTab : internalTab

    useEffect(() => {
        if (controlledTab === undefined) {
            const interval = setInterval(() => {
                setInternalTab((prev) => (prev + 1) % 4)
            }, 5000)
            return () => clearInterval(interval)
        }
    }, [controlledTab])

    const handleTabClick = (index: number) => {
        if (onTabChange) {
            onTabChange(index)
        } else {
            setInternalTab(index)
        }
    }

    return (
        <div className="relative mx-auto w-[320px] h-[650px] bg-black rounded-[55px] border-[8px] border-[#323232] shadow-2xl overflow-hidden ring-1 ring-white/20">
            {/* Dynamic Island */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[100px] h-[28px] bg-black rounded-full z-50 flex items-center justify-center gap-2 pointer-events-none">
                <div className="w-2 h-2 rounded-full bg-[#1a1a1a]"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-[#0a0a0a]"></div>
            </div>

            {/* Screen Content */}
            <div className="w-full h-full bg-[#0a0a0a] font-sans text-white relative">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="w-full h-full overflow-y-auto no-scrollbar pt-12 pb-20 px-4"
                    >
                        {activeTab === 0 && <AdminDashboardScreen />}
                        {activeTab === 1 && <AdminMembersScreen />}
                        {activeTab === 2 && <AdminEventsScreen />}
                        {activeTab === 3 && <AdminAnalyticsScreen />}
                    </motion.div>
                </AnimatePresence>

                {/* Bottom Navigation */}
                <div className="absolute bottom-0 left-0 right-0 h-[80px] bg-[#1a1a1a]/90 backdrop-blur-md border-t border-white/5 flex items-start justify-around pt-4 pb-8 z-40">
                    <AdminNavIcon icon={LayoutDashboard} label="Dashboard" active={activeTab === 0} onClick={() => handleTabClick(0)} />
                    <AdminNavIcon icon={Users} label="Members" active={activeTab === 1} onClick={() => handleTabClick(1)} />
                    <AdminNavIcon icon={Calendar} label="Events" active={activeTab === 2} onClick={() => handleTabClick(2)} />
                    <AdminNavIcon icon={BarChart3} label="Analytics" active={activeTab === 3} onClick={() => handleTabClick(3)} />
                </div>
            </div>

            {/* Home Indicator */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/20 rounded-full z-50 pointer-events-none"></div>
        </div>
    )
}

function AdminNavIcon({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center gap-1 transition-colors ${active ? 'text-[#c8ff00]' : 'text-gray-500 hover:text-gray-300'}`}
        >
            <Icon size={22} />
            <span className="text-[9px] font-medium">{label}</span>
        </button>
    )
}

function AdminDashboardScreen() {
    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider">Admin Panel</div>
                    <h1 className="text-xl font-bold">Dashboard</h1>
                </div>
                <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#1a1a1a] flex items-center justify-center">
                        <Bell size={16} className="text-gray-400" />
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-[#1a1a1a] flex items-center justify-center">
                        <Settings size={16} className="text-gray-400" />
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
                <StatCard
                    label="Total Members"
                    value="2,847"
                    trend="+12%"
                    positive
                    icon={Users}
                />
                <StatCard
                    label="Revenue"
                    value="$8,420"
                    trend="+23%"
                    positive
                    icon={DollarSign}
                />
                <StatCard
                    label="Active Events"
                    value="12"
                    trend="+3"
                    positive
                    icon={Calendar}
                />
                <StatCard
                    label="Engagement"
                    value="78%"
                    trend="-2%"
                    positive={false}
                    icon={Activity}
                />
            </div>

            {/* Recent Activity */}
            <div className="bg-[#1a1a1a] rounded-2xl p-3">
                <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold">Recent Activity</span>
                    <span className="text-[10px] text-[#c8ff00]">View all</span>
                </div>
                <div className="space-y-2">
                    <ActivityItem
                        icon={UserPlus}
                        text="New member joined"
                        time="2m ago"
                        color="text-green-400"
                    />
                    <ActivityItem
                        icon={Calendar}
                        text="Event registration"
                        time="15m ago"
                        color="text-blue-400"
                    />
                    <ActivityItem
                        icon={DollarSign}
                        text="Subscription payment"
                        time="1h ago"
                        color="text-[#c8ff00]"
                    />
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-3 gap-2">
                <QuickAction icon={UserPlus} label="Add User" />
                <QuickAction icon={Calendar} label="New Event" />
                <QuickAction icon={Download} label="Export" />
            </div>
        </div>
    )
}

function AdminMembersScreen() {
    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-xl font-bold">Members</h1>
                <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#1a1a1a] flex items-center justify-center">
                        <Search size={16} className="text-gray-400" />
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-[#c8ff00] flex items-center justify-center">
                        <Plus size={16} className="text-black" />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
                <span className="bg-[#c8ff00] text-black text-[10px] font-bold px-3 py-1 rounded-full">All</span>
                <span className="bg-[#1a1a1a] text-white text-[10px] font-medium px-3 py-1 rounded-full">Pro</span>
                <span className="bg-[#1a1a1a] text-white text-[10px] font-medium px-3 py-1 rounded-full">Light</span>
                <span className="bg-[#1a1a1a] text-white text-[10px] font-medium px-3 py-1 rounded-full">Free</span>
            </div>

            {/* Stats */}
            <div className="flex justify-between bg-[#1a1a1a] rounded-xl p-3">
                <div className="text-center">
                    <div className="text-lg font-bold text-[#c8ff00]">2,847</div>
                    <div className="text-[10px] text-gray-400">Total</div>
                </div>
                <div className="text-center">
                    <div className="text-lg font-bold text-green-400">+156</div>
                    <div className="text-[10px] text-gray-400">This month</div>
                </div>
                <div className="text-center">
                    <div className="text-lg font-bold text-purple-400">412</div>
                    <div className="text-[10px] text-gray-400">Premium</div>
                </div>
            </div>

            {/* Member List */}
            <div className="space-y-2">
                <MemberItem
                    name="Alex Petrov"
                    role="Pro Member"
                    status="active"
                    avatar="A"
                />
                <MemberItem
                    name="Maria Kim"
                    role="Light Member"
                    status="active"
                    avatar="M"
                />
                <MemberItem
                    name="John Smith"
                    role="Free Member"
                    status="pending"
                    avatar="J"
                />
                <MemberItem
                    name="Sarah Lee"
                    role="Pro Member"
                    status="active"
                    avatar="S"
                />
            </div>
        </div>
    )
}

function AdminEventsScreen() {
    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-xl font-bold">Events</h1>
                <div className="w-8 h-8 rounded-lg bg-[#c8ff00] flex items-center justify-center">
                    <Plus size={16} className="text-black" />
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2">
                <div className="bg-[#1a1a1a] rounded-xl p-2 text-center">
                    <div className="text-lg font-bold text-[#c8ff00]">12</div>
                    <div className="text-[9px] text-gray-400">Upcoming</div>
                </div>
                <div className="bg-[#1a1a1a] rounded-xl p-2 text-center">
                    <div className="text-lg font-bold text-green-400">847</div>
                    <div className="text-[9px] text-gray-400">Registered</div>
                </div>
                <div className="bg-[#1a1a1a] rounded-xl p-2 text-center">
                    <div className="text-lg font-bold text-purple-400">$4.2k</div>
                    <div className="text-[9px] text-gray-400">Revenue</div>
                </div>
            </div>

            {/* Event List */}
            <div className="space-y-3">
                <EventItem
                    title="AI Meetup 2026"
                    date="Jan 15"
                    registered={124}
                    capacity={150}
                    status="active"
                />
                <EventItem
                    title="Startup Pitch Night"
                    date="Jan 22"
                    registered={89}
                    capacity={100}
                    status="active"
                />
                <EventItem
                    title="Tech Conference"
                    date="Feb 1"
                    registered={0}
                    capacity={500}
                    status="draft"
                />
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-2xl p-3">
                <div className="text-xs font-bold text-purple-200 mb-1">This Month</div>
                <div className="flex justify-between text-[10px] text-gray-300">
                    <span>8 events completed</span>
                    <span className="text-green-400">+34% attendance</span>
                </div>
            </div>
        </div>
    )
}

function AdminAnalyticsScreen() {
    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-xl font-bold">Analytics</h1>
                <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#1a1a1a] flex items-center justify-center">
                        <Filter size={16} className="text-gray-400" />
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-[#1a1a1a] flex items-center justify-center">
                        <Download size={16} className="text-gray-400" />
                    </div>
                </div>
            </div>

            {/* Period Selector */}
            <div className="flex gap-2">
                <span className="bg-[#c8ff00] text-black text-[10px] font-bold px-3 py-1 rounded-full">Week</span>
                <span className="bg-[#1a1a1a] text-white text-[10px] font-medium px-3 py-1 rounded-full">Month</span>
                <span className="bg-[#1a1a1a] text-white text-[10px] font-medium px-3 py-1 rounded-full">Year</span>
            </div>

            {/* Chart Placeholder */}
            <div className="bg-[#1a1a1a] rounded-2xl p-3">
                <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold">Growth</span>
                    <span className="text-[10px] text-green-400">+18.2%</span>
                </div>
                {/* Fake Chart */}
                <div className="h-24 flex items-end gap-1">
                    {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                        <div
                            key={i}
                            className="flex-1 bg-gradient-to-t from-[#c8ff00] to-[#c8ff00]/30 rounded-t"
                            style={{ height: `${h}%` }}
                        />
                    ))}
                </div>
                <div className="flex justify-between mt-2 text-[8px] text-gray-500">
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span>Sat</span>
                    <span>Sun</span>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-2">
                <div className="bg-[#1a1a1a] rounded-xl p-3">
                    <div className="text-[10px] text-gray-400 mb-1">Conversion</div>
                    <div className="text-xl font-bold text-[#c8ff00]">12.4%</div>
                    <div className="text-[10px] text-green-400">+2.1%</div>
                </div>
                <div className="bg-[#1a1a1a] rounded-xl p-3">
                    <div className="text-[10px] text-gray-400 mb-1">Retention</div>
                    <div className="text-xl font-bold text-purple-400">89%</div>
                    <div className="text-[10px] text-green-400">+5%</div>
                </div>
            </div>

            {/* Top Sources */}
            <div className="bg-[#1a1a1a] rounded-2xl p-3">
                <div className="text-xs font-bold mb-2">Top Sources</div>
                <div className="space-y-2">
                    <SourceItem name="Telegram" percent={45} />
                    <SourceItem name="Referrals" percent={28} />
                    <SourceItem name="Direct" percent={27} />
                </div>
            </div>
        </div>
    )
}

// Helper Components
function StatCard({ label, value, trend, positive, icon: Icon }: { label: string, value: string, trend: string, positive: boolean, icon: any }) {
    return (
        <div className="bg-[#1a1a1a] rounded-2xl p-3">
            <div className="flex justify-between items-start mb-2">
                <Icon size={16} className="text-gray-500" />
                <span className={`text-[10px] flex items-center gap-0.5 ${positive ? 'text-green-400' : 'text-red-400'}`}>
                    {positive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                    {trend}
                </span>
            </div>
            <div className="text-xl font-bold">{value}</div>
            <div className="text-[10px] text-gray-400">{label}</div>
        </div>
    )
}

function ActivityItem({ icon: Icon, text, time, color }: { icon: any, text: string, time: string, color: string }) {
    return (
        <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full bg-white/5 flex items-center justify-center ${color}`}>
                <Icon size={12} />
            </div>
            <div className="flex-1">
                <div className="text-[11px]">{text}</div>
            </div>
            <div className="text-[10px] text-gray-500">{time}</div>
        </div>
    )
}

function QuickAction({ icon: Icon, label }: { icon: any, label: string }) {
    return (
        <div className="bg-[#1a1a1a] rounded-xl p-2 flex flex-col items-center gap-1">
            <Icon size={16} className="text-[#c8ff00]" />
            <span className="text-[9px] text-gray-300">{label}</span>
        </div>
    )
}

function MemberItem({ name, role, status, avatar }: { name: string, role: string, status: string, avatar: string }) {
    return (
        <div className="bg-[#1a1a1a] rounded-xl p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#c8ff00] to-green-500 flex items-center justify-center text-black font-bold text-sm">
                {avatar}
            </div>
            <div className="flex-1">
                <div className="text-sm font-medium">{name}</div>
                <div className="text-[10px] text-gray-400">{role}</div>
            </div>
            <div className={`w-2 h-2 rounded-full ${status === 'active' ? 'bg-green-400' : 'bg-yellow-400'}`} />
            <MoreVertical size={14} className="text-gray-500" />
        </div>
    )
}

function EventItem({ title, date, registered, capacity, status }: { title: string, date: string, registered: number, capacity: number, status: string }) {
    const progress = (registered / capacity) * 100
    return (
        <div className="bg-[#1a1a1a] rounded-xl p-3">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <div className="text-sm font-medium">{title}</div>
                    <div className="text-[10px] text-gray-400">{date}</div>
                </div>
                <span className={`text-[9px] px-2 py-0.5 rounded-full ${status === 'active' ? 'bg-green-400/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                    {status}
                </span>
            </div>
            <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-[#c8ff00] rounded-full" style={{ width: `${progress}%` }} />
                </div>
                <span className="text-[10px] text-gray-400">{registered}/{capacity}</span>
            </div>
        </div>
    )
}

function SourceItem({ name, percent }: { name: string, percent: number }) {
    return (
        <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-[#c8ff00] rounded-full" style={{ width: `${percent}%` }} />
            </div>
            <span className="text-[10px] text-gray-300 w-16">{name}</span>
            <span className="text-[10px] text-[#c8ff00] w-8 text-right">{percent}%</span>
        </div>
    )
}
