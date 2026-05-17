/**
 * Resposta genérica de erro da API.
 * Baseada nos formatos de erro do backend (Bean Validation + domínio).
 */
export interface ApiError {
  message?: string
  errors?: Array<{ message: string; field?: string }>
  violations?: Array<{ message: string; field?: string }>
  rejectedBy?: string
}

/**
 * Wrapper genérico de resposta paginada.
 */
export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  page: number
  size: number
}

/**
 * Parâmetros de paginação para requisições ao backend.
 */
export interface PageRequest {
  page?: number
  size?: number
  sort?: string
}
