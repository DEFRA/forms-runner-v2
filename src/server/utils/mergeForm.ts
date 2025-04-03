import fs from 'fs'
import path from 'path'

type Json = string | number | boolean | null | Json[] | { [key: string]: Json }

type FormKeys = 'pages' | 'lists' | 'conditions'

interface FormFragment {
  pages?: Json[]
  lists?: Json[]
  conditions?: Json[]
}

export function mergeForm(
  baseFilePath: string,
  extrasFolder: string,
  outputFile: string
): void {
  const base = JSON.parse(fs.readFileSync(baseFilePath, 'utf-8')) as Record<
    string,
    Json
  >

  const initialStructure: Record<FormKeys, Json[]> = {
    pages: [],
    lists: [],
    conditions: []
  }

  for (const key of Object.keys(initialStructure) as FormKeys[]) {
    if (!Array.isArray(base[key])) {
      base[key] = []
    }
  }

  const files = fs.readdirSync(extrasFolder).filter((f) => f.endsWith('.json'))

  for (const file of files) {
    const fullPath = path.join(extrasFolder, file)
    const fragment = JSON.parse(
      fs.readFileSync(fullPath, 'utf-8')
    ) as FormFragment

    for (const key of ['pages', 'lists', 'conditions'] as FormKeys[]) {
      const items = fragment[key]
      if (Array.isArray(items)) {
        ;(base[key] as Json[]).push(...items)
      }
    }
  }

  fs.writeFileSync(outputFile, JSON.stringify(base, null, 2), 'utf-8')
}
