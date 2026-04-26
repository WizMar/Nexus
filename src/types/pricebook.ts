export type PriceBookItem = {
  id: string
  name: string
  description: string
  category: string
  unit: string
  unitPrice: number
  createdAt: string
}

export const UNIT_OPTIONS = ['hr', 'ea', 'sqft', 'lft', 'sq', 'day', 'lot', 'yd', 'ton', 'gal']
export const CATEGORY_OPTIONS = ['Labor', 'Materials', 'Equipment', 'Subcontractor', 'Permit', 'Misc']
