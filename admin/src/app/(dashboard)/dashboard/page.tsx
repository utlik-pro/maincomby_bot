'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Users,
  Calendar,
  Heart,
  Building2,
  Activity,
  Blocks,
  Palette,
  UserPlus,
  Trophy,
  type LucideIcon,
} from 'lucide-react'
import { getDashboardStats } from '@/lib/api'
import type { DashboardStats } from '@/lib/types'
import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getDashboardStats()
        setStats(data)
      } catch (error) {
        console.error('Failed to load stats:', error)
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [])

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers ?? 0,
      description: 'All registered users',
      icon: Users,
      color: 'text-blue-500',
    },
    {
      title: 'Total Events',
      value: stats?.totalEvents ?? 0,
      description: 'Events created',
      icon: Calendar,
      color: 'text-green-500',
    },
    {
      title: 'Total Matches',
      value: stats?.totalMatches ?? 0,
      description: 'Successful connections',
      icon: Heart,
      color: 'text-pink-500',
    },
    {
      title: 'Active Today',
      value: stats?.activeToday ?? 0,
      description: 'Users active in 24h',
      icon: Activity,
      color: 'text-yellow-500',
    },
    {
      title: 'Tenants',
      value: stats?.tenantCount ?? 0,
      description: 'Partner communities',
      icon: Building2,
      color: 'text-purple-500',
    },
  ]

  const quickActions = [
    { href: '/tenants/new', icon: Building2, label: 'Create New Tenant' },
    { href: '/builder', icon: Blocks, label: 'Open Block Builder' },
    { href: '/themes', icon: Palette, label: 'Edit Themes' },
    { href: '/users', icon: Users, label: 'Manage Users' },
  ]

  const recentActivity = [
    { icon: UserPlus, title: 'New user registered', time: '2 minutes ago', color: 'text-green-500' },
    { icon: Heart, title: 'New match created', time: '15 minutes ago', color: 'text-pink-500' },
    { icon: Calendar, title: 'Event registration', time: '1 hour ago', color: 'text-blue-500' },
    { icon: Trophy, title: 'Achievement unlocked', time: '2 hours ago', color: 'text-yellow-500' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to God Mode. Overview of your platform.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
              )}
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            {quickActions.map((action) => (
              <QuickActionButton
                key={action.href}
                href={action.href}
                icon={action.icon}
                label={action.label}
              />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest platform events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((item, index) => (
                <ActivityItem
                  key={index}
                  icon={item.icon}
                  title={item.title}
                  time={item.time}
                  color={item.color}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function QuickActionButton({
  href,
  icon: Icon,
  label,
}: {
  href: string
  icon: LucideIcon
  label: string
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <span className="font-medium">{label}</span>
    </Link>
  )
}

function ActivityItem({
  icon: Icon,
  title,
  time,
  color,
}: {
  icon: LucideIcon
  title: string
  time: string
  color: string
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
        <Icon className={`h-4 w-4 ${color}`} />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{time}</p>
      </div>
    </div>
  )
}
