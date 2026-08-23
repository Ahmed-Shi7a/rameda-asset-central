const CODE39: Record<string, string> = {
  "0": "101001101101",
  "1": "110100101011",
  "2": "101100101011",
  "3": "110110010101",
  "4": "101001101011",
  "5": "110100110101",
  "6": "101100110101",
  "7": "101001011011",
  "8": "110100101101",
  "9": "101100101101",
  A: "110101001011",
  B: "101101001011",
  C: "110110100101",
  D: "101011001011",
  E: "110101100101",
  F: "101101100101",
  G: "101010011011",
  H: "110101001101",
  I: "101101001101",
  J: "101011001101",
  K: "110101010011",
  L: "101101010011",
  M: "110110101001",
  N: "101011010011",
  O: "110101101001",
  P: "101101101001",
  Q: "101010110011",
  R: "110101011001",
  S: "101101011001",
  T: "101011011001",
  U: "110010101011",
  V: "100110101011",
  W: "110011010101",
  X: "100101101011",
  Y: "110010110101",
  Z: "100110110101",
  "-": "100101011011",
  ".": "110010101101",
  " ": "100110101101",
  "*": "100101101101",
};

interface BarcodeProps {
  value: string;
  height?: number;
  showValue?: boolean;
  className?: string;
}

export function Barcode({ value, height = 64, showValue = true, className }: BarcodeProps) {
  const clean = (value || "0").toUpperCase().replace(/[^0-9A-Z\-. ]/g, "");
  const chars = ["*", ...clean.split(""), "*"];
  const bits = chars.map((c) => CODE39[c] ?? CODE39["*"]!).join("0");
  const unit = 2;
  const width = bits.length * unit;

  return (
    <figure className={className}>
      <svg
        role="img"
        aria-label={`Barcode ${clean}`}
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height={height}
        preserveAspectRatio="none"
      >
        <rect x="0" y="0" width={width} height={height} fill="#ffffff" />
        {bits.split("").map((bit, i) =>
          bit === "1" ? (
            <rect key={i} x={i * unit} y="0" width={unit} height={height} fill="#0b1a33" />
          ) : null,
        )}
      </svg>
      {showValue ? (
        <figcaption className="mt-1 text-center font-mono text-xs tracking-[0.2em] text-foreground">
          {clean}
        </figcaption>
      ) : null}
    </figure>
  );
}