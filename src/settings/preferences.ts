import { config, homepage } from "../../package.json"
import { getString } from "../utils/locale"
import React from "react"
import ReactDOM from "react-dom"
import LocalAIModelSelection from "../components/LocalAIModelSelection"

// Registers the preferences pane with Zotero
export function registerPrefs() {
  Zotero.PreferencePanes.register({
    pluginID: config.addonID,
    src: rootURI + "chrome/content/preferences.xhtml",
    label: getString("prefs-title"),
    image: `chrome://${config.addonRef}/content/icons/favicon@0.333x.png`,
    helpURL: homepage,
  })
}

// Called when the preferences pane is opened
export function registerPrefsScripts(_window: Window) {
  if (!addon.data.prefs) {
    addon.data.prefs = {
      window: _window,
      llmProvider: "openai", // Default to OpenAI
      localAISettings: {
        basePath: "",
        apiKey: "",
        selectedModel: "",
      },
    }
  } else {
    addon.data.prefs.window = _window
  }

  updatePrefsUI()
}

// Dynamically render the preferences UI
function updatePrefsUI() {
  const prefsWindow = addon.data.prefs.window

  // Get the container for the preferences pane
  const container = prefsWindow.document.querySelector(
    `#zotero-prefpane-${config.addonRef}-container`
  )
  if (!container) {
    console.error("Preferences container not found!")
    return
  }

  // Render the React preferences UI
  ReactDOM.render(
    <div className="flex flex-col gap-4">
      {/* LLM Provider Selection */}
      <h3>{getString("prefs-llm-provider-title")}</h3>
      <label htmlFor="llm-provider">{getString("prefs-llm-provider-label")}</label>
      <select
        id="llm-provider"
        value={addon.data.prefs.llmProvider}
        onChange={(e) => {
          addon.data.prefs.llmProvider = e.target.value
          updateLocalAIVisibility(e.target.value === "localai")
        }}
        className="border border-gray-300 rounded-lg p-2"
      >
        <option value="openai">{getString("prefs-llm-provider-openai")}</option>
        <option value="localai">{getString("prefs-llm-provider-localai")}</option>
      </select>

      {/* LocalAI Settings */}
      <div id="localai-settings" style={{ display: addon.data.prefs.llmProvider === "localai" ? "block" : "none" }}>
        <LocalAIModelSelection
          settings={addon.data.prefs.localAISettings}
          onUpdateSettings={(updatedSettings) => {
            addon.data.prefs.localAISettings = updatedSettings
          }}
        />
      </div>
    </div>,
    container
  )
}

// Toggle the visibility of LocalAI-specific settings
function updateLocalAIVisibility(isLocalAI) {
  const prefsWindow = addon.data.prefs.window
  const localAISettingsDiv = prefsWindow.document.querySelector("#localai-settings")
  if (localAISettingsDiv) {
    localAISettingsDiv.style.display = isLocalAI ? "block" : "none"
  }
}
