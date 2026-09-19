// Wraps any emoji in the headline so it waves on its own — the signature toy.
// Splits on the wave-able glyphs and animates just those, leaving text still.
export function WavingHeadline({ text }: { text: string }) {
  const parts = text.split(/(👋)/);
  return (
    <>
      {parts.map((part, i) =>
        part === "👋" ? (
          <span key={i} className="wave">
            👋
          </span>
        ) : (
          part
        ),
      )}
    </>
  );
}
