import React, { useState, useEffect, useMemo } from 'react';
import {
  Palette,
  Edit2,
  Check,
  X,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  Info,
  Sliders,
  Eye,
  CheckCircle2,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';
import {
  DEFAULT_BRAND_PALETTE,
  isValidHex,
  normalizeHex
} from '../../services/brandPaletteService';

export default function BrandIdentityPaletteSection({
  compact = false,
  showStandardsInfo = true,
  title = "Official Brand Identity Palette (Strictly Enforced)",
  subtitle = "Only four official colors across all portals and responsive modules."
}) {
  const {
    brandPalette = DEFAULT_BRAND_PALETTE,
    updateBrandPalette,
    resetBrandPalette,
    currentPortal = 'admin',
    addToast
  } = useCrm();

  const isAdmin = currentPortal === 'admin';

  // Local state for editing
  const [isEditing, setIsEditing] = useState(false);
  const [draftPalette, setDraftPalette] = useState(() => {
    return (brandPalette && brandPalette.length === 4)
      ? brandPalette.map(c => ({ ...c }))
      : DEFAULT_BRAND_PALETTE.map(c => ({ ...c }));
  });

  // Track validation errors per color key
  const [hexErrors, setHexErrors] = useState({});

  // Confirmation modal state
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [auditNote, setAuditNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Sync draft whenever brandPalette changes externally (and not actively editing)
  useEffect(() => {
    if (!isEditing && brandPalette && brandPalette.length === 4) {
      setDraftPalette(brandPalette.map(c => ({ ...c })));
      setHexErrors({});
    }
  }, [brandPalette, isEditing]);

  // Map draft colors for quick lookup in Live Preview
  const previewColors = useMemo(() => {
    const map = {};
    draftPalette.forEach(c => {
      const key = c.key || (c.name === 'Warm Cream' ? 'warmCream' : c.name === 'Spartan Orange' ? 'spartanOrange' : c.name === 'Navy Blue' ? 'navyBlue' : 'pureWhite');
      map[key] = isValidHex(c.hex) ? normalizeHex(c.hex) : (c.defaultHex || '#FFFFFF');
    });
    return {
      warmCream: map.warmCream || '#FFF4E8',
      spartanOrange: map.spartanOrange || '#F4510B',
      navyBlue: map.navyBlue || '#172B50',
      pureWhite: map.pureWhite || '#FFFFFF',
    };
  }, [draftPalette]);

  // Check if any errors exist
  const hasErrors = useMemo(() => {
    return Object.values(hexErrors).some(err => Boolean(err)) ||
      draftPalette.some(c => !isValidHex(c.hex));
  }, [hexErrors, draftPalette]);

  // Find changed colors compared to current active palette
  const changedColors = useMemo(() => {
    const changes = [];
    draftPalette.forEach(draft => {
      const current = brandPalette.find(p => p.name === draft.name || p.key === draft.key);
      const curHex = normalizeHex(current?.hex || draft.defaultHex);
      const newHex = isValidHex(draft.hex) ? normalizeHex(draft.hex) : draft.hex;
      if (curHex !== newHex) {
        changes.push({
          name: draft.name,
          key: draft.key,
          oldHex: curHex,
          newHex: newHex
        });
      }
    });
    return changes;
  }, [draftPalette, brandPalette]);

  // Handle entering edit mode
  const handleStartEdit = () => {
    if (!isAdmin) {
      if (addToast) addToast('Only Administrators can edit the official brand palette.', 'error');
      return;
    }
    setDraftPalette(brandPalette.map(c => ({ ...c })));
    setHexErrors({});
    setIsEditing(true);
  };

  // Handle cancel
  const handleCancel = () => {
    setDraftPalette(brandPalette.map(c => ({ ...c })));
    setHexErrors({});
    setIsEditing(false);
  };

  // Handle color change from color picker or text
  const handleColorChange = (key, rawValue) => {
    let val = rawValue.trim();
    if (!val.startsWith('#') && val.length > 0) {
      val = '#' + val;
    }

    setDraftPalette(prev =>
      prev.map(c => {
        if (c.key === key || c.name === key) {
          return { ...c, hex: val.toUpperCase(), swatchBg: val };
        }
        return c;
      })
    );

    // Validate
    if (!isValidHex(val)) {
      setHexErrors(prev => ({
        ...prev,
        [key]: 'Invalid HEX code. Use format #RRGGBB (e.g. #F4510B)'
      }));
    } else {
      setHexErrors(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  // Reset a single color to default in draft
  const handleResetSingleColor = (key) => {
    const defaultItem = DEFAULT_BRAND_PALETTE.find(p => p.key === key || p.name === key);
    if (!defaultItem) return;
    handleColorChange(key, defaultItem.defaultHex);
  };

  // Reset all 4 colors to default in draft
  const handleResetAllDefaults = () => {
    setDraftPalette(DEFAULT_BRAND_PALETTE.map(c => ({ ...c })));
    setHexErrors({});
    if (addToast) addToast('Draft colors reset to initial Little Spartans defaults.', 'info');
  };

  // Trigger save validation and open confirmation dialog
  const handleOpenConfirm = () => {
    if (hasErrors) {
      if (addToast) addToast('Please correct the invalid HEX color values before saving.', 'error');
      return;
    }
    setIsConfirmModalOpen(true);
  };

  // Final confirmation to apply globally
  const handleConfirmSave = () => {
    if (hasErrors) return;
    setIsSaving(true);
    try {
      const result = updateBrandPalette(draftPalette, auditNote.trim());
      if (result && result.success) {
        setIsEditing(false);
        setIsConfirmModalOpen(false);
        setAuditNote('');
      }
    } catch (e) {
      console.error('Error saving brand palette', e);
      if (addToast) addToast('Failed to save brand palette: ' + e.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={`space-y-5 ${compact ? '' : 'w-full'}`}>
      {/* ---------------------------------------------------- */}
      {/* HEADER BAR: Title, Subtitle, & Edit/Action Controls */}
      {/* ---------------------------------------------------- */}
      <div className="bg-white rounded-2xl p-5 border border-[#172B5014] shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFF4E8] border border-[#F4510B25] flex items-center justify-center shrink-0 text-[#F4510B] shadow-2xs">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-[#172B50] tracking-tight">
                  {title}
                </h3>
                {isEditing ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#F4510B]/10 text-[#F4510B] border border-[#F4510B]/20">
                    <Sliders className="w-3 h-3" />
                    Editing Palette
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#172B50]/5 text-[#172B50]/80">
                    <ShieldCheck className="w-3 h-3 text-[#172B50]" />
                    4 Verified Tokens
                  </span>
                )}
              </div>
              <p className="text-xs text-[#172B50]/65 font-medium mt-0.5">
                {subtitle}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
            {!isEditing ? (
              <>
                {isAdmin ? (
                  <button
                    type="button"
                    onClick={handleStartEdit}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F4510B] text-white text-xs font-black hover:brightness-110 active:scale-95 transition-all shadow-md shadow-[#F4510B]/25 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Palette</span>
                  </button>
                ) : (
                  <span className="text-[11px] text-[#172B50]/60 font-medium px-3 py-1.5 rounded-lg bg-gray-100">
                    Read-Only (Admin Restricted)
                  </span>
                )}
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleResetAllDefaults}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 text-[#172B50] text-xs font-bold hover:bg-gray-200 active:scale-95 transition-all cursor-pointer"
                  title="Reset all 4 colors to initial defaults"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#172B50]/70" />
                  <span className="hidden sm:inline">Reset Defaults</span>
                </button>

                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#172B5020] text-[#172B50] text-xs font-bold hover:bg-gray-50 active:scale-95 transition-all cursor-pointer"
                >
                  <X className="w-3.5 h-3.5 text-red-500" />
                  <span>Cancel</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenConfirm}
                  disabled={hasErrors}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-black transition-all shadow-md cursor-pointer active:scale-95 ${
                    hasErrors
                      ? 'bg-gray-400 cursor-not-allowed shadow-none'
                      : 'bg-[#F4510B] hover:brightness-110 shadow-[#F4510B]/25'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Status notice when editing */}
        {isEditing && (
          <div className="mt-4 pt-3.5 border-t border-[#172B5010] flex items-center justify-between text-xs text-[#172B50]/75">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-[#F4510B] shrink-0" />
              <span>
                Pick or type HEX codes below. Swatches and the Live UI Preview update in real-time. Changes are only applied globally after clicking <strong>Save Changes</strong>.
              </span>
            </div>
            {changedColors.length > 0 && (
              <span className="font-bold text-[#F4510B] shrink-0 ml-2">
                {changedColors.length} color{changedColors.length > 1 ? 's' : ''} modified
              </span>
            )}
          </div>
        )}
      </div>

      {/* ---------------------------------------------------- */}
      {/* FOUR BRAND COLOR CARDS (View & Edit Modes)           */}
      {/* ---------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {draftPalette.map((color) => {
          const key = color.key || color.name;
          const currentHex = color.hex || color.defaultHex;
          const isInvalid = !isValidHex(currentHex);
          const isModified = normalizeHex(currentHex) !== normalizeHex(color.defaultHex);

          return (
            <div
              key={color.name}
              className={`p-4.5 rounded-2xl transition-all duration-200 border flex flex-col justify-between space-y-3.5 shadow-2xs ${
                isEditing
                  ? isInvalid
                    ? 'bg-red-50/70 border-red-300 ring-2 ring-red-400/20'
                    : 'bg-white border-[#F4510B30] hover:border-[#F4510B60]'
                  : 'bg-[#FFF4E8] border-[#172B5015]'
              }`}
            >
              {/* Header inside card: Name and Modified Badge */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-black text-[#172B50] tracking-tight">
                  {color.name}
                </span>
                {isModified && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#F4510B]/10 text-[#F4510B]">
                    Customized
                  </span>
                )}
              </div>

              {/* Swatch & Color Selection */}
              <div className="flex items-center gap-3">
                {/* Visual Swatch with Native Color Picker Trigger */}
                <div className="relative group shrink-0">
                  <div
                    style={{ backgroundColor: isInvalid ? '#E2E8F0' : currentHex }}
                    className={`w-14 h-14 rounded-xl shadow-xs transition-transform flex items-center justify-center relative overflow-hidden ${
                      color.borderStyle || 'border border-[#172B5020]'
                    } ${isEditing ? 'cursor-pointer hover:scale-105 ring-2 ring-transparent group-hover:ring-[#F4510B]/40' : ''}`}
                    title={isEditing ? `Click to pick color for ${color.name}` : color.name}
                  >
                    {isEditing && (
                      <div className="absolute inset-0 bg-black/15 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Palette className="w-4 h-4 text-white drop-shadow-md" />
                      </div>
                    )}
                  </div>

                  {/* Native HTML5 Color Picker input overlaid */}
                  {isEditing && (
                    <input
                      type="color"
                      aria-label={`Color picker for ${color.name}`}
                      value={isInvalid ? '#000000' : normalizeHex(currentHex)}
                      onChange={(e) => handleColorChange(key, e.target.value)}
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                    />
                  )}
                </div>

                {/* HEX Display or Editable Input */}
                <div className="min-w-0 flex-1">
                  {!isEditing ? (
                    <div>
                      <p className="text-sm font-mono font-black text-[#F4510B] tracking-wide">
                        {currentHex}
                      </p>
                      <p className="text-[11px] text-[#172B50]/65 font-medium mt-0.5">
                        Default: <span className="font-mono">{color.defaultHex}</span>
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="relative">
                        <input
                          type="text"
                          maxLength={7}
                          value={currentHex}
                          onChange={(e) => handleColorChange(key, e.target.value)}
                          placeholder="#RRGGBB"
                          className={`w-full font-mono text-xs font-bold px-2.5 py-1.5 rounded-lg border focus:outline-none transition-all uppercase ${
                            isInvalid
                              ? 'border-red-400 bg-red-50 text-red-700 focus:ring-2 focus:ring-red-400'
                              : 'border-[#172B5020] bg-white text-[#172B50] focus:border-[#F4510B] focus:ring-2 focus:ring-[#F4510B]/20'
                          }`}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px]">
                        {isInvalid ? (
                          <span className="text-red-500 font-bold truncate">Invalid HEX</span>
                        ) : (
                          <span className="text-gray-400 font-medium">Valid HEX</span>
                        )}
                        {isModified && (
                          <button
                            type="button"
                            onClick={() => handleResetSingleColor(key)}
                            className="text-[#F4510B] hover:underline font-bold"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Usage & Purpose description */}
              <div className="pt-2 border-t border-[#172B5010]">
                <p className="text-[11px] font-bold text-[#172B50]/85 leading-tight">
                  {color.usage}
                </p>
                {color.description && (
                  <p className="text-[10px] text-[#172B50]/60 font-medium mt-1 leading-snug line-clamp-2">
                    {color.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ---------------------------------------------------- */}
      {/* 3. LIVE UI PREVIEW BOX (Shown when editing)          */}
      {/* ---------------------------------------------------- */}
      {isEditing && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#F4510B30] shadow-sm space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#172B5010]">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#F4510B]" />
              <h4 className="text-sm font-black text-[#172B50] tracking-tight">
                Live UI Component Preview (Unsaved Changes)
              </h4>
            </div>
            <span className="text-[11px] text-[#172B50]/60 font-medium">
              Updates automatically as you type or pick colors
            </span>
          </div>

          {/* Interactive Preview Canvas */}
          <div
            style={{ backgroundColor: previewColors.warmCream }}
            className="p-5 sm:p-6 rounded-2xl border border-[#172B5015] space-y-5 transition-colors duration-200"
          >
            {/* Header / Brand bar in preview */}
            <div
              style={{ backgroundColor: previewColors.pureWhite }}
              className="p-4 rounded-xl border border-black/10 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div
                  style={{ backgroundColor: previewColors.spartanOrange }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-xs shadow-xs"
                >
                  LS
                </div>
                <div>
                  <h5
                    style={{ color: previewColors.navyBlue }}
                    className="text-sm font-black tracking-tight"
                  >
                    Little Spartans ZenConnect
                  </h5>
                  <p
                    style={{ color: previewColors.navyBlue, opacity: 0.7 }}
                    className="text-[11px] font-medium"
                  >
                    Interactive Multi-Portal SaaS Experience
                  </p>
                </div>
              </div>

              {/* Sample Badge & Status */}
              <div className="flex items-center gap-2">
                <span
                  style={{
                    backgroundColor: previewColors.spartanOrange,
                    color: previewColors.pureWhite
                  }}
                  className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-2xs"
                >
                  Active Center
                </span>
                <span
                  style={{
                    backgroundColor: previewColors.warmCream,
                    color: previewColors.navyBlue,
                    borderColor: previewColors.navyBlue + '20'
                  }}
                  className="px-2.5 py-1 rounded-full text-[10px] font-bold border"
                >
                  24 Athletes
                </span>
              </div>
            </div>

            {/* Content card in preview */}
            <div
              style={{ backgroundColor: previewColors.pureWhite }}
              className="p-5 rounded-xl border border-black/10 shadow-xs space-y-4"
            >
              <div>
                <h6
                  style={{ color: previewColors.navyBlue }}
                  className="text-base font-black tracking-tight"
                >
                  Summer Gymnastics &amp; Agility Program
                </h6>
                <p
                  style={{ color: previewColors.navyBlue, opacity: 0.75 }}
                  className="text-xs font-medium mt-1 leading-relaxed"
                >
                  Demonstrating live color tokens: Heading (Navy Blue), CTA Button (Spartan Orange), Ambient Background (Warm Cream), and Card Canvas (Pure White).
                </p>
              </div>

              {/* Action Buttons in preview */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  style={{
                    backgroundColor: previewColors.spartanOrange,
                    color: previewColors.pureWhite
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-black shadow-md transition-transform hover:scale-105 active:scale-95 cursor-default"
                >
                  Book Demo Class
                </button>

                <button
                  type="button"
                  style={{
                    backgroundColor: previewColors.warmCream,
                    color: previewColors.navyBlue,
                    borderColor: previewColors.navyBlue + '30'
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold border hover:brightness-95 active:scale-95 cursor-default"
                >
                  View Curriculum
                </button>

                <span
                  style={{ color: previewColors.spartanOrange }}
                  className="text-xs font-black ml-auto flex items-center gap-1 cursor-default"
                >
                  Explore Details
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#172B50]/70 pt-1">
            <Sparkles className="w-3.5 h-3.5 text-[#F4510B]" />
            <span>
              This live preview lets you verify contrast, legibility, and aesthetics before committing to global application.
            </span>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 4. PORTAL VISUAL UNIFORMITY COVENANT INFO NOTE       */}
      {/* ---------------------------------------------------- */}
      {showStandardsInfo && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#F8FAFC] border border-[#172B5014] space-y-2.5">
          <h4 className="text-xs sm:text-sm font-black text-[#172B50] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#F4510B]" />
            <span>Portal Visual Uniformity Covenant</span>
          </h4>
          <p className="text-xs text-[#172B50]/75 leading-relaxed">
            The Little Spartans brand experience strictly prohibits external or improvised color accents. Admin, Super Coach, Coach, and Parent portals uniformly share these four verified tokens ensuring seamless SaaS visual hierarchy across all viewports.
          </p>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 5. CONFIRMATION MODAL BEFORE APPLYING GLOBALLY       */}
      {/* ---------------------------------------------------- */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#172B5015] space-y-5 animate-scaleUp">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FFF4E8] text-[#F4510B] flex items-center justify-center shrink-0 border border-[#F4510B25]">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#172B50]">
                    Confirm Global Palette Update
                  </h3>
                  <p className="text-xs text-[#172B50]/65 font-medium">
                    This action will immediately update brand colors across all portals.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Changed Colors Summary */}
            <div className="space-y-3">
              <p className="text-xs font-black text-[#172B50] uppercase tracking-wider">
                Summary of Color Changes:
              </p>

              {changedColors.length === 0 ? (
                <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-600">
                  No color changes were detected compared to current palette.
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {changedColors.map(c => (
                    <div
                      key={c.name}
                      className="p-3 rounded-xl bg-[#FFF9F5] border border-[#F4510B15] flex items-center justify-between text-xs"
                    >
                      <span className="font-black text-[#172B50]">{c.name}</span>
                      <div className="flex items-center gap-2">
                        {/* Old */}
                        <div className="flex items-center gap-1.5 font-mono text-gray-500 line-through">
                          <span
                            style={{ backgroundColor: c.oldHex }}
                            className="w-3.5 h-3.5 rounded-full border border-black/15 inline-block"
                          />
                          <span>{c.oldHex}</span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-[#F4510B]" />
                        {/* New */}
                        <div className="flex items-center gap-1.5 font-mono font-black text-[#172B50]">
                          <span
                            style={{ backgroundColor: c.newHex }}
                            className="w-3.5 h-3.5 rounded-full border border-black/15 inline-block shadow-2xs"
                          />
                          <span>{c.newHex}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Audit Reason Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-[#172B50] flex items-center justify-between">
                <span>Audit Note / Change Reason (Optional)</span>
                <span className="text-[10px] text-gray-400">Logged to Settings Audit</span>
              </label>
              <input
                type="text"
                value={auditNote}
                onChange={(e) => setAuditNote(e.target.value)}
                placeholder="e.g. Approved official brand refresh for Q4"
                className="w-full text-xs px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-[#F4510B] focus:ring-2 focus:ring-[#F4510B]/20"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all cursor-pointer"
              >
                Keep Editing
              </button>
              <button
                type="button"
                onClick={handleConfirmSave}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-black text-white bg-[#F4510B] hover:brightness-110 active:scale-95 transition-all shadow-md shadow-[#F4510B]/30 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSaving ? 'Applying Globally...' : 'Confirm & Apply Globally'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
