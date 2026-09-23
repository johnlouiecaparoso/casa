import { RouterProvider } from 'react-router'
import { router } from './routes'
import { CasaProvider } from './lib/store'
import { ToastProvider } from './components/Toast'
import { BookingDraftProvider } from './lib/booking-draft'

export default function App() {
  return (
    <CasaProvider>
      <ToastProvider>
        <BookingDraftProvider>
          <RouterProvider router={router} />
        </BookingDraftProvider>
      </ToastProvider>
    </CasaProvider>
  )
}
