import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { AppShell } from '@/components/AppShell'
import LoginPage from '@/routes/login'
import IndexPage from '@/routes/_authenticated/index'
import ProfilePage from '@/routes/_authenticated/profile'
import UsersPage from '@/routes/_authenticated/_admin/users'
import FieldsIndexPage from '@/routes/_authenticated/fields/index'
import FieldDetailPage from '@/routes/_authenticated/fields/$fieldId'
import PlantsIndexPage from '@/routes/_authenticated/plants/index'
import PlantDetailPage from '@/routes/_authenticated/plants/$plantId'
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
        <Route path="/" element={<IndexPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        
        <Route element={<AdminGuard />}>
          <Route path="/users" element={<UsersPage />} />
        </Route>

        <Route path="/fields" element={<FieldsIndexPage />} />
        <Route path="/fields/:fieldId" element={<FieldDetailPage />} />
        <Route path="/plants" element={<PlantsIndexPage />} />
        <Route path="/plants/:plantId" element={<PlantDetailPage />} />
      </Route>
    </Routes>
  )
}

export default App
