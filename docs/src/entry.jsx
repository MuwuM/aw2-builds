// @flow
import {
  APILanguageProvider, CustomComponent, Item, Skill, TraitLine
} from "@discretize/gw2-ui-new";
import React from "react";
import ReactDOM from "react-dom";

import layouts from "./keyboard_layouts/layouts.jsx";
import "@discretize/gw2-ui-new/dist/default_style.css";
import "@discretize/gw2-ui-new/dist/index.css";
import "@discretize/typeface-menomonia";
import skillFallback from "./skill-fallback.js";


(() => {


  let selectedLayout = "us";
  let keyMap = {};
  try {
    keyMap = (JSON.parse(localStorage.getItem("aw2-settings-key-mapping"))) || {};
  } catch (error) {
    console.error(error);
  }
  try {
    selectedLayout = (localStorage.getItem("aw2-settings-key-layout")) || "us";
  } catch (error) {
    console.error(error);
  }

  function keyFromDefault(def) {
    const res = Object.entries(layouts.us).find((a) => a[1] === def);
    if (res) {
      return res[0];
    }
    return null;
  }
  function localKey(key) {
    return layouts[selectedLayout][key];
  }

  function checkSettingsFromLocalStorage() {

    try {
      const newKeyMap = (JSON.parse(localStorage.getItem("aw2-settings-key-mapping"))) || {};
      if (JSON.stringify(newKeyMap) !== JSON.stringify(keyMap)) {
        keyMap = newKeyMap;
        updateKeymaps();
      }
    } catch (error) {
      console.error(error);
    }
    try {
      const newSelectedLayout = (localStorage.getItem("aw2-settings-key-layout")) || "us";
      if (newSelectedLayout !== selectedLayout) {
        selectedLayout = newSelectedLayout;
        updateKeymaps();
      }
    } catch (error) {
      console.error(error);
    }
    setTimeout(checkSettingsFromLocalStorage, 1000);
  }

  function saveKeyMap() {
    localStorage.setItem("aw2-settings-key-mapping", JSON.stringify(keyMap));
  }

  function saveSelectedLayout() {
    localStorage.setItem("aw2-settings-key-layout", selectedLayout);
  }

  function loadSpecializations() {
    const specializations = document.querySelectorAll("[data-armory-embed=\"specializations\"]");
    for (const specialization of specializations) {
      const traitlines = [];
      for (const line of (specialization.getAttribute("data-armory-ids") || "").split(",")) {
        const id = parseInt(line, 10);
        const defaultSelected = (specialization.getAttribute(`data-armory-${id}-traits`) || "").split(",").map((t) => parseInt(t, 10));
        traitlines.push(<TraitLine id={id} defaultSelected={defaultSelected}/>);
      }
      ReactDOM.render(<APILanguageProvider value="en"><div>{traitlines}</div></APILanguageProvider>, specialization);
    }
  }
  loadSpecializations();
  function loadItems() {
    const items = document.querySelectorAll("[data-aw2-item]");
    for (const item of items) {
      const id = parseInt(item.getAttribute("data-aw2-item"), 10);
      ReactDOM.render(<APILanguageProvider value="en"><Item id={id} inline={true} /></APILanguageProvider>, item);
    }
  }
  loadItems();

  function loadSkillLoadout() {
    const loadouts = Array.from(document.querySelectorAll("[data-armory-embed=\"skills\"][data-armory-ids]"));
    loadouts.forEach((loadout) => {
      const skillLoadout = [];
      let i = 0;
      for (const line of (loadout.getAttribute("data-armory-ids") || "").split(",")) {
        const id = parseInt(line, 10);
        const slotId = `${(i + 6) % 10}`;
        skillLoadout.push(<div key={`slot-${slotId}`} className="aw2-skill-loadout-slot" data-aw2-key={slotId}>
          <Skill id={id} disableText={true} style={{fontSize: "64px"}}/>
          <div className="aw2-show-key">{localKey(keyFromDefault(slotId))}</div>
        </div>);
        i++;
      }

      ReactDOM.render(<APILanguageProvider value="en"><div className="aw2-skill-loadout" >{skillLoadout}</div></APILanguageProvider>, loadout);

    });
  }
  loadSkillLoadout();

  function loadSkills() {
    const aw2Skills = Array.from(document.querySelectorAll("[data-aw2-skill]"));
    aw2Skills.forEach((key) => {
      if (!key.classList.contains("armory-inline")) {
        const skillId = key.getAttribute("data-aw2-skill");
        key.classList.add("armory-inline");
        const armoryElement = document.createElement("span");
        key.appendChild(armoryElement);
        if (skillFallback[skillId]) {
          ReactDOM.render(<APILanguageProvider value="en">
            <CustomComponent type="Skill" className="aw2-skill-inline" data={skillFallback[skillId]} disableText={true} style={{
              fontSize: "32px",
              lineHeight: "32px"
            }} />
          </APILanguageProvider>, armoryElement);
        } else {
          ReactDOM.render(<APILanguageProvider value="en"><Skill className="aw2-skill-inline" id={skillId} disableText={true} style={{
            fontSize: "32px",
            lineHeight: "32px"
          }} /></APILanguageProvider>, armoryElement);
        }
        const showKey = document.createElement("span");
        showKey.classList.add("aw2-show-key");
        showKey.textContent = key.getAttribute("data-aw2-key-mapped") || localKey(keyFromDefault(key.getAttribute("data-aw2-key"))) ;
        key.appendChild(showKey);
      }
    });

    const keyMapNotice = document.querySelector(".aw2-key-map-notice");
    if (aw2Skills.length > 0) {
      if (!keyMapNotice) {
        const keyMapNoticeParent = document.querySelector(".sidebar__right>.toc");
        const keyMapNotice = document.createElement("footer");
        keyMapNotice.classList.add("aw2-key-map-notice");
        ReactDOM.render(<a href="/key-bind-mapping"><i className="fas fa-cog"></i> Customize Key-bindings</a>, keyMapNotice);
        keyMapNoticeParent.appendChild(keyMapNotice);
      }
    } else {
      if (keyMapNotice) {
        keyMapNotice.remove();
      }
    }
  }
  loadSkills();
  function updateKeymaps() {
    const aw2Skills = Array.from(document.querySelectorAll("[data-aw2-key]"));
    aw2Skills.forEach((key) => {
      const k = keyFromDefault(key.getAttribute("data-aw2-key"));
      if (keyMap[k]) {
        key.setAttribute("data-aw2-key-mapped", keyMap[k]);
      } else {
        key.removeAttribute("data-aw2-key-mapped");
      }
      const showKey = key.querySelector(".aw2-show-key");
      if (showKey) {
        showKey.textContent = key.getAttribute("data-aw2-key-mapped") || localKey(k);
      }
    });
  }
  updateKeymaps();

  const buttons = {
    1: "Mouse1",
    2: "Mouse2",
    4: "Mouse3",
    8: "Mouse4",
    16: "Mouse5"
  };


  function skillSettingKeyDownHandler(event) {
    if (event instanceof MouseEvent) {
      if (document.activeElement === event.target) {
        event.preventDefault();
        console.log(event, event.buttons);
        if (buttons[event.buttons]) {
          const defaultKey = keyFromDefault(event.target.getAttribute("data-aw2-settings-key"));
          keyMap[defaultKey] = buttons[event.buttons];
          saveKeyMap();
          event.target.value = keyMap[defaultKey];
        }
      }
    } else if (event instanceof KeyboardEvent) {
      event.preventDefault();
      const defaultKey = keyFromDefault(event.target.getAttribute("data-aw2-settings-key"));
      if ([
        "Shift",
        "Alt",
        "Control"
      ].includes(event.key)) {
        keyMap[defaultKey] = localKey(event.code);
        saveKeyMap();
        event.target.value = keyMap[defaultKey];
        return;
      }
      if (event.key === "Escape") {
        delete keyMap[defaultKey];
        saveKeyMap();
        event.target.value = "";
        event.target.blur();
        return;
      }
      const modifiers = [];
      if (event.ctrlKey) {
        modifiers.push("Ctrl +");
      }
      if (event.altKey) {
        modifiers.push("Alt +");
      }
      if (event.shiftKey) {
        modifiers.push("Shift +");
      }
      const keyLabel = localKey(event.code);
      if (keyLabel.includes(" ")) {
        modifiers.push(`(${keyLabel})`);
      } else {
        modifiers.push(keyLabel);
      }


      keyMap[defaultKey] = modifiers.join(" ");
      saveKeyMap();
      event.target.value = keyMap[defaultKey];
    }
  }

  function updateSettingsControl() {
    const settingsHook = document.querySelector("[data-aw2-settings=\"hook\"]");
    if (settingsHook) {
      const aw2NoJsNotice = settingsHook.querySelector(".aw2-no-js-notice");
      aw2NoJsNotice.style.display = "none";
      const keyBindingList = settingsHook.querySelector(".aw2-key-binding-list");
      keyBindingList.style.display = "block";

      const aw2KeyboardLayout = keyBindingList.querySelector("#aw2-keyboard-layout");
      aw2KeyboardLayout.value = selectedLayout;
      aw2KeyboardLayout.addEventListener("change", () => {
        if (aw2KeyboardLayout.value !== selectedLayout) {
          selectedLayout = aw2KeyboardLayout.value;
          saveSelectedLayout();
          aw2SkillKeySettings.forEach((aw2SkillKeySettingInput) => {
            const key = keyFromDefault(aw2SkillKeySettingInput.getAttribute("data-aw2-settings-key"));
            aw2SkillKeySettingInput.setAttribute("placeholder", localKey(key));
            if (keyMap[key]) {
              aw2SkillKeySettingInput.value = keyMap[key];
            }
          });
        }
      });

      const aw2SkillKeySettings = Array.from(document.querySelectorAll("[data-aw2-settings-key]"));
      aw2SkillKeySettings.forEach((aw2SkillKeySettingInput) => {
        aw2SkillKeySettingInput.addEventListener("keydown", skillSettingKeyDownHandler);
        aw2SkillKeySettingInput.addEventListener("mousedown", skillSettingKeyDownHandler);
        const key = keyFromDefault(aw2SkillKeySettingInput.getAttribute("data-aw2-settings-key"));
        aw2SkillKeySettingInput.setAttribute("placeholder", localKey(key));
        if (keyMap[key]) {
          aw2SkillKeySettingInput.value = keyMap[key];
        }
      });
    } else {
      checkSettingsFromLocalStorage();
    }
  }
  updateSettingsControl();
})();
