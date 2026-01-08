'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ArrowLeft,
    Check,
    Crown,
    Shield,
    Star,
    Home,
    Users,
    Calendar,
    User,
    Bell,
    Trophy,
    Flame,
    MapPin,
    Clock,
    Heart,
    X as XIcon,
    Search,
    Filter
} from 'lucide-react'

interface PhoneMockupProps {
    activeTab?: number
    onTabChange?: (tab: number) => void
}

export function PhoneMockup({ activeTab: controlledTab, onTabChange }: PhoneMockupProps = {}) {
    const [internalTab, setInternalTab] = useState(0)
    const activeTab = controlledTab !== undefined ? controlledTab : internalTab
    const tabs = ['home', 'network', 'events', 'profile']

    useEffect(() => {
        // Only auto-rotate if not externally controlled
        if (controlledTab === undefined) {
            const interval = setInterval(() => {
                setInternalTab((prev) => (prev + 1) % tabs.length)
            }, 4000)
            return () => clearInterval(interval)
        }
    }, [controlledTab, tabs.length])

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
                        {activeTab === 0 && <MockupHomeScreen />}
                        {activeTab === 1 && <MockupNetworkScreen />}
                        {activeTab === 2 && <MockupEventsScreen />}
                        {activeTab === 3 && <MockupSubscriptionScreen />}
                    </motion.div>
                </AnimatePresence>

                {/* Bottom Navigation */}
                <div className="absolute bottom-0 left-0 right-0 h-[80px] bg-[#1a1a1a]/90 backdrop-blur-md border-t border-white/5 flex items-start justify-around pt-4 pb-8 z-40">
                    <NavIcon icon={Home} label="Home" active={activeTab === 0} onClick={() => handleTabClick(0)} />
                    <NavIcon icon={Users} label="Network" active={activeTab === 1} onClick={() => handleTabClick(1)} />
                    <NavIcon icon={Calendar} label="Events" active={activeTab === 2} onClick={() => handleTabClick(2)} />
                    <NavIcon icon={User} label="Profile" active={activeTab === 3} onClick={() => handleTabClick(3)} />
                </div>
            </div>

            {/* Home Indicator */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/20 rounded-full z-50 pointer-events-none"></div>
        </div>
    )
}

