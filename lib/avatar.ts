export const DEFAULT_AVATAR = "/bot_expressions/Attrangi's HQ/DEFAULT 1.png";
export const NEUTRAL_AVATAR = "/bot_expressions/Attrangi's HQ/NEUTRAL 1.png";

export const EXPRESSION_FILE_MAP: Record<string, string> = {
  SAFETY: "SAFETY 1.png",
  COMFORTING: "COMFORTING 1.png",
  EMPATHETIC: "EMPATHETIC 1.png",
  REFLECTIVE: "REFLECTIVE 1.png",
  WARM: "WARM 1.png",
  STRESSED: "STRESSED 1.png",
  TIRED: "TIRED 1.png",
  STEADY: "STEADY 1.png",
  TALKING: "TALKING 1.png",
  NEUTRAL: "NEUTRAL 1.png",
  DEFAULT: "DEFAULT 1.png",
};

export function getBotAvatar(expression?: string): string {
  if (!expression) return DEFAULT_AVATAR;
  const upper = expression.trim().toUpperCase();
  const file = EXPRESSION_FILE_MAP[upper];
  return file ? `/bot_expressions/Attrangi's HQ/${file}` : DEFAULT_AVATAR;
}
