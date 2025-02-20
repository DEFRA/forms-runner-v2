import { ControllerType } from '@defra/forms-model'

export default /** @type {FormDefinition} */ ({
  pages: [
    {
      path: '/page',
      title: 'Page 1',
      controller: ControllerType.Page,
      components: [],
      next: []
    }
  ],
  lists: [],
  sections: [],
  conditions: []
})

/**
 * @import { FormDefinition } from '@defra/forms-model'
 */
