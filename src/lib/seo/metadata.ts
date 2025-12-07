import { Metadata } from 'next';
import { Hotel } from '@/types/booking';

/**
 * Get the base URL for the application
 * Falls back to localhost in development if not set
 */
export function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return 'http://localhost:3000';
}

/**
 * Generate a canonical URL for a given path
 * @param path - The path relative to the base URL (should start with /)
 * @returns The full canonical URL
 */
export function getCanonicalUrl(path: string): string {
  const baseUrl = getBaseUrl();
  return `${baseUrl}${path}`;
}

/**
 * Generate metadata for a hotel detail page
 * Includes title, description, Open Graph, and Twitter Card tags
 */
export function generateHotelMetadata(hotel: Hotel, locale: string): Metadata {
  const title = `${hotel.name} - Book Your Stay`;
  const description = hotel.description.length > 160
    ? `${hotel.description.substring(0, 157)}...`
    : hotel.description;

  const url = getCanonicalUrl(`/${locale}/hotels/${hotel.slug}`);
  const imageUrl = hotel.images[0] ? getAbsoluteImageUrl(hotel.images[0]) : undefined;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: 'Hotelius',
      locale: locale,
      type: 'website',
      images: imageUrl ? [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: hotel.name,
        },
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
    other: {
      'hotel:name': hotel.name,
      'hotel:rating': hotel.rating.toString(),
      'hotel:address': `${hotel.address}, ${hotel.city}, ${hotel.country}`,
      'hotel:phone': hotel.phone,
      'hotel:email': hotel.email,
    },
  };
}

/**
 * Generate metadata for the room search/availability page
 */
export function generateRoomSearchMetadata(hotel: Hotel, locale: string): Metadata {
  const title = `Available Rooms - ${hotel.name}`;
  const description = `Browse available rooms at ${hotel.name}. Choose from our selection of comfortable accommodations in ${hotel.city}, ${hotel.country}.`;

  const url = getCanonicalUrl(`/${locale}/hotels/${hotel.slug}/rooms`);
  const imageUrl = hotel.images[0] ? getAbsoluteImageUrl(hotel.images[0]) : undefined;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: 'Hotelius',
      locale: locale,
      type: 'website',
      images: imageUrl ? [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `Available rooms at ${hotel.name}`,
        },
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

/**
 * Generate metadata for the booking checkout page
 * Includes noindex to prevent indexing of checkout pages
 */
export function generateBookingMetadata(hotelName: string, step: 'guest' | 'payment' | 'confirmation'): Metadata {
  const stepTitles = {
    guest: 'Guest Details',
    payment: 'Secure Payment',
    confirmation: 'Booking Confirmed',
  };

  const stepDescriptions = {
    guest: 'Enter your guest information to complete your reservation.',
    payment: 'Complete your secure payment to confirm your booking.',
    confirmation: 'Your booking has been confirmed. View your reservation details.',
  };

  const title = `${stepTitles[step]} - ${hotelName}`;
  const description = stepDescriptions[step];

  return {
    title,
    description,
    robots: {
      index: false,
      follow: false,
      noarchive: true,
      nocache: true,
    },
  };
}

/**
 * Generate metadata for the room availability/search page
 */
export function generateRoomsPageMetadata(hotelName: string, locale: string, slug: string): Metadata {
  const title = `Available Rooms - ${hotelName}`;
  const description = `Browse and book available rooms at ${hotelName}. View room types, amenities, and prices.`;

  const url = getCanonicalUrl(`/${locale}/hotels/${slug}/rooms`);

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: 'Hotelius',
      locale: locale,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}

/**
 * Convert a relative or absolute image URL to a full absolute URL
 * @param imageUrl - The image URL (can be relative or absolute)
 * @returns The absolute image URL
 */
function getAbsoluteImageUrl(imageUrl: string): string {
  // If already absolute, return as-is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // Make it absolute using the base URL
  const baseUrl = getBaseUrl();
  return `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
}

/**
 * Generate structured data (JSON-LD) for a hotel
 * This helps search engines understand the content better
 */
export function generateHotelStructuredData(hotel: Hotel, locale: string) {
  const url = getCanonicalUrl(`/${locale}/hotels/${hotel.slug}`);
  const imageUrl = hotel.images[0] ? getAbsoluteImageUrl(hotel.images[0]) : undefined;

  return {
    '@context': 'https://schema.org',
    '@type': 'Hotel',
    name: hotel.name,
    description: hotel.description,
    url: url,
    image: imageUrl,
    address: {
      '@type': 'PostalAddress',
      streetAddress: hotel.address,
      addressLocality: hotel.city,
      addressRegion: hotel.state,
      postalCode: hotel.zipCode,
      addressCountry: hotel.country,
    },
    telephone: hotel.phone,
    email: hotel.email,
    starRating: {
      '@type': 'Rating',
      ratingValue: hotel.rating,
      bestRating: '5',
      worstRating: '1',
    },
    aggregateRating: hotel.reviewCount > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: hotel.rating,
      reviewCount: hotel.reviewCount,
    } : undefined,
    checkinTime: hotel.checkInTime,
    checkoutTime: hotel.checkOutTime,
  };
}
