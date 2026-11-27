function hexToRgb(hex) {
  const num = parseInt(hex.replace("#", ""), 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}
function sRgbToLin(c) {
  const v = c / 255;
  return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}
function relLuminance(hex) {
  const [r, g, b] = hexToRgb(hex);
  return 0.2126 * sRgbToLin(r) + 0.7152 * sRgbToLin(g) + 0.0722 * sRgbToLin(b);
}
function contrastRatio(hex1, hex2) {
  const l1 = relLuminance(hex1);
  const l2 = relLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

const pairs = [
  ["#F2EBDD", "#091522", "Cream on Deep Navy (#091522)"],
  ["#F2EBDD", "#101F2E", "Cream on Card Navy (#101F2E)"],
  ["#F2EBDD", "#142638", "Cream on Sub-panel Slate (#142638)"],
  ["#D9B88F", "#091522", "Sandstone on Deep Navy (#091522)"],
  ["#D9B88F", "#101F2E", "Sandstone on Card Navy (#101F2E)"],
  ["#D9B88F", "#142638", "Sandstone on Sub-panel Slate (#142638)"],
  ["#E9A15C", "#091522", "Saffron on Deep Navy (#091522)"],
  ["#E9A15C", "#101F2E", "Saffron on Card Navy (#101F2E)"],
  ["#091522", "#E9A15C", "Deep Navy on Saffron (Active Button/Badge)"],
  ["#A2B3C4", "#091522", "Muted Slate on Deep Navy (#091522)"],
  ["#A2B3C4", "#101F2E", "Muted Slate on Card Navy (#101F2E)"],
  ["#D9B88F", "#294A3B", "Sandstone on Forest Green (Passed Badge)"],
  ["#E9A15C", "#294A3B", "Saffron on Forest Green"]
];

console.log("=== WCAG 2.1 CONTRAST RATIO AUDIT ===");
pairs.forEach(([fg, bg, label]) => {
  const ratio = contrastRatio(fg, bg);
  const aaNormal = ratio >= 4.5 ? "PASS" : "FAIL";
  const aaLarge = ratio >= 3.0 ? "PASS" : "FAIL";
  const aaaNormal = ratio >= 7.0 ? "PASS" : "FAIL";
  console.log(`${label}: ${ratio.toFixed(2)}:1 | AA Normal: ${aaNormal} | AA Large: ${aaLarge} | AAA: ${aaaNormal}`);
});
