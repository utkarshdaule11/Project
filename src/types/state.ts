export type ImageType = "landmark" | "nature";

export interface Speciality {
  title: string;
  description: string;
}

export interface StateImage {
  src: string;
  alt: string;
  caption: string;
  type: ImageType;
}

export interface StateChapter {
  id: string;
  order: number;
  name: string;
  stop: string;
  tagline: string;
  lat: number;
  lng: number;
  intro: string;
  specialities: [Speciality, Speciality];
  images: [StateImage, StateImage];
}

export interface GeoJsonFeature {
  type: string;
  id?: string | number;
  properties?: Record<string, unknown>;
  geometry: {
    type: string;
    coordinates: unknown;
  };
}

export interface GeoJsonData {
  type: string;
  features: GeoJsonFeature[];
}

export interface HeroStat {
  label: string;
  value: string;
}

export interface HeroData {
  kicker: string;
  title: string;
  tagline: string;
  stats: [HeroStat, HeroStat, HeroStat];
  fallbackImage: {
    src: string;
    alt: string;
  };
}
