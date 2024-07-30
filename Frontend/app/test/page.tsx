"use client"

import { withAuth } from './withAuth';


import React from 'react'

const TestComponent = withAuth(({name}: {name: string}) => {
  return (
    <div>test {name}</div>
  )
})
const TestComponentPage = ()=>{
    return (
        <TestComponent name="Assaad" />
    )
}

export default TestComponentPage;