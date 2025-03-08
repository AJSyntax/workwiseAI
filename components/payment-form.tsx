"use client"

import { useState } from "react"
import { useSupabase } from "@/components/providers/supabase-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/components/ui/use-toast"
import { createPayPalPayment, createGCashPayment } from "@/utils/payment-service"

interface PaymentFormProps {
  amount: number
  description: string
  onPaymentComplete?: (paymentId: string) => void
}

export function PaymentForm({ amount, description, onPaymentComplete }: PaymentFormProps) {
  const { supabase, user } = useSupabase()
  const { toast } = useToast()
  const [paymentMethod, setPaymentMethod] = useState("paypal")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [processing, setProcessing] = useState(false)

  const handlePayment = async () => {
    if (paymentMethod === "gcash" && !phoneNumber) {
      toast({
        title: "Phone number required",
        description: "Please enter your GCash phone number.",
        variant: "destructive",
      })
      return
    }

    setProcessing(true)
    try {
      let paymentResult

      if (paymentMethod === "paypal") {
        paymentResult = await createPayPalPayment(amount, description)
      } else {
        paymentResult = await createGCashPayment(amount, description, phoneNumber)
      }

      if (!paymentResult.success) {
        throw new Error("Payment failed")
      }

      // In a real implementation, you would redirect the user to the payment provider
      // For now, we'll just simulate a successful payment
      toast({
        title: "Payment initiated",
        description: `Your ${paymentMethod.toUpperCase()} payment has been initiated.`,
      })

      if (onPaymentComplete) {
        onPaymentComplete(paymentResult.paymentId)
      }
    } catch (error: any) {
      toast({
        title: "Payment failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">Payment Details</h3>
        <p className="text-sm text-gray-500">Amount: ${amount.toFixed(2)}</p>
        <p className="text-sm text-gray-500">Description: {description}</p>
      </div>

      <div className="space-y-2">
        <Label>Payment Method</Label>
        <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="paypal" id="paypal" />
            <Label htmlFor="paypal">PayPal</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="gcash" id="gcash" />
            <Label htmlFor="gcash">GCash</Label>
          </div>
        </RadioGroup>
      </div>

      {paymentMethod === "gcash" && (
        <div className="space-y-2">
          <Label htmlFor="phone-number">GCash Phone Number</Label>
          <Input
            id="phone-number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="e.g. +63 917 123 4567"
            required
          />
        </div>
      )}

      <Button onClick={handlePayment} className="w-full" disabled={processing}>
        {processing ? "Processing..." : `Pay with ${paymentMethod.toUpperCase()}`}
      </Button>
    </div>
  )
}

