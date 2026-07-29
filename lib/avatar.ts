export const DEFAULT_AVATAR = "/bot_expressions/DEFAULT.jpg";
export const NEUTRAL_AVATAR = "/bot_expressions/NEUTRAL.jpg";

export const EXPRESSION_FILE_MAP: Record<string, string> = {
  SAFETY: "SAFETY.jpg",
  COMFORTING: "COMFORTING.jpg",
  EMPATHETIC: "EMPATHETIC.jpg",
  REFLECTIVE: "REFLECTIVE.jpg",
  WARM: "WARM.jpg",
  STRESSED: "STRESSED.jpg",
  TIRED: "TIRED.jpg",
  STEADY: "STEADY.jpg",
  TALKING: "TALKING.jpg",
  NEUTRAL: "NEUTRAL.jpg",
  DEFAULT: "DEFAULT.jpg",
};

export function getBotAvatar(expression?: string): string {
  if (!expression) return DEFAULT_AVATAR;
  const upper = expression.trim().toUpperCase();
  const file = EXPRESSION_FILE_MAP[upper];
  return file ? `/bot_expressions/${file}` : DEFAULT_AVATAR;
}
