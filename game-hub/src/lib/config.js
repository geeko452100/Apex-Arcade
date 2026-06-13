export const PORTFOLIO_URL = (import.meta.env.VITE_PORTFOLIO_URL ?? 'https://code-vector.pages.dev').replace(
  /\/$/,
  '',
)

export const PORTFOLIO_PROJECTS_URL = `${PORTFOLIO_URL}/projects`
