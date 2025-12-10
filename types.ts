export enum TreeMode {
  SCATTERED = 'SCATTERED',
  TREE_SHAPE = 'TREE_SHAPE'
}

export interface PositionData {
  scatter: [number, number, number];
  tree: [number, number, number];
  scale: number;
  rotation: [number, number, number];
  color?: string; // For variations
}

export interface UserImage {
  id: string;
  base64: string;
  positionData: PositionData;
}
