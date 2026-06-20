'use client'
import { useEffect } from 'react'

export default function Home() {
  useEffect(() => {
    document.title = 'NERV SIGNAL FOR JCI — Bloomberg Terminal IHSG'
  }, [])

  return null
}
