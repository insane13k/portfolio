import { useEffect } from 'react'
import { startStringTune } from './lib/stringTune'
import { Loader } from './components/Loader'
import { Progress } from './components/Progress'
import { Cursor } from './components/Cursor'
import { Particles } from './components/Particles'
import { Nav } from './components/Nav'
import { Hero } from './components/Hero'
import { Work } from './components/Work'
import { About } from './components/About'
import { Path } from './components/Path'
import { Skills } from './components/Skills'
import { Contact } from './components/Contact'
import { Footer } from './components/Footer'

export default function App() {
  // Smooth scrolling, parallax, magnetic buttons and text reveals all come
  // from StringTune. It reads the markup, so it only has to be started once.
  useEffect(startStringTune, [])

  return (
    <>
      <Loader />
      <Progress />
      <div className="glow" aria-hidden="true" />
      <div className="stars" aria-hidden="true" />
      <Particles />
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
