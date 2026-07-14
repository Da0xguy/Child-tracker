/**
 * Types and interfaces for the Student Satellite Tracking System.
 */

export interface UserProfile {
  studentName: string;
  fatherEmail: string;
  motherEmail: string;
  chipId: string;
  email: string;
}

export interface TrackingPoint {
  lat: number;
  lng: number;
  speed: number; // km/h
  battery: number; // percentage
  signal: 'Excellent' | 'Good' | 'Weak' | 'None';
  lastUpdated: string;
  locationName: string;
}

export interface GeofenceZone {
  name: string;
  lat: number;
  lng: number;
  radius: number; // meters
  type: 'safe' | 'danger';
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'info' | 'warning' | 'success';
}

export type ActivePage = 'landing' | 'login' | 'dashboard' | 'settings';
