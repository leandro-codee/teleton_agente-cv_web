import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useNotifications } from '@/hooks/useNotifications'
import { Bell, CheckCircle, XCircle, Clock, Trash2, ExternalLink } from 'lucide-react'
import { useRouter } from 'next/navigation'

const NotificationCenter = () => {
  const router = useRouter()
  const { notifications, markAsRead, deleteNotification, isLoading } = useNotifications()

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'processing_completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'processing_failed':
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <Bell className="h-5 w-5 text-blue-600" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'processing_completed':
        return 'bg-green-50 border-green-200'
      case 'processing_failed':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-blue-50 border-blue-200'
    }
  }

  const handleNotificationClick = (notification: any) => {
    if (!notification.is_read) {
      markAsRead(notification.id)
    }
    
    if (notification.action_url) {
      router.push(notification.action_url)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const unreadNotifications = notifications.filter(n => !n.is_read)
  const readNotifications = notifications.filter(n => n.is_read)

  return (
    <div className="space-y-6">
      {/* Notificaciones no leídas */}
      {unreadNotifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Notificaciones Nuevas ({unreadNotifications.length})
            </CardTitle>
            <CardDescription>
              Tienes {unreadNotifications.length} notificación{unreadNotifications.length > 1 ? 'es' : ''} sin leer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {unreadNotifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors hover:bg-gray-50 ${getNotificationColor(notification.type)}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start space-x-3">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{notification.title}</h4>
                        <Badge variant="default" className="text-xs">
                          Nuevo
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-gray-500">
                          {formatDate(notification.created_at)}
                        </p>
                        <div className="flex space-x-1">
                          {notification.action_url && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleNotificationClick(notification)
                              }}
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteNotification(notification.id)
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notificaciones leídas */}
      {readNotifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              Notificaciones Anteriores ({readNotifications.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {readNotifications.map((notification) => (
                <div 
                  key={notification.id}
                  className="p-4 rounded-lg border bg-gray-50 opacity-75"
                >
                  <div className="flex items-start space-x-3">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{notification.title}</h4>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteNotification(notification.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {formatDate(notification.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estado vacío */}
      {notifications.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Bell className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              No tienes notificaciones
            </h3>
            <p className="text-sm text-gray-500">
              Las notificaciones aparecerán aquí cuando tengas actividad en tus procesamientos
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default NotificationCenter