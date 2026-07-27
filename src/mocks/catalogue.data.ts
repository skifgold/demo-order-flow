import type { Product } from '@/features/catalogue/api/product.contract'

export const catalogueProducts = [
  {
    id: 'modern-geometry-07',
    name: 'Modern Geometry No. 7',
    category: 'Abstract',
    imagePath: '/artwork/modern-geometry-07.jpg',
    pricesBySize: { A4: 3500, A3: 5500, A2: 8000 },
    availableQuantity: 8,
  },
  {
    id: 'botanical-study-01',
    name: 'Botanical Study I',
    category: 'Botanical',
    imagePath: '/artwork/botanical-study-01.jpg',
    pricesBySize: { A4: 3800, A3: 5800 },
    availableQuantity: 5,
  },
  {
    id: 'coastal-light',
    name: 'Coastal Light',
    category: 'Landscape',
    imagePath: '/artwork/coastal-light.jpg',
    pricesBySize: { A3: 6000, A2: 8500 },
    availableQuantity: 4,
  },
  {
    id: 'concrete-angles',
    name: 'Concrete Angles',
    category: 'Architecture',
    imagePath: '/artwork/concrete-angles.jpg',
    pricesBySize: { A4: 3600, A3: 5600, A2: 8100 },
    availableQuantity: 6,
  },
  {
    id: 'night-reflections',
    name: 'Night Reflections',
    category: 'Cityscape',
    imagePath: '/artwork/night-reflections.jpg',
    pricesBySize: { A4: 4000, A3: 6000 },
    availableQuantity: 3,
  },
  {
    id: 'cote-d-azur',
    name: 'Côte d’Azur',
    category: 'Vintage Travel',
    imagePath: '/artwork/cote-d-azur.jpg',
    pricesBySize: { A3: 5500, A2: 8000 },
    availableQuantity: 7,
  },
] satisfies Product[]
