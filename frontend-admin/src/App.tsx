import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { createBrowserRouter, RouterProvider } from 'react-router'
import { AdminShell } from '@/layout/AdminShell'
import { HomePage } from '@/pages/HomePage'
import { LoginPage } from '@/pages/LoginPage'
import { UsersPage } from '@/pages/users/UsersPage'
import { GuestOnly } from '@/routes/GuestOnly'
import { RequireAuth } from '@/routes/RequireAuth'
import { wireSessionToApiClient } from '@/shared/auth/session-store'
import { ToastHost } from '@/shared/ui/ToastHost'

wireSessionToApiClient()

const router = createBrowserRouter([
  {
    path: '/login',
    element: <GuestOnly />,
    children: [
      {
        index: true,
        element: <LoginPage />,
      },
    ],
  },
  {
    path: '/',
    element: <RequireAuth />,
    children: [
      {
        element: <AdminShell />,
        children: [
          {
            index: true,
            element: <HomePage />,
          },
          {
            path: 'users',
            element: <UsersPage />,
          },
        ],
      },
    ],
  },
])

export default function App() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 6,
        },
      }}
    >
      <RouterProvider router={router} />
      <ToastHost />
    </ConfigProvider>
  )
}
