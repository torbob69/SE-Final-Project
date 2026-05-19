import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listUsers } from '../../api/users'
import Layout from '../../components/Layout'

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    listUsers().then(setUsers).finally(() => setLoading(false))
  }, [])

  return (
    <Layout>
      <div className="px-4 pt-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="min-w-[48px] min-h-[48px] flex items-center justify-center rounded-full hover:bg-surface-variant">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-on-surface">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-on-surface">Users</h1>
        </div>

        {loading ? (
          <div className="flex justify-center pt-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {users.map((u) => (
              <div key={u.id} className="bg-surface border border-surface-variant rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center shrink-0">
                  <span className="text-on-primary-container font-bold text-sm uppercase">
                    {u.email[0]}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-on-surface text-sm truncate">{u.email}</p>
                  <p className="text-xs text-on-surface-variant capitalize">{u.role}</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full
                  ${u.role === 'admin' ? 'bg-primary-container text-on-primary-container' : 'bg-surface-variant text-on-surface-variant'}`}>
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
