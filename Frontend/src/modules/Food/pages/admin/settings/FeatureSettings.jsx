import React, { useEffect, useMemo, useState } from 'react';
import { adminAPI } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@food/components/ui/card';
import { Button } from '@food/components/ui/button';
import { Switch } from '@food/components/ui/switch';
import { Loader2, Save, ShoppingCart, ShoppingBag, Briefcase, Settings2 } from 'lucide-react';
import { toast } from 'sonner';

const FEATURE_KEYS = {
    RESTAURANT_SUBSCRIPTION: 'restaurant_subscription',
    COD_CONTROL: 'cod_control',
    ADMIN_ACCESS_SECTION: 'admin_access_section',
    ROOT_LANDING_AND_UNREGISTERED_CONTROL: 'root_landing_and_unregistered_control',
    MODULE_GROCERY: 'module_grocery',
    MODULE_ACCESSORIES: 'module_accessories',
    MODULE_SERVICES: 'module_services'
};

export default function FeatureSettings() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [features, setFeatures] = useState([]);
    const [updatingKeys, setUpdatingKeys] = useState({});

    const restaurantSubscription = useMemo(
        () => features.find((item) => item.key === FEATURE_KEYS.RESTAURANT_SUBSCRIPTION) || null,
        [features]
    );

    const codControl = useMemo(
        () => features.find((item) => item.key === FEATURE_KEYS.COD_CONTROL) || null,
        [features]
    );

    const adminAccessSection = useMemo(
        () => features.find((item) => item.key === FEATURE_KEYS.ADMIN_ACCESS_SECTION) || null,
        [features]
    );

    const rootLandingAndUnregisteredControl = useMemo(
        () => features.find((item) => item.key === FEATURE_KEYS.ROOT_LANDING_AND_UNREGISTERED_CONTROL) || null,
        [features]
    );

    const moduleGrocery = useMemo(
        () => features.find((item) => item.key === FEATURE_KEYS.MODULE_GROCERY) || null,
        [features]
    );

    const moduleAccessories = useMemo(
        () => features.find((item) => item.key === FEATURE_KEYS.MODULE_ACCESSORIES) || null,
        [features]
    );

    const moduleServices = useMemo(
        () => features.find((item) => item.key === FEATURE_KEYS.MODULE_SERVICES) || null,
        [features]
    );

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const res = await adminAPI.getFeatureSettings();
                const rows = Array.isArray(res?.data?.data) ? res.data.data : [];
                setFeatures(rows);
            } catch (error) {
                toast.error('Failed to load feature settings.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const setToggle = async (key, checked) => {
        // Optimistic UI update
        setFeatures((prev) =>
            prev.map((row) =>
                row.key === key ? { ...row, isEnabled: Boolean(checked) } : row
            )
        );
        setUpdatingKeys((prev) => ({ ...prev, [key]: true }));

        try {
            await adminAPI.updateFeatureSetting(key, { isEnabled: Boolean(checked) });

            // Sync with local storage for instant multi-tab sync
            try {
                const currentCache = JSON.parse(localStorage.getItem('app_module_settings_cache_v1') || '{}');
                if (key === FEATURE_KEYS.MODULE_GROCERY) currentCache.grocery = Boolean(checked);
                if (key === FEATURE_KEYS.MODULE_ACCESSORIES) currentCache.accessories = Boolean(checked);
                if (key === FEATURE_KEYS.MODULE_SERVICES) currentCache.services = Boolean(checked);
                localStorage.setItem('app_module_settings_cache_v1', JSON.stringify(currentCache));
            } catch {}

            window.dispatchEvent(new CustomEvent('adminFeatureSettingUpdated', {
                detail: {
                    key,
                    isEnabled: Boolean(checked)
                }
            }));

            const featureObj = features.find(f => f.key === key);
            const title = featureObj?.name || 'Setting';
            toast.success(`${title} ${checked ? 'enabled' : 'disabled'}`);
        } catch (error) {
            // Revert state on failure
            setFeatures((prev) =>
                prev.map((row) =>
                    row.key === key ? { ...row, isEnabled: !checked } : row
                )
            );
            toast.error(error?.response?.data?.message || 'Failed to update setting.');
        } finally {
            setUpdatingKeys((prev) => ({ ...prev, [key]: false }));
        }
    };

    const handleSave = async () => {
        const updates = [
            restaurantSubscription,
            codControl,
            adminAccessSection,
            rootLandingAndUnregisteredControl,
            moduleGrocery,
            moduleAccessories,
            moduleServices
        ].filter(Boolean);

        if (updates.length === 0) return;
        try {
            setSaving(true);
            await Promise.all(
                updates.map((feature) =>
                    adminAPI.updateFeatureSetting(feature.key, {
                        isEnabled: Boolean(feature.isEnabled)
                    })
                )
            );
            updates.forEach((feature) => {
                window.dispatchEvent(new CustomEvent('adminFeatureSettingUpdated', {
                    detail: {
                        key: feature.key,
                        isEnabled: Boolean(feature.isEnabled)
                    }
                }));
            });
            toast.success('All settings saved successfully.');
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to update feature setting.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[320px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Module & Feature Settings</h1>
                <p className="text-sm text-gray-500 mt-1">Manage optional business modules and platform feature toggles in real-time.</p>
            </div>

            {/* OPTIONAL BUSINESS MODULES SECTION */}
            <div className="border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 bg-gradient-to-br from-neutral-50/50 via-white to-neutral-50/30 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-900 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5 pb-2 border-b border-neutral-100 dark:border-zinc-800">
                    <Settings2 className="w-5 h-5 text-[#5C381E]" />
                    <div>
                        <h2 className="text-base font-bold text-gray-900 dark:text-white">Business Modules Management</h2>
                        <p className="text-xs text-gray-500">Enable or disable extra modules. Keep them OFF for a focused Single-Vendor Food Delivery experience.</p>
                    </div>
                </div>

                {/* Grocery Module Toggle */}
                <Card className="border-slate-200 dark:border-zinc-800 shadow-none">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                            <ShoppingCart className="w-4 h-4 text-emerald-600" />
                            <CardTitle className="text-base">Grocery Module</CardTitle>
                        </div>
                        <CardDescription>
                            Controls Grocery Management (Products, Orders, Categories) in Admin Sidebar and Grocery catalog visibility on user app.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between gap-4 pt-0">
                        <div className="text-sm font-medium">
                            {moduleGrocery?.isEnabled ? (
                                <span className="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full text-xs font-semibold">Active: Grocery is visible in Admin & User app</span>
                            ) : (
                                <span className="text-gray-500 bg-gray-100 dark:bg-zinc-800 px-2.5 py-0.5 rounded-full text-xs font-semibold">Disabled: Hidden from Admin Sidebar & User app</span>
                            )}
                        </div>
                        <Switch
                            checked={Boolean(moduleGrocery?.isEnabled)}
                            disabled={Boolean(updatingKeys[FEATURE_KEYS.MODULE_GROCERY])}
                            onCheckedChange={(checked) => setToggle(FEATURE_KEYS.MODULE_GROCERY, checked)}
                        />
                    </CardContent>
                </Card>

                {/* Accessories Module Toggle */}
                <Card className="border-slate-200 dark:border-zinc-800 shadow-none">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                            <ShoppingBag className="w-4 h-4 text-purple-600" />
                            <CardTitle className="text-base">Accessories Module</CardTitle>
                        </div>
                        <CardDescription>
                            Controls Accessories Management (Products, Orders, Categories) in Admin Sidebar and Accessories store visibility on user app.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between gap-4 pt-0">
                        <div className="text-sm font-medium">
                            {moduleAccessories?.isEnabled ? (
                                <span className="text-purple-600 bg-purple-50 dark:bg-purple-950/40 px-2.5 py-0.5 rounded-full text-xs font-semibold">Active: Accessories is visible in Admin & User app</span>
                            ) : (
                                <span className="text-gray-500 bg-gray-100 dark:bg-zinc-800 px-2.5 py-0.5 rounded-full text-xs font-semibold">Disabled: Hidden from Admin Sidebar & User app</span>
                            )}
                        </div>
                        <Switch
                            checked={Boolean(moduleAccessories?.isEnabled)}
                            disabled={Boolean(updatingKeys[FEATURE_KEYS.MODULE_ACCESSORIES])}
                            onCheckedChange={(checked) => setToggle(FEATURE_KEYS.MODULE_ACCESSORIES, checked)}
                        />
                    </CardContent>
                </Card>

                {/* Services Module Toggle */}
                <Card className="border-slate-200 dark:border-zinc-800 shadow-none">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-blue-600" />
                            <CardTitle className="text-base">Services Module</CardTitle>
                        </div>
                        <CardDescription>
                            Controls Service Management & Bookings in Admin Sidebar and Services booking section visibility on user app.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between gap-4 pt-0">
                        <div className="text-sm font-medium">
                            {moduleServices?.isEnabled ? (
                                <span className="text-blue-600 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-0.5 rounded-full text-xs font-semibold">Active: Services is visible in Admin & User app</span>
                            ) : (
                                <span className="text-gray-500 bg-gray-100 dark:bg-zinc-800 px-2.5 py-0.5 rounded-full text-xs font-semibold">Disabled: Hidden from Admin Sidebar & User app</span>
                            )}
                        </div>
                        <Switch
                            checked={Boolean(moduleServices?.isEnabled)}
                            disabled={Boolean(updatingKeys[FEATURE_KEYS.MODULE_SERVICES])}
                            onCheckedChange={(checked) => setToggle(FEATURE_KEYS.MODULE_SERVICES, checked)}
                        />
                    </CardContent>
                </Card>
            </div>

            {/* PLATFORM FEATURES SECTION */}
            <div className="space-y-4">
                <h2 className="text-base font-bold text-gray-900 dark:text-white">Platform Controls</h2>

                <Card className="border-slate-200 dark:border-zinc-800">
                    <CardHeader>
                        <CardTitle className="text-lg">Cash On Delivery (COD)</CardTitle>
                        <CardDescription>
                            Controls COD visibility on user checkout and delivery cash-limit related sections in delivery/admin panels.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between gap-4">
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                            {codControl?.isEnabled
                                ? 'Enabled: COD and cash-limit sections are visible'
                                : 'Disabled: COD and cash-limit sections are hidden'}
                        </div>
                        <Switch
                            checked={Boolean(codControl?.isEnabled)}
                            disabled={Boolean(updatingKeys[FEATURE_KEYS.COD_CONTROL])}
                            onCheckedChange={(checked) => setToggle(FEATURE_KEYS.COD_CONTROL, checked)}
                        />
                    </CardContent>
                </Card>

                <Card className="border-slate-200 dark:border-zinc-800">
                    <CardHeader>
                        <CardTitle className="text-lg">Admin Access Section</CardTitle>
                        <CardDescription>
                            Controls visibility of the Admin Access sidebar section, including Sub Admin List.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between gap-4">
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                            {adminAccessSection?.isEnabled
                                ? 'Enabled: Admin Access section is visible'
                                : 'Disabled: Admin Access section is hidden'}
                        </div>
                        <Switch
                            checked={Boolean(adminAccessSection?.isEnabled)}
                            disabled={Boolean(updatingKeys[FEATURE_KEYS.ADMIN_ACCESS_SECTION])}
                            onCheckedChange={(checked) => setToggle(FEATURE_KEYS.ADMIN_ACCESS_SECTION, checked)}
                        />
                    </CardContent>
                </Card>

                <Card className="border-slate-200 dark:border-zinc-800">
                    <CardHeader>
                        <CardTitle className="text-lg">Root Landing & Unregistered Restaurants</CardTitle>
                        <CardDescription>
                            Controls root URL and Unregistered Restaurants visibility. OFF redirects root (/) to /food/user and hides Unregistered Restaurants.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between gap-4">
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                            {rootLandingAndUnregisteredControl?.isEnabled
                                ? 'Enabled: root opens Landing Page and Unregistered Restaurants is visible'
                                : 'Disabled: root redirects to /food/user and Unregistered Restaurants is hidden'}
                        </div>
                        <Switch
                            checked={Boolean(rootLandingAndUnregisteredControl?.isEnabled)}
                            disabled={Boolean(updatingKeys[FEATURE_KEYS.ROOT_LANDING_AND_UNREGISTERED_CONTROL])}
                            onCheckedChange={(checked) => setToggle(FEATURE_KEYS.ROOT_LANDING_AND_UNREGISTERED_CONTROL, checked)}
                        />
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-end pt-2">
                <Button 
                    onClick={handleSave} 
                    disabled={saving}
                    className="bg-[#5C381E] hover:bg-[#482A14] text-white px-6 font-semibold"
                >
                    {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Changes
                </Button>
            </div>
        </div>
    );
}
