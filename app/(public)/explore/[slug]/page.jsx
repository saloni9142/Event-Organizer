"use client"
import { useParams } from 'next/navigation';
import { useRouter } from 'next/router';
import React from 'react'

const DynamicExplorePage = () => {
  const params= useParams();
  const router = useRouter();
  return (
    <div>page</div>
  )
}

export default DynamicExplorePage