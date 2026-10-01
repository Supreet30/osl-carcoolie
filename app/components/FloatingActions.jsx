import GetQuoteButton from "./GetQuoteButton";
import WhatsAppButton from "./Whatsapp";

// Mounted once in app/layout.js so both float on every page — a single
// fixed container owns the bottom-right position so the two buttons stay
// aligned and spaced as a unit, rather than each guessing at the other's
// size/offset.
export default function FloatingActions() {
  return (
    <div className="fixed bottom-4 right-5 z-50 flex items-center gap-3">
      <GetQuoteButton />
      <WhatsAppButton />
    </div>
  );
}
