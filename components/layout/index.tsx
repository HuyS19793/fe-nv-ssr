// components/layout/index.tsx
import { Navbar } from './navbar'
import { Sidebar } from './sidebar'

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className='flex min-h-screen h-screen overflow-hidden'>
      {/* Sidebar với width cố định */}
      <Sidebar />

      {/* Main content với overflow scroll */}
      <div className='flex-1 flex flex-col h-screen overflow-hidden'>
        <Navbar />
        <main className='flex-1 p-6 overflow-auto'>{children}</main>
      </div>
    </div>
  )
}
