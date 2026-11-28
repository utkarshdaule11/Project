"use client";

import { useState, useCallback } from "react";

export type VehicleType = "sedan" | "cruiser" | "suv";

export interface VehicleOption {
  id: VehicleType;
  label: string;
  tagline: string;
}

export const VEHICLE_OPTIONS: VehicleOption[] = [
  { id: "sedan", label: "Heritage Sedan", tagline: "Classic Grand Trunk Cruiser" },
  { id: "cruiser", label: "Himalayan Bike", tagline: "Open-Air Mountain Rider" },
  { id: "suv", label: "Overland 4x4", tagline: "Trans-Subcontinental Explorer" },
];

export function useVehicleChoice() {
  const [vehicle, setVehicle] = useState<VehicleType>("suv");

  const selectVehicle = useCallback((next: VehicleType) => {
    setVehicle(next);
  }, []);

  return { vehicle, selectVehicle };
}
