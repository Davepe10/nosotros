import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Juntos — nuestro espacio',
  description: 'Un espacio privado para escucharnos, entendernos y construir juntos.',
  robots: { index: false, follow: false },
}

export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="es"><body>{children}</body></html>}
