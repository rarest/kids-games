export const CARD_STEP_X = 2.15, CARD_STEP_Z = 2.55;
export const CAMERA_SLOPE = .44;

// Fit the complete table inside the space between the HUD and bottom controls.
export function fitBoard({ count, columns, width, height }) {
  width = Math.max(1, width); height = Math.max(1, height);
  const rows = Math.ceil(count / columns), projection = 1 / Math.hypot(1, CAMERA_SLOPE);
  const top = height < 300 ? 48 : 112, bottom = height < 300 ? 78 : 100;
  const usableWidth = Math.max(32, width - 32), usableHeight = Math.max(40, height - top - bottom);
  const boardWidth = (columns - 1) * CARD_STEP_X + 2.5;
  const boardHeight = ((rows - 1) * CARD_STEP_Z + 3) * projection;
  const density = Math.pow(Math.max(1, count / 4), .035);
  const span = Math.max(width * 1.72 / 72, boardWidth * width / usableWidth, boardHeight * width / usableHeight) * density;
  const centerZ = (rows - 1) * CARD_STEP_Z / 2 - (top - bottom) / 2 * span / width / projection;
  return { span, center: { x: 0, z: centerZ } };
}
