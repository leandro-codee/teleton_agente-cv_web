'use client'

import React from 'react'
import NotificationCenter from '@/components/dashboard/NotificationCenter'
import { useNotifications } from '@/hooks/useNotifications'
import { Button } from '@/components/ui/button'
import { Bell, CheckCircle2 } from 'lucide-react'

const NotificationsPage = () => {
  const { notifications, markAsRead, unreadCount } = useNotifications()

  const handleMarkAllAsRead = () => {
    const unreadNotifications = notifications.filter(n => !n.is_read)
    unreadNotifications.forEach(notification => {
      markAsRead(notification.id)
    })
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Bell className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">Centro de Notificaciones</h1>
            <p className="text-gray-600">
              Mantente al día con el estado de tus procesamientos
            </p>
          </div>
        </div>
        {unreadCount > 0 && (
          <Button
            onClick={handleMarkAllAsRead}
            variant="outline"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Marcar todas como leídas
          </Button>
        )}
      </div>

      <NotificationCenter />
    </div>
  )
}

export default NotificationsPage