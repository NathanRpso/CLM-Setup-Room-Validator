import Nav from './components/Nav'
import Hero from './components/Hero'
import RoomValidator from './components/RoomValidator'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Nav />
      <div className="pt-[92px]">
        <Hero />
        <RoomValidator />
      </div>
      <footer className="border-t border-gray-200 mt-24 py-10 text-center text-gray-400 text-xs tracking-widest uppercase">
        © {new Date().getFullYear()} Rapsodo. All rights reserved.
      </footer>
    </div>
  )
}
