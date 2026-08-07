import { createBrowserRouter, RouterProvider } from 'react-router'
import { HomePage } from '@/pages/HomePage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '*',
    element: <HomePage />,
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
