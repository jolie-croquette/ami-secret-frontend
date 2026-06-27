import Header from './Header'
import Footer from './Footer'
import { Outlet } from 'react-router-dom'
import UpdateNoteModal from '@/components/UpdateNoteModal'

export default function Layout() {
  return (
    <>
      <Header />
      <main className="">
        <Outlet />
      </main>
      <Footer />
      <UpdateNoteModal />
    </>
  )
}
