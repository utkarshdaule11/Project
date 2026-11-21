import { introContent } from "@content/states";

export const INTRO_TIMING = {
  lineGrowthDuration: 0.8,
  roadWidenDuration: 0.8,
  counterStart: 1.0,
  counterDuration: 2.4,
  landmarksStart: 1.2,
  landmarksDuration: 3.6,
  titleFadeStart: 3.6,
  autoCurtainDelay: 5.5,
  curtainSlideDuration: 0.9,
  curtainEase: [0.65, 0, 0.35, 1] as const,
  sessionKey: "bharat_highway_intro_v1",
};

export interface LandmarkItem {
  name: string;
  src: string;
}

export const LEFT_LANDMARKS: LandmarkItem[] = [
  { name: "Himalayas", src: "/intro/himalaya.svg" },
  { name: "Statue of Unity", src: "/intro/statue-of-unity.svg" },
  { name: "Goa Palms", src: "/intro/goa-palm.svg" },
];

export const RIGHT_LANDMARKS: LandmarkItem[] = [
  { name: "Hawa Mahal", src: "/intro/hawa-mahal.svg" },
  { name: "Gateway of India", src: "/intro/gateway-of-india.svg" },
  { name: "Vivekananda Rock", src: "/intro/vivekananda-rock.svg" },
];

export const INTRO_COPY = introContent;