function NavIcon({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center gap-1 transition-colors ${active ? 'text-[#c8ff00]' : 'text-gray-500 hover:text-gray-300'}`}
        >
            <Icon size={24} />
            <span className="text-[10px] font-medium">{label}</span>
        </button>
    )
}

// --- Screens ---

function MockupHomeScreen() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#c8ff00] to-green-400 p-[2px]">
                        <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center overflow-hidden">
                            <span className="text-xl">👨‍💻</span>
                        </div>
                    </div>
                    <div>
                        <div className="font-bold text-lg">Alex Dev</div>
                        <div className="text-xs text-[#c8ff00] flex items-center gap-1">
                            <Star size={10} fill="#c8ff00" />
                            Member • 1250 XP
                        </div>
                    </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#1a1a1a] flex items-center justify-center relative">
                    <Bell size={20} className="text-gray-400" />
                    <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#1a1a1a] rounded-2xl p-3 text-center">
                    <div className="text-[#c8ff00] font-bold text-xl">12</div>
                    <div className="text-[10px] text-gray-400">Events</div>
                </div>
                <div className="bg-[#1a1a1a] rounded-2xl p-3 text-center">
                    <div className="text-green-400 font-bold text-xl">45</div>
                    <div className="text-[10px] text-gray-400">Matches</div>
                </div>
                <div className="bg-[#1a1a1a] rounded-2xl p-3 text-center">
                    <div className="text-yellow-400 font-bold text-xl">3</div>
                    <div className="text-[10px] text-gray-400">Medals</div>
                </div>
            </div>

            {/* Banner */}
            <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-2xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                    <Trophy size={20} />
                </div>
                <div>
                    <div className="font-bold text-sm text-purple-200">New Achievement!</div>
                    <div className="text-xs text-gray-400">You reached level 5</div>
                </div>
            </div>

            {/* Quick Actions */}
            <div>
                <h3 className="text-sm font-bold text-gray-400 mb-3">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#1a1a1a] p-4 rounded-2xl flex flex-col items-center gap-2">
                        <Flame size={24} className="text-[#c8ff00]" />
                        <span className="text-xs font-bold">Networking</span>
                    </div>
                    <div className="bg-[#1a1a1a] p-4 rounded-2xl flex flex-col items-center gap-2">
                        <Calendar size={24} className="text-[#c8ff00]" />
                        <span className="text-xs font-bold">Events</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

function MockupNetworkScreen() {
    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Networking</h1>
                <div className="bg-[#1a1a1a] p-2 rounded-xl">
                    <Filter size={20} className="text-gray-400" />
                </div>
            </div>

            {/* Swipe Card */}
            <div className="flex-1 bg-[#1a1a1a] rounded-3xl overflow-hidden border border-white/5 relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                    <div className="flex items-center gap-2 mb-2">
                        <h2 className="text-2xl font-bold">Sarah, 24</h2>
                        <span className="bg-[#c8ff00] text-black text-[10px] font-bold px-2 py-0.5 rounded-full">Designer</span>
                    </div>
                    <p className="text-gray-300 text-sm line-clamp-2 mb-4">
                        UI/UX Designer @ TechCorp. Love hiking and coffee. Looking for dev partners.
                    </p>
                    <div className="flex gap-2 text-xs text-gray-400">
                        <span className="bg-white/10 px-2 py-1 rounded-lg">Figma</span>
                        <span className="bg-white/10 px-2 py-1 rounded-lg">React</span>
                        <span className="bg-white/10 px-2 py-1 rounded-lg">+3</span>
                    </div>
                </div>
                {/* Fake Image Placeholder */}
                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                    <User size={64} className="text-gray-600" />
                </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-center gap-6 mt-6 mb-2">
                <div className="w-14 h-14 rounded-full border border-red-500/50 flex items-center justify-center text-red-500">
                    <XIcon size={24} />
                </div>
                <div className="w-14 h-14 rounded-full bg-[#c8ff00] flex items-center justify-center text-black shadow-[0_0_20px_rgba(200,255,0,0.3)]">
                    <Heart size={24} fill="black" />
                </div>
            </div>
        </div>
    )
}

function MockupEventsScreen() {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
                <h1 className="text-2xl font-bold">Events</h1>
                <Search size={20} className="text-gray-400" />
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-hidden">
                <span className="bg-[#c8ff00] text-black text-xs font-bold px-3 py-1.5 rounded-full">All</span>
                <span className="bg-[#1a1a1a] text-white text-xs font-bold px-3 py-1.5 rounded-full">Meetups</span>
                <span className="bg-[#1a1a1a] text-white text-xs font-bold px-3 py-1.5 rounded-full">Workshops</span>
            </div>

            {/* Event Card 1 */}
            <div className="bg-[#1a1a1a] rounded-2xl p-4 border border-white/5">
                <div className="flex gap-4">
                    <div className="w-12 h-12 bg-[#c8ff00]/10 rounded-xl flex items-center justify-center text-[#c8ff00] shrink-0">
                        <Calendar size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm mb-1">AI Founders Meetup</h3>
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                            <span className="flex items-center gap-1"><Clock size={10} /> 19:00</span>
                            <span className="flex items-center gap-1"><MapPin size={10} /> Minsk</span>
                        </div>
                    </div>
                </div>
                <div className="mt-3 flex justify-between items-center">
                    <div className="flex -space-x-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="w-6 h-6 rounded-full bg-gray-700 border border-[#1a1a1a]"></div>
                        ))}
                        <div className="w-6 h-6 rounded-full bg-gray-800 border border-[#1a1a1a] flex items-center justify-center text-[8px] text-gray-400">+42</div>
                    </div>
                    <button className="bg-[#c8ff00] text-black text-xs font-bold px-3 py-1.5 rounded-lg">
                        Register
                    </button>
                </div>
            </div>

            {/* Event Card 2 */}
            <div className="bg-[#1a1a1a] rounded-2xl p-4 border border-white/5 opacity-60">
                <div className="flex gap-4">
                    <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-500 shrink-0">
                        <Users size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm mb-1">Tech Networking</h3>
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                            <span className="flex items-center gap-1"><Clock size={10} /> Tomorrow</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function MockupSubscriptionScreen() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4 text-gray-400">
                <ArrowLeft size={20} />
                <span className="font-medium">Settings</span>
            </div>

            {/* Title */}
            <div>
                <h1 className="text-2xl font-bold mb-2">Subscription</h1>
                <p className="text-gray-400 text-sm">Choose your plan</p>
            </div>

            {/* Pro Plan */}
            <div className="bg-gradient-to-br from-[#c8ff00]/10 to-[#1a1a1a] rounded-2xl p-4 border border-[#c8ff00]/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-[#c8ff00]/10 blur-xl rounded-full"></div>

                <div className="flex justify-between items-start mb-3 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#c8ff00]/20 flex items-center justify-center">
                            <Crown size={20} className="text-[#c8ff00]" />
                        </div>
                        <div>
                            <div className="font-bold flex items-center gap-2">
                                Pro
                                <span className="px-1.5 py-0.5 bg-[#c8ff00] text-black text-[10px] rounded font-bold">BEST</span>
                            </div>
                            <div className="text-sm text-[#c8ff00] font-bold">$15/mo</div>
                        </div>
                    </div>
                </div>
                <ul className="space-y-2 mb-4 relative z-10">
                    <FeatureItem text="Unlimited swipes" active />
                    <FeatureItem text="5 Superlikes / day" active />
                    <FeatureItem text="Priority matching" active />
                </ul>
                <button className="w-full py-2 bg-[#c8ff00] text-black rounded-xl text-sm font-bold relative z-10 shadow-[0_0_15px_rgba(200,255,0,0.3)]">
                    Upgrade to Pro
                </button>
            </div>

            {/* Light Plan */}
            <div className="bg-[#1a1a1a] rounded-2xl p-4 border border-white/5">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#252525] flex items-center justify-center">
                            <Star size={16} className="text-yellow-400" />
                        </div>
                        <div>
                            <div className="font-bold text-sm">Light</div>
                            <div className="text-xs text-yellow-400">$5/mo</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function FeatureItem({ text, active = false }: { text: string; active?: boolean }) {
    return (
        <li className="flex items-center gap-2 text-xs">
            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${active ? 'bg-[#c8ff00]/20' : 'bg-[#252525]'}`}>
                <Check size={10} className={active ? 'text-[#c8ff00]' : 'text-gray-400'} />
            </div>
            <span className={active ? 'text-white' : 'text-gray-400'}>{text}</span>
        </li>
    )
}