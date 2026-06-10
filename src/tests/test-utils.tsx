import { render, type RenderOptions } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { store as appStore } from '../store'
import type { ReactElement } from 'react'

interface Options extends RenderOptions {
  route?: string
}

export function renderWithProviders(
  ui: ReactElement,
  { route = '/', ...opts }: Options = {},
) {
  return render(
    <Provider store={appStore}>
      <MemoryRouter initialEntries={[route]}>
        {ui}
      </MemoryRouter>
    </Provider>,
    opts,
  )
}
