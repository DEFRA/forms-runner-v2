// import Module from 'node:module'

import {
  ControllerType,
  controllerNameFromPath,
  isControllerName,
  type Page
} from '@defra/forms-model'

import ScorePageController from '~/src/server/controllers/score-page.js'
import { type FormModel } from '~/src/server/plugins/engine/models/FormModel.js'
// import { CustomPageController } from '~/src/server/plugins/engine/pageControllers/CustomPageController.js'
import * as PageControllers from '~/src/server/plugins/engine/pageControllers/index.js'

// const require = Module.createRequire(import.meta.url)

export function isPageController(
  controllerName?: string | ControllerType
): controllerName is keyof typeof PageControllers {
  return isControllerName(controllerName) && controllerName in PageControllers
}

export type PageControllerClass = InstanceType<PageControllerType>
export type PageControllerType =
  (typeof PageControllers)[keyof typeof PageControllers]

/**
 * Creates page instance for each {@link Page} type
 */
export function createPage(model: FormModel, pageDef: Page) {
  const controllerName = controllerNameFromPath(pageDef.controller)

  if (!pageDef.controller) {
    return new PageControllers.QuestionPageController(model, pageDef)
  }

  // Patch legacy controllers
  if (controllerName && pageDef.controller !== controllerName) {
    pageDef.controller = controllerName
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
  if (pageDef.controller === 'CustomPageController') {
    const Ctrl = ScorePageController // require('~/src/server/controllers/score-page.js')
    return new Ctrl(model, pageDef)
  }

  let controller: PageControllerClass | undefined

  switch (pageDef.controller) {
    case ControllerType.Start:
      controller = new PageControllers.StartPageController(model, pageDef)
      break

    case ControllerType.Page:
      controller = new PageControllers.QuestionPageController(model, pageDef)
      break

    case ControllerType.Summary:
      controller = new PageControllers.SummaryPageController(model, pageDef)
      break

    case ControllerType.Status:
      controller = new PageControllers.StatusPageController(model, pageDef)
      break

    case ControllerType.FileUpload:
      controller = new PageControllers.FileUploadPageController(model, pageDef)
      break

    case ControllerType.Repeat:
      controller = new PageControllers.RepeatPageController(model, pageDef)
      break

    case ControllerType.Terminal:
      controller = new PageControllers.TerminalPageController(model, pageDef)
      break
  }

  if (typeof controller === 'undefined') {
    if (model.controllers?.[pageDef.controller]) {
      const Ctrl = model.controllers[pageDef.controller]
      // @ts-expect-error - TODO: Sort out the types so it understands that some controllers are custom/user provided
      controller = new Ctrl(model, pageDef)
    }
  }

  if (typeof controller === 'undefined') {
    throw new Error(`Page controller ${pageDef.controller} does not exist`)
  }

  return controller
}
