export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  description: string;
  quantity: number;
  detectedAt: string;
  scannerId: string;
  status: 'Verified' | 'Flagged' | 'Low Stock';
  thumbnail: string;
  aiCount?: number;
  manualCorrection?: number;
}
