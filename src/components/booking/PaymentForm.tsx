'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { CreditCard, Lock, Calendar } from 'lucide-react';

const paymentSchema = z.object({
  cardholderName: z.string().min(2, 'Cardholder name is required'),
  cardNumber: z.string().regex(/^\d{16}$/, 'Please enter a valid 16-digit card number'),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Format: MM/YY'),
  cvv: z.string().regex(/^\d{3,4}$/, 'CVV must be 3 or 4 digits'),
  billingZip: z.string().min(3, 'Billing ZIP code is required'),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface PaymentFormProps {
  hotelSlug: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  guests: string;
  guestInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    specialRequests?: string;
  };
  total: number;
  locale: string;
}

export default function PaymentForm({
  hotelSlug,
  roomId,
  checkIn,
  checkOut,
  guests,
  guestInfo,
  total,
  locale,
}: PaymentFormProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
  });

  const onSubmit = async (data: PaymentFormData) => {
    setIsProcessing(true);

    try {
      // TODO: Integrate with Stripe API
      // In production, you would:
      // 1. Create a PaymentIntent with Stripe
      // 2. Confirm the payment
      // 3. Create the booking in your database
      // 4. Send confirmation email

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Create booking
      const bookingData = {
        hotelSlug,
        roomId,
        checkIn,
        checkOut,
        guests,
        guestInfo,
        paymentInfo: {
          last4: data.cardNumber.slice(-4),
          amount: total,
        },
      };

      // TODO: Call your booking API
      // const response = await fetch('/api/bookings', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(bookingData),
      // });

      // Simulate booking creation
      const bookingId = 'booking-' + Math.random().toString(36).substr(2, 9);

      // Redirect to confirmation page
      router.push(
        `/${locale}/hotels/${hotelSlug}/book/confirmation?bookingId=${bookingId}`
      );
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
      setIsProcessing(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    return cleaned.slice(0, 16);
  };

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  return (
    <div>
      {/* Security Badge */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 text-green-800">
          <Lock className="w-5 h-5" />
          <span className="font-medium">Secure SSL Encrypted Payment</span>
        </div>
      </div>

      {/* Stripe Elements Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> This is a placeholder form. In production, integrate with{' '}
          <a
            href="https://stripe.com/docs/stripe-js"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Stripe Elements
          </a>{' '}
          for secure payment processing.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <h2 className="text-2xl font-semibold mb-6">Payment Information</h2>

        {/* Cardholder Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cardholder Name
          </label>
          <input
            type="text"
            {...register('cardholderName')}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.cardholderName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="John Doe"
          />
          {errors.cardholderName && (
            <p className="mt-1 text-sm text-red-600">{errors.cardholderName.message}</p>
          )}
        </div>

        {/* Card Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Card Number
            </div>
          </label>
          <input
            type="text"
            {...register('cardNumber')}
            onChange={(e) => {
              e.target.value = formatCardNumber(e.target.value);
            }}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.cardNumber ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="1234567812345678"
            maxLength={16}
          />
          {errors.cardNumber && (
            <p className="mt-1 text-sm text-red-600">{errors.cardNumber.message}</p>
          )}
        </div>

        {/* Expiry and CVV */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Expiry Date
              </div>
            </label>
            <input
              type="text"
              {...register('expiryDate')}
              onChange={(e) => {
                e.target.value = formatExpiryDate(e.target.value);
              }}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.expiryDate ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="MM/YY"
              maxLength={5}
            />
            {errors.expiryDate && (
              <p className="mt-1 text-sm text-red-600">{errors.expiryDate.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                CVV
              </div>
            </label>
            <input
              type="text"
              {...register('cvv')}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.cvv ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="123"
              maxLength={4}
            />
            {errors.cvv && (
              <p className="mt-1 text-sm text-red-600">{errors.cvv.message}</p>
            )}
          </div>
        </div>

        {/* Billing ZIP */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Billing ZIP Code
          </label>
          <input
            type="text"
            {...register('billingZip')}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.billingZip ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="12345"
          />
          {errors.billingZip && (
            <p className="mt-1 text-sm text-red-600">{errors.billingZip.message}</p>
          )}
        </div>

        {/* Payment Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isProcessing}
            className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium text-lg flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing Payment...
              </>
            ) : (
              <>
                <Lock className="w-5 h-5" />
                Pay ${total.toFixed(2)}
              </>
            )}
          </button>
        </div>

        {/* Security Info */}
        <div className="text-center text-sm text-gray-500">
          <p>Your payment information is encrypted and secure</p>
        </div>
      </form>
    </div>
  );
}
