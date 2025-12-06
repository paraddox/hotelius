'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { User, Mail, Phone, MessageSquare } from 'lucide-react';

const guestSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  specialRequests: z.string().optional(),
});

type GuestFormData = z.infer<typeof guestSchema>;

interface GuestFormProps {
  hotelSlug: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  guests: string;
  locale: string;
}

export default function GuestForm({
  hotelSlug,
  roomId,
  checkIn,
  checkOut,
  guests,
  locale,
}: GuestFormProps) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<GuestFormData>({
    resolver: zodResolver(guestSchema),
  });

  const onSubmit = async (data: GuestFormData) => {
    // Build URL with all data
    const params = new URLSearchParams({
      roomId,
      checkIn,
      checkOut,
      guests,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      ...(data.specialRequests && { specialRequests: data.specialRequests }),
    });

    // Navigate to payment page
    router.push(`/${locale}/hotels/${hotelSlug}/book/payment?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <h2 className="text-2xl font-semibold mb-6">Guest Information</h2>

      {/* Name Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              First Name
            </div>
          </label>
          <input
            type="text"
            {...register('firstName')}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.firstName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="John"
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Last Name
            </div>
          </label>
          <input
            type="text"
            {...register('lastName')}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.lastName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Doe"
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email Address
          </div>
        </label>
        <input
          type="email"
          {...register('email')}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.email ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="john.doe@example.com"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          Confirmation email will be sent to this address
        </p>
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            Phone Number
          </div>
        </label>
        <input
          type="tel"
          {...register('phone')}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.phone ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="+1 (555) 123-4567"
        />
        {errors.phone && (
          <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
        )}
      </div>

      {/* Special Requests */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Special Requests (Optional)
          </div>
        </label>
        <textarea
          {...register('specialRequests')}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Any special requirements or requests for your stay..."
        />
        <p className="mt-1 text-sm text-gray-500">
          Special requests cannot be guaranteed but we'll do our best to accommodate
        </p>
      </div>

      {/* Terms and Conditions */}
      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-sm text-gray-600">
          By proceeding, you agree to our{' '}
          <a href="#" className="text-blue-600 hover:underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-blue-600 hover:underline">
            Privacy Policy
          </a>
          . Your payment information is processed securely.
        </p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium text-lg"
      >
        {isSubmitting ? 'Processing...' : 'Continue to Payment'}
      </button>
    </form>
  );
}
