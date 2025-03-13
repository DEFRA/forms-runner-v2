import actions from '~/src/server/actions/actions.json'

export function fetchActions() {
  return actions
}

export function findActionById(id) {
  return actions.find((action) => action.id === id)
}
