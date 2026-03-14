export type CropStatus = 'planned' | 'growing' | 'harvested' | 'failed';

export interface Crop {
  id: string;
  name: string;
  variety: string;
  plantedDate?: string;
  expectedHarvestDate?: string;
  status: CropStatus;
  area: number; // in acres
  notes: string;
}

export interface Task {
  id: string;
  cropId: string;
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
  category: 'irrigation' | 'fertilization' | 'pest-control' | 'harvest' | 'other';
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'seed' | 'fertilizer' | 'pesticide' | 'tool';
  quantity: number;
  unit: string;
  minThreshold: number;
}
