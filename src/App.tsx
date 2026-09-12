import { useEffect } from 'react'
import Lenis from 'lenis'
import { useReducedMotion } from './lib/hooks'
import { Loader } from './components/Loader'
import { Progress } from './components/Progress'
import { Cursor } from './components/Cursor'
import { Scene } from './components/Scene'
import { Nav } from './components/Nav'
import { Hero } from './components/Hero'
import { Work } from './components/Work'
import { About } from './components/About'
import { Path } from './components/Path'
import { Skills } from './components/Skills'
import { Contact } from './components/Contact'
import { Footer } from './components/Footer'

export default function App() {
  const reduce = useReducedMotion()

  // Smooth scrolling (skipped for reduced-motion visitors).
  useEffect(() => {
    if (reduce) return
    const lenis = new Lenis({ autoRaf: true })
    return () => lenis.destroy()
  }, [reduce])

  return (
    <>
      <Loader />
      <Progress />
      <div className="glow" aria-hidden="true" />
      <Scene />
      <Cursor />
      <Nav />
      <main>
        <Hero />
        <Work />
        <About />
        <Path />
        <Skills />
        <Contact />
        <Footer />
      </main>
    </>
  )
}
