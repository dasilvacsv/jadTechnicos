'use client'

import React, { useState, useEffect } from 'react'
import { DollarSign, Euro, RefreshCw } from 'lucide-react'
import { getBCVRates, formatForeignCurrencyToVes } from '@/lib/exchangeRates'

interface CurrencyConverterProps {
  useEuro: boolean
  onCurrencyChange: (useEuro: boolean) => void
  amount?: number
  showConversion?: boolean
}

export function CurrencyConverter({ 
  useEuro, 
  onCurrencyChange, 
  amount = 0,
  showConversion = true 
}: CurrencyConverterProps) {
  const [rates, setRates] = useState<{ usd: number; eur: number } | null>(null)
  const [conversion, setConversion] = useState<{ 
    amount: number; 
    formattedVES: string; 
    rate: number 
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<string>('')

  // Fetch rates on component mount
  useEffect(() => {
    const fetchRates = async () => {
      setLoading(true)
      try {
        const bcvRates = await getBCVRates()
        setRates({
          usd: bcvRates.usd.rate,
          eur: bcvRates.eur.rate
        })
        setLastUpdate(bcvRates.usd.lastUpdate)
      } catch (error) {
        console.error('Error fetching rates:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRates()
  }, [])

  // Update conversion when amount or currency changes
  useEffect(() => {
    if (amount > 0 && rates && showConversion) {
      const fetchConversion = async () => {
        try {
          const result = await formatForeignCurrencyToVes(amount, useEuro ? 'EUR' : 'USD')
          setConversion({
            amount: result.vesAmount,
            formattedVES: result.formattedVES,
            rate: result.rate
          })
        } catch (error) {
          console.error('Error fetching conversion:', error)
        }
      }
      
      fetchConversion()
    } else {
      setConversion(null)
    }
  }, [amount, useEuro, rates, showConversion])

  const refreshRates = async () => {
    setLoading(true)
    try {
      const bcvRates = await getBCVRates()
      setRates({
        usd: bcvRates.usd.rate,
        eur: bcvRates.eur.rate
      })
      setLastUpdate(bcvRates.usd.lastUpdate)
    } catch (error) {
      console.error('Error refreshing rates:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Currency Toggle */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium">Moneda</label>
        <div className="flex items-center gap-2">
          <DollarSign className={`h-4 w-4 ${!useEuro ? 'text-green-600' : 'text-gray-400'}`} />
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={useEuro}
              onChange={(e) => onCurrencyChange(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
          <Euro className={`h-4 w-4 ${useEuro ? 'text-blue-600' : 'text-gray-400'}`} />
        </div>
        <button
          onClick={refreshRates}
          disabled={loading}
          className="ml-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
          title="Actualizar tasas BCV"
        >
          <RefreshCw className={`h-4 w-4 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Rate Display */}
      {rates && (
        <div className="text-xs text-gray-600 space-y-1">
          <div className="flex gap-4">
            <span className={`font-medium ${!useEuro ? 'text-green-600' : ''}`}>
              USD: {rates.usd.toFixed(2)} Bs
            </span>
            <span className={`font-medium ${useEuro ? 'text-blue-600' : ''}`}>
              EUR: {rates.eur.toFixed(2)} Bs
            </span>
          </div>
          {lastUpdate && (
            <div className="text-gray-500">
              Actualizado: {new Date(lastUpdate).toLocaleString('es-VE')}
            </div>
          )}
        </div>
      )}

      {/* Conversion Display */}
      {conversion && showConversion && amount > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="text-sm font-medium text-blue-800">
            Conversión BCV
          </div>
          <div className="text-lg font-bold text-blue-900">
            {conversion.formattedVES} Bs
          </div>
          <div className="text-xs text-blue-600">
            Tasa: 1 {useEuro ? 'EUR' : 'USD'} = {conversion.rate.toFixed(2)} Bs
          </div>
        </div>
      )}
    </div>
  )
}