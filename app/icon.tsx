import { ImageResponse } from 'next/og'
import fs from 'fs'
import path from 'path'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  const imgBuffer = fs.readFileSync(path.join(process.cwd(), 'public/moalogo.jpg'))
  const imgBase64 = imgBuffer.toString('base64')

  return new ImageResponse(
    <img
      src={`data:image/jpeg;base64,${imgBase64}`}
      style={{ borderRadius: '20%', width: '100%', height: '100%', objectFit: 'cover' }}
    />,
    { ...size }
  )
}
