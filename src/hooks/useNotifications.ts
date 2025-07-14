import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Notification } from '@/types'

export const useNotifications = () => {
  const queryClient = useQueryClient()

  const { data: notifications, refetch } = useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: () => api.getNotifications(),
    refetchInterval: 30 * 60 * 1000, // 30 minutos
    refetchIntervalInBackground: true,
  })

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) => api.markNotificationAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    }
  })

  const deleteNotificationMutation = useMutation({
    mutationFn: (notificationId: string) => api.deleteNotification(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    }
  })

  const unreadCount = notifications?.filter(n => !n.is_read).length || 0

  return {
    notifications: notifications || [],
    unreadCount,
    markAsRead: markAsReadMutation.mutate,
    deleteNotification: deleteNotificationMutation.mutate,
    isLoading: markAsReadMutation.isPending || deleteNotificationMutation.isPending,
    refetch
  }
} 