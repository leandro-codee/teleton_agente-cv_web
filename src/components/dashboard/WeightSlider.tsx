import React, { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'

interface WeightSliderProps {
  label: string
  value: number
  onChange: (value: number) => void
  max?: number
  disabled?: boolean
}

const WeightSlider: React.FC<WeightSliderProps> = ({ 
  label, 
  value, 
  onChange, 
  max = 100, 
  disabled = false 
}) => {
  const [inputValue, setInputValue] = useState(value.toString())
  
  useEffect(() => {
    setInputValue(value.toString())
  }, [value])
  
  const handleSliderChange = (newValue: number[]) => {
    const val = newValue[0]
    onChange(val)
    setInputValue(val.toString())
  }
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setInputValue(val)
    
    // Validar y actualizar solo si es un número válido
    const numValue = parseInt(val) || 0
    if (numValue >= 0 && numValue <= max) {
      onChange(numValue)
    }
  }
  
  const handleInputBlur = () => {
    // Asegurar que el input coincida con el valor actual
    setInputValue(value.toString())
  }
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium text-gray-700">{label}</Label>
        <div className="flex items-center space-x-2">
          <Input
            type="number"
            min="0"
            max={max}
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            disabled={disabled}
            className="w-16 text-center text-sm"
          />
          <span className="text-sm text-gray-500">%</span>
        </div>
      </div>
      
      <Slider
        value={[value]}
        onValueChange={handleSliderChange}
        max={max}
        step={1}
        disabled={disabled}
        className="w-full"
      />
      
      <div className="flex justify-between text-xs text-gray-500">
        <span>0%</span>
        <span>{max}%</span>
      </div>
    </div>
  )
}

export default WeightSlider 