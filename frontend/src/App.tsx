import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { AppShell } from '@/components/AppShell'
import LoginPage from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import ProfilePage from '@/pages/Profile'
import UsersPage from '@/pages/admin/Users'
import FieldsList from '@/pages/fields/FieldsList'
import FieldDetail from '@/pages/fields/FieldDetail'
import PlantsList from '@/pages/plants/PlantsList'
import PlantDetail from '@/pages/plants/PlantDetail'
import { tokenStore } from '@/lib/api'

const AuthGuard = () => {
  if (!tokenStore.getAccess() || !tokenStore.getUser()) {
    return <Navigate to="/login" replace />
  }
  return <AppShell />
}

const AdminGuard = () => {
  const user = tokenStore.getUser()
  if (user?.role !== "admin") {
    return <Navigate to="/" replace />
  }
  return <Outlet />
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<AuthGuard />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/profile" element={<ProfilePage />} />
        
        <Route element={<AdminGuard />}>
          <Route path="/users" element={<UsersPage />} />
        </Route>

        <Route path="/fields" element={<FieldsList />} />
        <Route path="/fields/:fieldId" element={<FieldDetail />} />
        <Route path="/plants" element={<PlantsList />} />
        <Route path="/plants/:plantId" element={<PlantDetail />} />
      </Route>
    </Routes>
  )
}

export default App
