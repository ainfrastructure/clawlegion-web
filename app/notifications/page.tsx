import { redirect } from 'next/navigation'

export default function NotificationsPage() {
  redirect('/audit?view=activity')
}
