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
      <h2 className="text-2xl font-serif font-semibold mb-6">Guest Information</h2>

      {/* Name Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              First Name
            </div>
          </label>
          <input
            type="text"
            {...register('firstName')}
            className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-[var(--color-terracotta)] focus:border-transparent ${
              errors.firstName ? 'border-[var(--color-error)]' : 'border-[var(--color-sand)]'
            }`}
            placeholder="John"
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-[var(--color-error)]">{errors.firstName.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Last Name
            </div>
          </label>
          <input
            type="text"
            {...register('lastName')}
            className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-[var(--color-terracotta)] focus:border-transparent ${
              errors.lastName ? 'border-[var(--color-error)]' : 'border-[var(--color-sand)]'
            }`}
            placeholder="Doe"
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-[var(--color-error)]">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email Address
          </div>
        </label>
        <input
          type="email"
          {...register('email')}
          className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-[var(--color-terracotta)] focus:border-transparent ${
            errors.email ? 'border-[var(--color-error)]' : 'border-[var(--color-sand)]'
          }`}
          placeholder="john.doe@example.com"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-[var(--color-error)]">{errors.email.message}</p>
        )}
        <p className="mt-1 text-sm text-[var(--foreground-muted)] opacity-70">
          Confirmation email will be sent to this address
        </p>
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            Phone Number
          </div>
        </label>
        <input
          type="tel"
          {...register('phone')}
          className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-[var(--color-terracotta)] focus:border-transparent ${
            errors.phone ? 'border-[var(--color-error)]' : 'border-[var(--color-sand)]'
          }`}
          placeholder="+1 (555) 123-4567"
        />
        {errors.phone && (
          <p className="mt-1 text-sm text-[var(--color-error)]">{errors.phone.message}</p>
        )}
      </div>

      {/* Special Requests */}
      <div>
        <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Special Requests (Optional)
          </div>
        </label>
        <textarea
          {...register('specialRequests')}
          rows={4}
          className="w-full px-4 py-2 border border-[var(--color-sand)] rounded-xl focus:ring-2 focus:ring-[var(--color-terracotta)] focus:border-transparent"
          placeholder="Any special requirements or requests for your stay..."
        />
        <p className="mt-1 text-sm text-[var(--foreground-muted)] opacity-70">
          Special requests cannot be guaranteed but we'll do our best to accommodate
        </p>
      </div>

      {/* Terms and Conditions */}
      <div className="bg-[var(--background)] rounded-xl p-4">
        <p className="text-sm text-[var(--foreground-muted)]">
          By proceeding, you agree to our{' '}
          <a href="#" className="text-[var(--color-terracotta)] hover:underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-[var(--color-terracotta)] hover:underline">
            Privacy Policy
          </a>
          . Your payment information is processed securely.
        </p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full px-6 py-3 bg-[var(--color-charcoal)] text-[var(--color-pearl)] rounded-lg hover:bg-[var(--color-slate)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-lg"
      >
        {isSubmitting ? 'Processing...' : 'Continue to Payment'}
      </button>
    </form>
  );
}
