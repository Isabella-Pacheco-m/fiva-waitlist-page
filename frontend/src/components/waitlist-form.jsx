"use client"

import { useState } from "react"
import { ChevronRight, ChevronLeft, Check, Loader2 } from "lucide-react"

const steps = [
  {
    id: "email",
    label: "Correo electrónico",
    type: "email",
    placeholder: "tucorreo@gmail.com",
    validation: (value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(value) ? null : "Por favor ingresa un correo válido"
    },
  },
  {
    id: "phone",
    label: "Número de teléfono",
    type: "tel",
    placeholder: "+57 300 123 4567",
    validation: (value) => {
      const cleaned = value.replace(/[^\d+]/g, '')
      const phoneRegex = /^\+?[\d]{7,15}$/
      return phoneRegex.test(cleaned) ? null : "Por favor ingresa un número válido"
    },
  },
  {
    id: "company",
    label: "Nombre de la empresa",
    type: "text",
    placeholder: "Mi Empresa S.A.S.",
    validation: (value) => {
      return value.trim().length >= 2 ? null : "El nombre debe tener al menos 2 caracteres"
    },
  },
  {
    id: "sector",
    label: "Sector de la empresa",
    type: "select",
    placeholder: "Selecciona un sector",
    options: [
      "Tecnología",
      "Finanzas",
      "Salud",
      "Educación",
      "Retail",
      "Manufactura",
      "Servicios",
      "Otro",
    ],
    validation: (value) => {
      return value ? null : "Por favor selecciona un sector"
    },
  },
  {
    id: "size",
    label: "Tamaño de la empresa",
    type: "select",
    placeholder: "Selecciona el tamaño",
    options: [
      "1-10 empleados",
      "11-50 empleados",
      "51-200 empleados",
      "201-500 empleados",
      "500+ empleados",
      "No aplica",
    ],
    validation: (value) => {
      return value ? null : "Por favor selecciona el tamaño"
    },
  },
]

export function WaitlistForm() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    company: "",
    sector: "",
    size: "",
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  const currentField = steps[currentStep]
  const isLastStep = currentStep === steps.length - 1

  const validateCurrentField = () => {
    const error = currentField.validation(formData[currentField.id])
    setErrors((prev) => ({ ...prev, [currentField.id]: error }))
    return !error
  }

  const canProceed = formData[currentField.id]?.trim() !== "" && !errors[currentField.id]

  const handleNext = () => {
    if (!validateCurrentField()) return

    if (isLastStep) {
      handleSubmit()
    } else {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      // Limpiar el teléfono de espacios y caracteres especiales
      const cleanedPhone = formData.phone.replace(/[^\d+]/g, '')
      
      // Extraer tamaño sin " empleados" (excepto "No aplica")
      const sizeValue = formData.size === "No aplica" 
        ? "No aplica" 
        : formData.size.replace(' empleados', '')

      const payload = {
        email: formData.email,
        phone: cleanedPhone,
        company_name: formData.company,
        company_niche: formData.sector,
        company_size: sizeValue
      }

      console.log('Sending payload:', payload)

      const response = await fetch('https://fiva-waitlist-page-production.up.railway.app/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (response.ok) {
        setIsSubmitting(false)
        setIsComplete(true)
      } else {
        setIsSubmitting(false)
        console.error('Backend error:', data)
        const errorMsg = typeof data.detail === 'string'
          ? data.detail
          : JSON.stringify(data.detail)
        alert(errorMsg || 'Error al registrar. Intenta nuevamente.')
      }
    } catch (error) {
      setIsSubmitting(false)
      console.error('Connection error:', error)
      alert('Error de conexión. Por favor intenta nuevamente.')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleNext()
    }
  }

  const handleInputChange = (value) => {
    setFormData((prev) => ({ ...prev, [currentField.id]: value }))
    if (errors[currentField.id]) {
      setErrors((prev) => ({ ...prev, [currentField.id]: null }))
    }
  }

  const openForm = () => {
    setIsOpen(true)
  }

  const closeForm = () => {
    setIsOpen(false)
    setCurrentStep(0)
    setFormData({ email: "", phone: "", company: "", sector: "", size: "" })
    setErrors({})
    setIsComplete(false)
  }

  if (isComplete) {
    return (
      <div className="w-full max-w-lg">
        <div className="bg-gray-50 rounded-full p-6 text-center">
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 bg-[#22C55E] rounded-full flex items-center justify-center">
              <Check className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <h3 className="text-base font-semibold text-[#1A1A1A]">
                ¡Gracias por unirte!
              </h3>
              <p className="text-sm text-gray-500">
                Te contactaremos pronto con novedades.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!isOpen) {
    return (
      <div className="w-full max-w-lg">
        <div className="flex items-center bg-white border border-gray-200 rounded-full p-1.5 focus-within:border-[#F5C423] focus-within:ring-2 focus-within:ring-[#F5C423]/20 transition-all">
          <input
            type="email"
            placeholder="tucorreo@gmail.com"
            value={formData.email}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, email: e.target.value }))
            }
            onFocus={openForm}
            className="flex-1 px-6 py-3 bg-transparent focus:outline-none text-[#1A1A1A] placeholder-gray-400 text-base"
          />
          <button
            onClick={openForm}
            className="px-8 py-3 bg-[#F5C423] text-[#1A1A1A] font-bold rounded-full hover:bg-[#F5C423]/90 transition-all whitespace-nowrap tracking-wide text-sm active:scale-95"
          >
            UNIRME
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-lg">
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-7 border border-gray-100 shadow-sm">
        {/* Barra de progreso ELIMINADA */}

        {/* Question */}
        <h3 className="text-lg font-bold text-[#1A1A1A] mb-4">
          {currentField.label}
        </h3>

        {/* Input */}
        {currentField.type === "select" ? (
          <select
            value={formData[currentField.id]}
            onChange={(e) => handleInputChange(e.target.value)}
            className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#F5C423]/50 focus:border-[#F5C423] transition-all text-[#1A1A1A] bg-white mb-2"
          >
            <option value="">{currentField.placeholder}</option>
            {currentField.options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={currentField.type}
            placeholder={currentField.placeholder}
            value={formData[currentField.id]}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={validateCurrentField}
            autoFocus
            className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#F5C423]/50 focus:border-[#F5C423] transition-all text-[#1A1A1A] bg-white mb-2"
          />
        )}

        {/* Error message */}
        {errors[currentField.id] && (
          <p className="text-red-500 text-sm mb-3 px-2 font-medium">{errors[currentField.id]}</p>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center mt-5">
          <button
            onClick={currentStep === 0 ? closeForm : handleBack}
            className="flex items-center gap-1.5 text-gray-400 hover:text-gray-600 transition-colors text-sm font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            {currentStep === 0 ? "Cancelar" : "Atrás"}
          </button>

          <button
            onClick={handleNext}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-7 py-2.5 rounded-full font-semibold transition-all bg-[#F5C423] text-[#1A1A1A] hover:bg-[#F5C423]/90 disabled:opacity-50 disabled:cursor-not-allowed text-sm tracking-wide"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Enviando...
              </>
            ) : isLastStep ? (
              "UNIRME"
            ) : (
              <>
                Siguiente
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
