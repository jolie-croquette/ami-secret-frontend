import Header from './Header'
import Footer from './Footer'
import { Outlet } from 'react-router-dom'
import UpdateNoteModal from '@/components/UpdateNoteModal'
import EnableNotificationsPrompt from '@/components/EnableNotificationsPrompt'

export default function Layout() {
  return (
    <>
      <Header />
      <main className="">
        <Outlet />
      </main>
      <Footer />
      <UpdateNoteModal />
      <EnableNotificationsPrompt />
    </>
  )
}
