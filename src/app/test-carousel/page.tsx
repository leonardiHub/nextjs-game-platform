import Herov2 from '@/components/Herov2'

export default function TestCarouselPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          Hero Carousel Test
        </h1>
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <Herov2 />
        </div>

        <div className="mt-8 text-center">
          <h2 className="text-2xl font-semibold mb-4">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-semibold text-gray-800 mb-2">Auto-play</h3>
              <p>Automatically cycles through images every 5 seconds</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-semibold text-gray-800 mb-2">Navigation</h3>
              <p>Previous/Next buttons for manual control</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-semibold text-gray-800 mb-2">Responsive</h3>
              <p>Optimized for all screen sizes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

