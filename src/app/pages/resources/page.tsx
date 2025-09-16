"use client"

import type React from "react"
import HelpSection from "./content/help-section"
import LearningSection from "./content/learning-section"
import SupportSection from "./content/support-section"

export default function ResourcesPage() {

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-slate-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Central de <label className="text-yellow-500">Recursos</label>
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto opacity-90">
            Encontre guias, documentação técnica e o suporte necessário para extrair o máximo da sua solução AIRscan.
          </p>
        </div>
      </section>

     <HelpSection />
     <LearningSection />
     <SupportSection />
      

     
    </div>
  )
}

