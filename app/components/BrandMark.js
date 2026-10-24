// The "Car Coolie" wordmark treatment — Exo 2, bold italic, "Car" in the
// site's red and "Coolie" in its navy, matching the actual logo's color
// split. Used for prominent headings, hero taglines and the footer brand
// line — body-copy/FAQ/bio mentions of the brand elsewhere intentionally
// stay plain text, not wrapped in this.
//
// `spaced` matches whichever form the surrounding copy already used —
// "Car Coolie" (two words, the default) or "CarCoolie" (one word, pass
// spaced={false}) — this only changes the gap between them, not the font
// or colors.
//
// `onDark` swaps "Coolie" from the site's navy (#0b1e42) to white — needed
// on the handful of sections whose background is that same navy, where the
// default color would otherwise render invisible against it.
export default function BrandMark({ className = "", spaced = true, onDark = false }) {
  return (
    <span className={`font-exo2 font-bold italic uppercase ${className}`}>
      <span className="text-red-600">Car</span>
      {spaced ? " " : ""}
      <span className={onDark ? "text-white" : "text-[#0b1e42]"}>Coolie</span>
    </span>
  );
}
