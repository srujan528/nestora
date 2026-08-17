export interface LocationCoord {
  latitude: number;
  longitude: number;
}

export interface RouteMatrixResult {
  distanceMeters: number;
  distanceKm: number;
  commuteTimeMins: number;
  commuteMode: 'WALKING' | 'DRIVING' | 'TRANSIT';
  commuteCostEstMonthly: number;
  commuteFareFormula: string;
  source: 'GOOGLE_ROUTES_API' | 'HAVERSINE_ESTIMATE';
}

export class GoogleRoutesService {
  /**
   * Calculates Haversine straight-line distance in meters between two lat/lng points.
   */
  static haversineDistanceMeters(origin: LocationCoord, dest: LocationCoord): number {
    const R = 6371000; // Earth radius in meters
    const dLat = ((dest.latitude - origin.latitude) * Math.PI) / 180;
    const dLng = ((dest.longitude - origin.longitude) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((origin.latitude * Math.PI) / 180) *
        Math.cos((dest.latitude * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  }

  /**
   * Transparent fare estimation model (explicitly labeled as an estimate).
   */
  static estimateFare(
    distanceMeters: number,
    mode: 'WALKING' | 'DRIVING' | 'TRANSIT'
  ): { estMonthlyCost: number; formula: string } {
    const distanceKm = distanceMeters / 1000;
    if (mode === 'WALKING' || distanceKm <= 1.0) {
      return {
        estMonthlyCost: 0,
        formula: 'Walking (Est. ₹0)',
      };
    } else if (mode === 'DRIVING') {
      const dailyFare = Math.round(15 + distanceKm * 12);
      const monthlyEst = dailyFare * 25; // 25 commute days
      return {
        estMonthlyCost: monthlyEst,
        formula: `Auto/E-Rickshaw (Est. ~₹${dailyFare}/day)`,
      };
    } else {
      const dailyFare = Math.round(10 + distanceKm * 6);
      const monthlyEst = dailyFare * 25;
      return {
        estMonthlyCost: monthlyEst,
        formula: `Bus/Metro Transit (Est. ~₹${dailyFare}/day)`,
      };
    }
  }

  /**
   * Compute route details between a college and PG location using Google Routes API (Compute Route Matrix),
   * falling back gracefully to Haversine calculations if API key is not configured or request fails.
   */
  static async computeDistanceAndCommute(
    origin: LocationCoord,
    destination: LocationCoord,
    preferredMode: 'WALKING' | 'DRIVING' | 'TRANSIT' = 'WALKING'
  ): Promise<RouteMatrixResult> {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (apiKey && apiKey !== 'YOUR_GOOGLE_MAPS_API_KEY' && apiKey.startsWith('AIza')) {
      try {
        const response = await fetch(
          'https://routes.googleapis.com/distanceMatrix/v2:computeRouteMatrix',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Goog-Api-Key': apiKey,
              'X-Goog-FieldMask':
                'originIndex,destinationIndex,status,distanceMeters,duration,condition',
            },
            body: JSON.stringify({
              origins: [
                {
                  waypoint: {
                    location: {
                      latLng: {
                        latitude: origin.latitude,
                        longitude: origin.longitude,
                      },
                    },
                  },
                },
              ],
              destinations: [
                {
                  waypoint: {
                    location: {
                      latLng: {
                        latitude: destination.latitude,
                        longitude: destination.longitude,
                      },
                    },
                  },
                },
              ],
              travelMode:
                preferredMode === 'DRIVING'
                  ? 'DRIVE'
                  : preferredMode === 'TRANSIT'
                    ? 'TRANSIT'
                    : 'WALK',
            }),
          }
        );

        if (response.ok) {
          const data: any = await response.json();
          if (Array.isArray(data) && data.length > 0 && data[0].distanceMeters !== undefined) {
            const matrixEntry = data[0];
            const distanceMeters = matrixEntry.distanceMeters;
            const durationSeconds = parseInt(matrixEntry.duration?.replace('s', '') || '0', 10);
            const commuteTimeMins = Math.max(1, Math.round(durationSeconds / 60));
            const fareInfo = this.estimateFare(distanceMeters, preferredMode);

            return {
              distanceMeters,
              distanceKm: parseFloat((distanceMeters / 1000).toFixed(2)),
              commuteTimeMins,
              commuteMode: preferredMode,
              commuteCostEstMonthly: fareInfo.estMonthlyCost,
              commuteFareFormula: fareInfo.formula,
              source: 'GOOGLE_ROUTES_API',
            };
          }
        }
      } catch (err) {
        console.warn('[GoogleRoutesService] API request failed, using Haversine fallback:', err);
      }
    }

    // Fallback Haversine Calculation
    const haversineMeters = this.haversineDistanceMeters(origin, destination);
    // Estimated road distance is approx 1.3x straight-line distance in cities
    const estimatedRoadMeters = Math.round(haversineMeters * 1.3);
    const distanceKm = parseFloat((estimatedRoadMeters / 1000).toFixed(2));

    let commuteTimeMins: number;
    let mode: 'WALKING' | 'DRIVING' | 'TRANSIT' = preferredMode;

    if (estimatedRoadMeters <= 1500) {
      mode = 'WALKING';
      commuteTimeMins = Math.max(1, Math.round(estimatedRoadMeters / 80)); // 80 m/min walking speed
    } else if (estimatedRoadMeters <= 5000) {
      mode = 'DRIVING';
      commuteTimeMins = Math.max(3, Math.round(estimatedRoadMeters / 300)); // 300 m/min city traffic speed
    } else {
      mode = 'TRANSIT';
      commuteTimeMins = Math.max(10, Math.round(estimatedRoadMeters / 400));
    }

    const fareInfo = this.estimateFare(estimatedRoadMeters, mode);

    return {
      distanceMeters: estimatedRoadMeters,
      distanceKm,
      commuteTimeMins,
      commuteMode: mode,
      commuteCostEstMonthly: fareInfo.estMonthlyCost,
      commuteFareFormula: fareInfo.formula,
      source: 'HAVERSINE_ESTIMATE',
    };
  }
}
