import { useState, useEffect } from "react";
import { adminAPI } from "@food/api";

const MODULE_SETTINGS_KEY = "app_module_settings_cache_v1";

export function useModuleSettings() {
  const [modulesState, setModulesState] = useState(() => {
    try {
      const saved = localStorage.getItem(MODULE_SETTINGS_KEY);
      return saved ? JSON.parse(saved) : { grocery: false, accessories: false, services: false };
    } catch {
      return { grocery: false, accessories: false, services: false };
    }
  });

  useEffect(() => {
    let isMounted = true;

    const fetchSettings = async () => {
      try {
        const res = await adminAPI.getPublicFeatureSettings();
        const rows = Array.isArray(res?.data?.data) ? res.data.data : [];
        const grocery = rows.find(r => r.key === "module_grocery")?.isEnabled ?? false;
        const accessories = rows.find(r => r.key === "module_accessories")?.isEnabled ?? false;
        const services = rows.find(r => r.key === "module_services")?.isEnabled ?? false;

        const next = {
          grocery: Boolean(grocery),
          accessories: Boolean(accessories),
          services: Boolean(services)
        };

        if (isMounted) {
          setModulesState(next);
          try {
            localStorage.setItem(MODULE_SETTINGS_KEY, JSON.stringify(next));
          } catch {}
        }
      } catch (err) {
        // Fallback to cached state
      }
    };

    fetchSettings();

    // Listen to local window events
    const handleUpdate = () => {
      fetchSettings();
    };
    window.addEventListener("adminFeatureSettingUpdated", handleUpdate);

    // Listen to cross-tab storage updates
    const handleStorage = (e) => {
      if (e.key === MODULE_SETTINGS_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (isMounted && parsed) {
            setModulesState(parsed);
          }
        } catch {}
      }
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      isMounted = false;
      window.removeEventListener("adminFeatureSettingUpdated", handleUpdate);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  return modulesState;
}
