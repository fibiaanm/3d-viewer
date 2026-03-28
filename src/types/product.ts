export interface ProductDimensions {
  width: number
  height: number
  depth: number
  unit: string
}

export interface Product {
  id: string
  title: string
  description: string
  longDescription: string
  category: string
  tags: string[]
  price: number
  currency: string
  previewImage: string
  dimensions: ProductDimensions
  weight: string
  materials: string[]
  gallery: string[]
  modelUrl: string | null
  contractPath: string
}
