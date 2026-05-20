# Contract: State JSON Schema (Import / Export)

**Branch**: `001-v1-core` | **Date**: 2026-03-07

## Purpose

This contract defines the exact JSON format used for import and export of the full
application state. It is the public data interchange format — any tool (or future app
version) that can read this schema can ingest Llamanomicon data.

## Schema

```json
{
  "$schema": "https://json-schema.org/draft/2020-12",
  "title": "LlamanomiconAppState",
  "type": "object",
  "required": ["library", "flows", "outputSettings"],
  "additionalProperties": false,
  "properties": {
    "library": {
      "type": "object",
      "required": ["groups"],
      "properties": {
        "groups": {
          "type": "array",
          "items": { "$ref": "#/$defs/Group" }
        }
      }
    },
    "flows": {
      "type": "array",
      "items": { "$ref": "#/$defs/Flow" }
    },
    "outputSettings": { "$ref": "#/$defs/OutputSettings" }
  },
  "$defs": {
    "Snippet": {
      "type": "object",
      "required": ["id", "text", "order", "groupId"],
      "additionalProperties": false,
      "properties": {
        "id": { "type": "string", "minLength": 1 },
        "text": { "type": "string", "minLength": 1, "maxLength": 10000 },
        "order": { "type": "integer", "minimum": 0 },
        "groupId": { "type": "string", "minLength": 1 }
      }
    },
    "Group": {
      "type": "object",
      "required": ["id", "name", "snippets"],
      "additionalProperties": false,
      "properties": {
        "id": { "type": "string", "minLength": 1 },
        "name": { "type": "string", "minLength": 1, "maxLength": 100 },
        "description": { "type": "string" },
        "snippets": { "type": "array", "items": { "$ref": "#/$defs/Snippet" } }
      }
    },
    "FlowActivation": {
      "type": "object",
      "required": ["groups", "snippets"],
      "additionalProperties": false,
      "properties": {
        "groups": {
          "type": "object",
          "additionalProperties": { "type": "boolean" }
        },
        "snippets": {
          "type": "object",
          "additionalProperties": { "type": "boolean" }
        }
      }
    },
    "Flow": {
      "type": "object",
      "required": ["id", "name", "icon", "activation"],
      "additionalProperties": false,
      "properties": {
        "id": { "type": "string", "minLength": 1 },
        "name": { "type": "string", "minLength": 1, "maxLength": 100 },
        "icon": { "type": "string", "minLength": 1 },
        "description": { "type": "string" },
        "activation": { "$ref": "#/$defs/FlowActivation" }
      }
    },
    "OutputSettings": {
      "type": "object",
      "required": ["showGroupHeaders", "snippetSeparator"],
      "additionalProperties": false,
      "properties": {
        "showGroupHeaders": { "type": "boolean" },
        "snippetSeparator": { "type": "string" }
      }
    }
  }
}
```

## Import Behavior

- **Replace-not-merge**: A successful import MUST discard the entire existing state
  and replace it with the imported state. There is no partial import or merge.
- **Validation**: The import function MUST validate the incoming JSON against this schema
  before applying it. An invalid file MUST be rejected with a user-visible error message.
- **UI state reset**: After import, `activeFlowId` and `selectedGroupId` are reset to
  `null` (the imported data's first flow/group is not auto-selected).

## Export Behavior

- **Format**: Pretty-printed JSON (`JSON.stringify(state, null, 2)`)
- **Filename**: `llamanomicon-export-YYYY-MM-DD.json` (date from `new Date()`)
- **Content**: Only `AppState` fields (`library`, `flows`, `outputSettings`) — UI state
  (`activeFlowId`, `selectedGroupId`) is NOT exported.

## Versioning

V1 exports do not include a schema version field. If a version field is needed in v2, it
will be added as an optional top-level `"version": "2.0"` field and the importer will
detect its absence to infer v1 format.

## Example

```json
{
  "library": {
    "groups": [
      {
        "id": "g-abc123",
        "name": "Coding Best Practices",
        "description": "General software engineering guidelines",
        "snippets": [
          {
            "id": "s-def456",
            "text": "Keep code modular and loosely coupled",
            "order": 0,
            "groupId": "g-abc123"
          },
          {
            "id": "s-ghi789",
            "text": "Explain assumptions when providing suggestions",
            "order": 1,
            "groupId": "g-abc123"
          }
        ]
      }
    ]
  },
  "flows": [
    {
      "id": "f-jkl012",
      "name": "Senior Dev Review",
      "icon": "💻",
      "description": "Code review assistant",
      "activation": {
        "groups": { "g-abc123": true },
        "snippets": { "s-def456": true, "s-ghi789": false }
      }
    }
  ],
  "outputSettings": {
    "showGroupHeaders": true,
    "snippetSeparator": "\n"
  }
}
```
