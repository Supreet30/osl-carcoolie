"use client";

import { useEffect, useRef } from "react";
import { importLibrary, setOptions } from "@googlemaps/js-api-loader";

// setOptions() only takes effect before the first importLibrary() call —
// call it once at module scope, not inside the component (which can
// mount/unmount repeatedly as the picker modal opens and closes).
setOptions({ key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY, v: "weekly" });

// Same props shape as LeafletMap ([lat, lng] tuples) so MapPickerModal can
// use either one interchangeably.
export default function GoogleMap({ center, marker, onPick }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const markerCtorRef = useRef(null);
  const onPickRef = useRef(onPick);

  useEffect(() => {
    onPickRef.current = onPick;
  }, [onPick]);

  useEffect(() => {
    let cancelled = false;
    // "geocoding" isn't used directly here — geocode.js imports it itself,
    // on demand, for both the click-to-reverse-geocode and search-to-
    // forward-geocode paths. It's warmed up alongside "maps"/"marker" here
    // too so the *first* pin click or search doesn't pay for loading that
    // script chunk on top of the actual geocoding request — importLibrary()
    // caches per name, so every later call just resolves instantly.
    Promise.all([importLibrary("maps"), importLibrary("marker"), importLibrary("geocoding")]).then(([{ Map }, { Marker }]) => {
      if (cancelled || !containerRef.current) return;
      markerCtorRef.current = Marker;
      mapRef.current = new Map(containerRef.current, {
        center: { lat: center[0], lng: center[1] },
        zoom: 12,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        clickableIcons: false,
      });
      mapRef.current.addListener("click", (event) => {
        onPickRef.current(event.latLng.lat(), event.latLng.lng());
      });
    });
    return () => {
      cancelled = true;
    };
    // `center` here is only the map's initial view on mount — later
    // recentering happens via the marker effect below, not by re-running
    // this one, so it's deliberately excluded from the dependency array.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keeps the pin (and pan) in sync whenever the marker is set
  // programmatically (e.g. "Use current location", or a search result),
  // not just from clicks.
  useEffect(() => {
    if (!mapRef.current || !markerCtorRef.current) return;
    if (!marker) {
      markerRef.current?.setMap(null);
      markerRef.current = null;
      return;
    }
    const position = { lat: marker[0], lng: marker[1] };
    if (markerRef.current) {
      markerRef.current.setPosition(position);
    } else {
      markerRef.current = new markerCtorRef.current({ position, map: mapRef.current });
    }
    mapRef.current.panTo(position);
  }, [marker]);

  return <div ref={containerRef} className="h-full w-full" />;
}
