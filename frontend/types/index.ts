export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  is_available: boolean;
  is_popular: boolean;
  tags?: string[];
}

export interface Category {
  slug: string;
  name: string;
  icon: string;
}

export interface Hall {
  id: number;
  name: string;
  nameHy: string;
  capacity: number;
  description?: string;
}

export interface Reservation {
  id: number;
  name: string;
  phone: string;
  email: string;
  date: string;
  time: string;
  guests: number;
  hallId: number;
  hall?: Hall;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  confirmationCode: string;
  notes?: string;
  lang: string;
  createdAt: string;
}

export interface Review {
  _id: string;
  author: string;
  rating: number;
  text: string;
  lang: string;
  source: 'tripadvisor' | 'google' | 'internal';
  date: string;
}

export interface GalleryItem {
  _id: string;
  url: string;
  thumbnail_url?: string;
  caption?: { hy?: string; en?: string; ru?: string };
  category: 'food' | 'interior' | 'events' | 'team';
  sort_order: number;
}

export interface Event {
  _id: string;
  title: { hy?: string; en?: string; ru?: string };
  description?: { hy?: string; en?: string; ru?: string };
  date: string;
  time?: string;
  image_url?: string;
  type: 'music' | 'special' | 'holiday' | 'other';
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface BookingFormData {
  name: string;
  phone: string;
  email: string;
  date: string;
  time: string;
  guests: number;
  hallId: number;
  notes?: string;
  lang: string;
}

export interface AdminStats {
  totalReservations: number;
  pendingReservations: number;
  totalMenuItems: number;
}
