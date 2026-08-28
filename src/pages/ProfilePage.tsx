import { useNavigate } from 'react-router-dom'
import {
  Star,
  MapPin,
  LogOut,
  ChevronRight,
  User
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { signOut } from '../services/auth'

export function ProfilePage() {
  const navigate = useNavigate()
  const { user, profile } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-beige-50">
      <div className="p-4">
        <h1 className="font-serif text-2xl font-bold text-matcha-800 mb-6">
          Profile
        </h1>

        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-matcha-600 flex items-center justify-center flex-shrink-0">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.username}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <span className="text-2xl font-serif font-bold text-white">
                  {profile?.username?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || <User size={28} />}
                </span>
              )}
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-matcha-800">
                {profile?.username || 'Larper'}
              </h2>
              <p className="text-sm text-beige-500">{user?.email}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm divide-y divide-beige-100">
          <MenuItem
            icon={<Star className="text-gold-500" size={20} />}
            label="Larp Points"
            value={profile?.points?.toLocaleString() || '0'}
          />
          <MenuItem
            icon={<MapPin className="text-matcha-500" size={20} />}
            label="Spots Visited"
            value="View History"
            onClick={() => navigate('/passport')}
          />
        </div>

        <button
          onClick={handleSignOut}
          className="w-full mt-6 bg-white rounded-xl p-4 shadow-sm flex items-center justify-center gap-2 text-red-600 font-medium hover:bg-red-50 transition-colors"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  )
}

function MenuItem({
  icon,
  label,
  value,
  onClick
}: {
  icon: React.ReactNode
  label: string
  value: string
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 hover:bg-beige-50 transition-colors text-left"
    >
      <div className="w-10 h-10 rounded-lg bg-beige-100 flex items-center justify-center">
        {icon}
      </div>
      <div className="flex-1">
        <p className="font-medium text-matcha-800">{label}</p>
      </div>
      {value && (
        <span className="text-sm text-beige-500 mr-2">{value}</span>
      )}
      <ChevronRight size={18} className="text-beige-400" />
    </button>
  )
}
