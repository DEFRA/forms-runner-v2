# forms-engine

Form hapi-plugin

...

## Templates

The following elements support [LiquidJS templates](https://liquidjs.com/):

- Page **title**
- Form component **titles**
  - Support for fieldset legend text or label text
  - This includes when the title is used in **error messages**
- Html (guidance) component **content**

### Liquid Filters

There are a number of `LiquidJS` filters available to you from within the templates:

- `page` - returns the page for the given path
- `pagedef` - returns the page definition for the given path
- `field` - returns the component field for the given name
- `fielddef` - returns the component field definition for the given name
- `href` - returns the page href for the given page
- `answer` - returns the users answer for a given component field
- `evaluate` - evaluates and returns a Liquid template

### Examples

```json
...
"pages": [
  {
    "title": "What's your name?",
    "path": "/full-name",
    "components": [
      {
        "name": "WmHfSb",
        "title": "What's your full name?",
        "type": "TextField",
        "hint": "",
        "options": {},
        "schema": {}
      }
    ]
  },
  {
    "title": "Are you in England?",
    "path": "/are-you-in-england",
    "components": [
      {
        "name": "TKsWbP",
        "title": "Are you in England, {{ WmHfSb }}?",
        "type": "YesNoField",
        "hint": "",
        "options": {},
        "schema": {}
      }
    ]
  },
  {
    "title": "Information: In England? {{ TKsWbP }}?",
    "path": "/information",
    "components": [
      {
        "name": "Bcrhst",
        "title": "Html",
        "type": "Html",
        "content": "<p class=\"govuk-body\">
          // Use Liquid's `assign` to create a variable that holds reference to the \"/are-you-in-england\" page
          {%- assign inEngland = \"/are-you-in-england\" | page -%}

          // Use the reference to `evaluate` the title
          {{ inEngland.title | evaluate }}<br>

          // and to display the page href
          {{ inEngland | href }}<br>

          // Use the `answer` filter to render the user provided answer to a question
          {{ 'TKsWbP' | answer }}
        </p>\n",
        "options": {},
        "schema": {}
      }
    ]
  }
],...
```
