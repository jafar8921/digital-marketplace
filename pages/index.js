/* pages/index.js */
import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function Home() {
  const router = useRouter()
  useEffect(() => {
    loadNFTs()
  }, [])
  async function loadNFTs() {
    router.push('/create-item')
  }
  
  return (
    <div className="flex justify-center"></div>
  )
}