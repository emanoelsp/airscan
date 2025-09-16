"use client"

import type React from "react"
import FaqSection from "./content/faq-section"
import AboutSection from "./content/about-section"
import ContactSection from "./content/contact-section"

export default function AboutPage() {

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
    
      <AboutSection />
      <FaqSection />
      <ContactSection />
      
    </div>
  )
}
