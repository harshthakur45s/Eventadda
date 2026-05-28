const BASE_URL = 'http://localhost:8082/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || 'Something went wrong');
  }
  if (response.status === 204) return null;
  return response.json();
};

export const api = {
  // Authentication
  auth: {
    login: (credentials) => 
      fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      }).then(handleResponse),

    register: (userData) => 
      fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      }).then(handleResponse),

    getProfile: () => 
      fetch(`${BASE_URL}/auth/profile`, {
        method: 'GET',
        headers: getHeaders(),
      }).then(handleResponse),
  },

  // Events
  events: {
    getAll: (search = '', category = '') => {
      let query = '';
      if (search) query += `search=${encodeURIComponent(search)}`;
      if (category) query += `${query ? '&' : ''}category=${encodeURIComponent(category)}`;
      return fetch(`${BASE_URL}/events?${query}`, {
        method: 'GET',
      }).then(handleResponse);
    },

    getById: (id) => 
      fetch(`${BASE_URL}/events/${id}`, {
        method: 'GET',
      }).then(handleResponse),

    create: (eventData) => 
      fetch(`${BASE_URL}/organizer/events`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(eventData),
      }).then(handleResponse),

    update: (id, eventData) => 
      fetch(`${BASE_URL}/organizer/events/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(eventData),
      }).then(handleResponse),

    delete: (id) => 
      fetch(`${BASE_URL}/organizer/events/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      }).then(handleResponse),

    getOrganizerEvents: () => 
      fetch(`${BASE_URL}/organizer/events`, {
        method: 'GET',
        headers: getHeaders(),
      }).then(handleResponse),
  },

  // Join Registrations
  registrations: {
    joinRequest: (eventId) => 
      fetch(`${BASE_URL}/participant/registrations/join/${eventId}`, {
        method: 'POST',
        headers: getHeaders(),
      }).then(handleResponse),

    getParticipantRegistrations: () => 
      fetch(`${BASE_URL}/participant/registrations`, {
        method: 'GET',
        headers: getHeaders(),
      }).then(handleResponse),

    cancelBooking: (registrationId) => 
      fetch(`${BASE_URL}/participant/registrations/${registrationId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      }).then(handleResponse),

    getOrganizerRequests: () => 
      fetch(`${BASE_URL}/organizer/registrations/requests`, {
        method: 'GET',
        headers: getHeaders(),
      }).then(handleResponse),

    acceptRequest: (registrationId) => 
      fetch(`${BASE_URL}/organizer/registrations/${registrationId}/accept`, {
        method: 'POST',
        headers: getHeaders(),
      }).then(handleResponse),

    rejectRequest: (registrationId) => 
      fetch(`${BASE_URL}/organizer/registrations/${registrationId}/reject`, {
        method: 'POST',
        headers: getHeaders(),
      }).then(handleResponse),
  },

  // Wishlist
  wishlist: {
    toggle: (eventId) => 
      fetch(`${BASE_URL}/participant/wishlist/${eventId}`, {
        method: 'POST',
        headers: getHeaders(),
      }).then(handleResponse),

    get: () => 
      fetch(`${BASE_URL}/participant/wishlist`, {
        method: 'GET',
        headers: getHeaders(),
      }).then(handleResponse),

    check: (eventId) => 
      fetch(`${BASE_URL}/participant/wishlist/check/${eventId}`, {
        method: 'GET',
        headers: getHeaders(),
      }).then(handleResponse),
  },

  // Reviews
  reviews: {
    getByEvent: (eventId) => 
      fetch(`${BASE_URL}/events/${eventId}/reviews`, {
        method: 'GET',
      }).then(handleResponse),

    add: (reviewData) => 
      fetch(`${BASE_URL}/participant/reviews`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(reviewData),
      }).then(handleResponse),
  },

  // Notifications
  notifications: {
    get: () => 
      fetch(`${BASE_URL}/notifications`, {
        method: 'GET',
        headers: getHeaders(),
      }).then(handleResponse),

    readAll: () => 
      fetch(`${BASE_URL}/notifications/read-all`, {
        method: 'POST',
        headers: getHeaders(),
      }).then(handleResponse),
  },

  // Recommendations
  recommendations: {
    get: () => 
      fetch(`${BASE_URL}/participant/recommendations`, {
        method: 'GET',
        headers: getHeaders(),
      }).then(handleResponse),
  },

  // Analytics
  analytics: {
    getOrganizer: () => 
      fetch(`${BASE_URL}/organizer/analytics`, {
        method: 'GET',
        headers: getHeaders(),
      }).then(handleResponse),
  }
};
