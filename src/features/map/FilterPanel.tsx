import { X, RotateCcw } from 'lucide-react'
import type { FilterState, SpotType } from '../../types'
import { DEFAULT_FILTERS } from '../../types'

interface FilterPanelProps {
  filters: FilterState
  onChange: (filters: FilterState) => void
  onClose: () => void
}

const spotTypeOptions: { value: SpotType; label: string }[] = [
  { value: 'cafe', label: 'Cafe' },
  { value: 'library', label: 'Library' },
  { value: 'coworking_space', label: 'Coworking' },
  { value: 'university', label: 'University' },
  { value: 'hotel', label: 'Hotel' }
]

const ratingOptions = [
  { value: 0, label: 'Any' },
  { value: 2, label: '2+' },
  { value: 3, label: '3+' },
  { value: 4, label: '4+' },
  { value: 5, label: '5' }
]

export function FilterPanel({ filters, onChange, onClose }: FilterPanelProps) {
  const updateFilter = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    onChange({ ...filters, [key]: value })
  }

  const toggleSpotType = (type: SpotType) => {
    const current = filters.spotTypes
    if (current.includes(type)) {
      updateFilter(
        'spotTypes',
        current.filter((t) => t !== type)
      )
    } else {
      updateFilter('spotTypes', [...current, type])
    }
  }

  return (
    <div className="absolute top-0 left-0 right-0 z-50 bg-white border-b border-beige-200 shadow-lg">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-lg font-semibold text-matcha-800">
            Filters
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onChange(DEFAULT_FILTERS)}
              className="p-2 text-beige-500 hover:text-matcha-600 transition-colors"
            >
              <RotateCcw size={16} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-beige-500 hover:text-matcha-600 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-beige-600 mb-2 block">
              Larp Score
            </label>
            <div className="flex gap-2">
              {[0, 70, 80, 90].map((score) => (
                <button
                  key={score}
                  onClick={() => updateFilter('minLarpScore', score)}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    filters.minLarpScore === score
                      ? 'bg-matcha-600 text-white'
                      : 'bg-beige-100 text-beige-600 hover:bg-beige-200'
                  }`}
                >
                  {score === 0 ? 'Any' : `${score}+`}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-beige-600 mb-2 block">
              WiFi
            </label>
            <div className="flex gap-2">
              {ratingOptions.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => updateFilter('wifiRating', value)}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    filters.wifiRating === value
                      ? 'bg-matcha-600 text-white'
                      : 'bg-beige-100 text-beige-600 hover:bg-beige-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-beige-600 mb-2 block">
              Outlets
            </label>
            <div className="flex gap-2">
              {ratingOptions.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => updateFilter('outletRating', value)}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    filters.outletRating === value
                      ? 'bg-matcha-600 text-white'
                      : 'bg-beige-100 text-beige-600 hover:bg-beige-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-beige-600 mb-2 block">
              Laptop Friendly
            </label>
            <div className="flex gap-2">
              {ratingOptions.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => updateFilter('laptopFriendliness', value)}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    filters.laptopFriendliness === value
                      ? 'bg-matcha-600 text-white'
                      : 'bg-beige-100 text-beige-600 hover:bg-beige-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-beige-600 mb-2 block">
              Spot Type
            </label>
            <div className="flex flex-wrap gap-2">
              {spotTypeOptions.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => toggleSpotType(value)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    filters.spotTypes.includes(value)
                      ? 'bg-matcha-600 text-white'
                      : 'bg-beige-100 text-beige-600 hover:bg-beige-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
