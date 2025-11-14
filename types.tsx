export interface Column {
  name: string
  type: string
  nullable: boolean
  primaryKey: boolean
  description: string
}

export interface TableData {
  name: string
  rowCount: number
  description: string
  columns: Column[]
}
