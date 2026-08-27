import { useState, useEffect } from 'react'
import { Stamp, MapPin, Globe, Star, Award } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { getUserCheckIns, getUserStats } from '../services/checkins'
import { getUserBadges } from '../services/auth'
import type { CheckIn, UserBadge } from '../types'

export function PassportPage() {
  const { user, profile } = useAuth()
  const [checkIns, setCheckIns] = useState<CheckIn[]>([])
  const [badges, setBadges] = useState<UserBadge[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    const loadData = async () => {
      const [checkInsData, badgesData, statsData] = await Promise.all([
        getUserCheckIns(user.id),
        getUserBadges(user.id),
        getUserStats(user.id)
      ])

      setCheckIns(checkInsData)
      setBadges(badgesData)
      setStats(statsData)
      setLoading(false)
    }

    loadData()
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen bg-beige-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-matcha-200 border-t-matcha-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-beige-50 p-6">
        <h1 className="font-serif text-2xl font-bold text-matcha-800 mb-1">
          Field Passport
        </h1>
        <div className="mt-12 text-center">
          <Stamp className="w-16 h-16 text-beige-300 mx-auto mb-4" />
          <h3 className="font-serif text-lg font-semibold text-matcha-800 mb-2">
            Sign in to view your passport
          </h3>
          <p className="text-sm text-beige-500">
            Track your Larp journey, earn points, and collect badges.
          </p>
        </div>
      </div>
    )
  }

  const uniqueCities = new Set(checkIns.map((c) => c.spots?.city).filter(Boolean))
  const uniqueCountries = new Set(checkIns.map((c) => c.spots?.country).filter(Boolean))

  return (
    <div className="min-h-screen bg-beige-50">
      <div className="bg-matcha-700 text-white p-6 pb-8">
        <h1 className="font-serif text-2xl font-bold mb-1">Field Passport</h1>
        <p className="text-matcha-200 text-sm">Your Larp journey documented</p>
      </div>

      <div className="px-4 -mt-4">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="text-center mb-6">
            <div className="w-20 h-20 rounded-full bg-matcha-100 flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl font-serif font-bold text-matcha-600">
                {profile?.username?.charAt(0).toUpperCase() || '?'}
              </span>
            </div>
            <h2 className="font-serif text-xl font-bold text-matcha-800">
              {profile?.username || 'Larper'}
            </h2>
            <p className="text-sm text-beige-500">
              Member since {new Date(profile?.created_at || '').getFullYear()}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <StatCard
              icon={<Star className="text-gold-500" size={20} />}
              label="Larp Points"
              value={profile?.points?.toLocaleString() || '0'}
            />
            <StatCard
              icon={<MapPin className="text-matcha-500" size={20} />}
              label="Spots Visited"
              value={stats?.spots_visited?.toString() || checkIns.length.toString()}
            />
            <StatCard
              icon={<Globe className="text-matcha-500" size={20} />}
              label="Cities"
              value={uniqueCities.size.toString()}
            />
            <StatCard
              icon={<Globe className="text-matcha-500" size={20} />}
              label="Countries"
              value={uniqueCountries.size.toString()}
            />
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {badges.length > 0 && (
          <section>
            <h3 className="font-serif text-lg font-semibold text-matcha-800 mb-3">
              Badges
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {badges.map((userBadge) => (
                <div
                  key={userBadge.badge_id}
                  className="bg-white rounded-xl p-4 text-center shadow-sm"
                >
                  <div className="w-12 h-12 rounded-full bg-matcha-100 flex items-center justify-center mx-auto mb-2">
                    <Award className="text-matcha-600" size={24} />
                  </div>
                  <p className="text-xs font-medium text-matcha-800">
                    {userBadge.badges?.name}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <h3 className="font-serif text-lg font-semibold text-matcha-800 mb-3">
            Recent Larps
          </h3>
          {checkIns.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center">
              <Stamp className="w-12 h-12 text-beige-300 mx-auto mb-3" />
              <p className="font-medium text-matcha-700">No stamps yet</p>
              <p className="text-sm text-beige-500 mt-1">
                Check in at Larp Spots to fill your passport.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {checkIns.map((checkIn) => (
                <div
                  key={checkIn.id}
                  className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-lg bg-matcha-100 flex items-center justify-center flex-shrink-0">
                    <MapPin className="text-matcha-600" size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-matcha-800 text-sm truncate">
                      {checkIn.spots?.name || 'Unknown Spot'}
                    </p>
                    <p className="text-xs text-beige-500">
                      {checkIn.spots?.city || 'Unknown City'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gold-600">
                      +{checkIn.points_earned}
                    </p>
                    <p className="text-xs text-beige-400">
                      {new Date(checkIn.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="bg-beige-50 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-xs text-beige-500">{label}</span>
      </div>
      <p className="text-2xl font-serif font-bold text-matcha-800">{value}</p>
    </div>
  )
}
