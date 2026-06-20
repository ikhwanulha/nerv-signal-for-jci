'use client'
import { useEffect } from 'react'

export default function Home() {
  useEffect(() => {
    // Set IHSG as default title
    document.title = 'IDX Terminal — IHSG Market Dashboard'
  }, [])

  return null
}
