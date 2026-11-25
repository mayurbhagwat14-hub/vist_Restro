import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Upload, X, Check, Camera, Image as ImageIcon } from "lucide-react"
import VistAuthHero from "@delivery/components/VistAuthHero"
import { deliveryAPI } from "@food/api"
import { toast } from "sonner"
import {
  getUserFacingApiError,
  isAlreadyExistsError,
  showUserFacingApiError,
} from "@/shared/utils/apiError"
import { openCamera, openGallery } from "@food/utils/imageUploadUtils"
import { prepareUploadFile } from "@/shared/utils/imageCompressor"
import useDeliveryOnboardingExitGuard from "../../hooks/useDeliveryOnboardingExitGuard"
import {
  DELIVERY_SIGNUP_DOC_TYPES,
  clearSignupDocumentsFromDB,
  deleteSignupDocumentFromDB,
  getAllSignupDocumentsFromDB,
  loadSignupDocumentPreviews,
  prepareSignupDocumentFile,
  saveSignupDocumentToDB,
} from "../../utils/deliveryOnboardingStorage"
import {
  collectFcmTokenForSignup,
  finalizeDeliveryPendingSubmission,
  prefetchModuleFcmToken,
} from "@delivery/utils/deliveryPush"

const debugError = (...args) => { }

const createEmptyPreviewState = () =>
  DELIVERY_SIGNUP_DOC_TYPES.reduce((acc, docType) => {
    acc[docType] = null
    return acc
  }, {})

export default function SignupStep2() {
  const navigate = useNavigate()
  const { handleBack } = useDeliveryOnboardingExitGuard("documents")
  const fileInputRefs = useRef({
    profilePhoto: null,
    aadharPhoto: null,
    panPhoto: null,
    drivingLicensePhoto: null,
  })
  const previewUrlsRef = useRef(createEmptyPreviewState())
  const [previewUrls, setPreviewUrls] = useState(createEmptyPreviewState)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploading, setUploading] = useState({})

  useEffect(() => {
    prefetchModuleFcmToken("delivery")
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" })
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [])

  useEffect(() => {
    let cancelled = false

    const hydrateDocuments = async () => {
      try {
        const previews = await loadSignupDocumentPreviews()
        if (cancelled) {
          Object.values(previews).forEach((url) => {
            if (url) URL.revokeObjectURL(url)
          })
          return
        }

        previewUrlsRef.current = previews
        setPreviewUrls(previews)
      } catch (error) {
        debugError("Failed to hydrate signup documents:", error)
      }
    }

    void hydrateDocuments()

    return () => {
      cancelled = true
      Object.values(previewUrlsRef.current).forEach((url) => {
        if (url) {
          try {
            URL.revokeObjectURL(url)
          } catch {
            // Ignore revoke errors.
          }
        }
      })
      previewUrlsRef.current = createEmptyPreviewState()
    }
  }, [])

  const getPreviewSrc = (docType) => previewUrls[docType] || null

  const hasUploadedDoc = (docType) => Boolean(getPreviewSrc(docType))

  const handleFileSelect = async (docType, file) => {
    if (!file) return

    if (!String(file.type || "").startsWith("image/")) {
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      return
    }

    setUploading((prev) => ({ ...prev, [docType]: true }))

    // Failsafe: never leave the UI stuck on "Uploading..." if compression/IDB hangs.
    let finished = false
    const failSafeId = setTimeout(() => {
      if (!finished) {
        setUploading((prev) => ({ ...prev, [docType]: false }))
      }
    }, 12000)

    try {
      const preparedFile = await prepareSignupDocumentFile(file)
      await saveSignupDocumentToDB(docType, preparedFile)

      const nextPreviewUrl = URL.createObjectURL(preparedFile)
      const previousPreviewUrl = previewUrlsRef.current[docType]
      if (previousPreviewUrl) {
        URL.revokeObjectURL(previousPreviewUrl)
      }

      previewUrlsRef.current = {
        ...previewUrlsRef.current,
        [docType]: nextPreviewUrl,
      }
      setPreviewUrls((prev) => ({
        ...prev,
        [docType]: nextPreviewUrl,
      }))
    } catch (error) {
      debugError("Failed to store document preview:", error)
      toast.error("Could not process image. Please try another photo.")
    } finally {
      finished = true
      clearTimeout(failSafeId)
      setUploading((prev) => ({ ...prev, [docType]: false }))
    }
  }

  const handleTakeCameraPhoto = (docType) => {
    openCamera({
      onSelectFile: (file) => handleFileSelect(docType, file),
      fileNamePrefix: `signup-${docType}`,
    })
  }

  const handlePickFromGallery = (docType) => {
    openGallery({
      onSelectFile: (file) => handleFileSelect(docType, file),
      fileNamePrefix: `signup-${docType}`,
      fallbackInputRef: { current: fileInputRefs.current[docType] },
    })
  }

  const handleRemove = async (docType) => {
    await deleteSignupDocumentFromDB(docType)

    const previousPreviewUrl = previewUrlsRef.current[docType]
    if (previousPreviewUrl) {
      URL.revokeObjectURL(previousPreviewUrl)
    }

    previewUrlsRef.current = {
      ...previewUrlsRef.current,
      [docType]: null,
    }
    setPreviewUrls((prev) => ({
      ...prev,
      [docType]: null,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const resolvedDocuments = await getAllSignupDocumentsFromDB()

    const missingDocument = DELIVERY_SIGNUP_DOC_TYPES.find((docType) => !resolvedDocuments[docType])
    if (missingDocument) {
      return
    }

    const raw = sessionStorage.getItem("deliverySignupDetails")
    if (!raw) {
      navigate("/food/delivery/signup", { replace: true })
      return
    }

    let details
    try {
      details = JSON.parse(raw)
    } catch {
      navigate("/food/delivery/signup", { replace: true })
      return
    }

    const { fcmToken, platform } = await collectFcmTokenForSignup("delivery")

    const [profilePhoto, aadharPhoto, panPhoto, drivingLicensePhoto] = await Promise.all([
      prepareUploadFile(resolvedDocuments.profilePhoto, { preset: "profile" }),
      prepareUploadFile(resolvedDocuments.aadharPhoto),
      prepareUploadFile(resolvedDocuments.panPhoto),
      prepareUploadFile(resolvedDocuments.drivingLicensePhoto),
    ])

    const formData = new FormData()
    formData.append("name", details.name || "")
    formData.append("phone", String(details.phone || "").replace(/\D/g, "").slice(0, 15))
    formData.append("email", String(details.email || "").trim().toLowerCase())
    if (details.ref) formData.append("ref", String(details.ref).trim())
    if (details.countryCode) formData.append("countryCode", details.countryCode)
    if (details.address) formData.append("address", details.address)
    if (details.city) formData.append("city", details.city)
    if (details.state) formData.append("state", details.state)
    if (details.vehicleType) formData.append("vehicleType", details.vehicleType)
    if (details.vehicleName) formData.append("vehicleName", details.vehicleName)
    if (details.vehicleNumber) formData.append("vehicleNumber", details.vehicleNumber)
    if (details.drivingLicenseNumber) {
      formData.append("drivingLicenseNumber", details.drivingLicenseNumber)
      formData.append("documents[drivingLicense][number]", details.drivingLicenseNumber)
    }
    if (details.panNumber) formData.append("panNumber", details.panNumber)
    if (details.aadharNumber) formData.append("aadharNumber", details.aadharNumber)
    formData.append("profilePhoto", profilePhoto)
    formData.append("aadharPhoto", aadharPhoto)
    formData.append("panPhoto", panPhoto)
    formData.append("drivingLicensePhoto", drivingLicensePhoto)

    if (fcmToken) {
      formData.append("fcmToken", fcmToken)
      formData.append("platform", platform)
    }

    const hasDeliveryAuth =
      typeof localStorage !== "undefined" &&
      localStorage.getItem("delivery_authenticated") === "true" &&
      Boolean(localStorage.getItem("delivery_accessToken"))

    const shouldRegister =
      sessionStorage.getItem("deliveryNeedsRegistration") === "true" ||
      !hasDeliveryAuth

    setIsSubmitting(true)

    try {
      const response = shouldRegister
        ? await deliveryAPI.register(formData)
        : await deliveryAPI.completeProfile(formData)

      if (response?.data?.success) {
        sessionStorage.removeItem("deliverySignupDetails")
        sessionStorage.removeItem("deliverySignupDocs")
        await clearSignupDocumentsFromDB()
        if (shouldRegister) {
          sessionStorage.removeItem("deliveryNeedsRegistration")
          const phone = String(details.phone || "").replace(/\D/g, "").slice(-10)
          finalizeDeliveryPendingSubmission(navigate, phone, { fcmToken, platform })
        } else {
          toast.success("Profile submitted. Waiting for admin approval.")
          setTimeout(() => navigate("/food/delivery", { replace: true }), 1500)
        }
      }
    } catch (error) {
      debugError("Error submitting registration:", error)
      const errorMsg = getUserFacingApiError(
        error,
        "Registration failed. Please try again.",
      )
      // Already registered / pending — send user to verification screen instead of raw API error.
      if (isAlreadyExistsError(errorMsg) || isAlreadyExistsError(error)) {
        const phone = String(details.phone || "").replace(/\D/g, "").slice(-10)
        sessionStorage.removeItem("deliveryNeedsRegistration")
        finalizeDeliveryPendingSubmission(navigate, phone, { fcmToken, platform })
        return
      }
      showUserFacingApiError(error, "Registration failed. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const DocumentUpload = ({ docType, label, required = true }) => {
    const isUploading = uploading[docType]
    const uploaded = hasUploadedDoc(docType)

    return (
      <div className="bg-white rounded-2xl p-4 border border-[#E8DEC8] shadow-[0_2px_8px_rgba(74,44,17,0.04)]">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>

        {uploaded ? (
          <div className="relative">
            <img
              src={getPreviewSrc(docType)}
              alt={label}
              className="w-full h-48 object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={() => handleRemove(docType)}
              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div
              className="absolute bottom-2 left-2 text-white px-2.5 py-1 rounded-full flex items-center gap-1 text-xs font-semibold shadow-md"
              style={{ backgroundColor: "#00B761" }}
            >
              <Check className="w-3.5 h-3.5" />
              <span>Uploaded</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-[#E5DDD0] rounded-2xl bg-[#FBF5EA] hover:border-[#6E3B13] transition-colors px-4">
            <div className="flex flex-col items-center justify-center pt-5 pb-3">
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-transparent mb-2" style={{ borderBottomColor: "#00B761" }}></div>
                  <p className="text-sm text-[#8E7B6B]">Uploading...</p>
                </>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm text-[#8E7B6B] mb-1">Upload document</p>
                  <p className="text-xs text-gray-400">PNG, JPG up to 5MB</p>
                </>
              )}
            </div>

            {!isUploading && (
              <div className="w-full grid grid-cols-2 gap-2 pb-4">
                <button
                  type="button"
                  onClick={() => handleTakeCameraPhoto(docType)}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-gray-900 text-white text-xs font-bold cursor-pointer hover:bg-black transition-all active:scale-95"
                >
                  <Camera className="w-4 h-4" />
                  <span>Take Photo</span>
                </button>
                <button
                  type="button"
                  onClick={() => handlePickFromGallery(docType)}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-[#00B761] text-white text-xs font-bold cursor-pointer hover:bg-[#00A055] transition-all active:scale-95"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>Gallery</span>
                </button>
              </div>
            )}

            <input
              ref={(node) => {
                fileInputRefs.current[docType] = node
              }}
              type="file"
              className="hidden"
              accept=".jpg,.jpeg,.png,.webp,.heic,.heif,image/jpeg,image/png,image/webp,image/heic,image/heif"
              onClick={(e) => {
                e.target.value = ""
              }}
              onChange={(e) => {
                const selectedFile = e.target.files[0]
                if (selectedFile) {
                  handleFileSelect(docType, selectedFile)
                }
                e.target.value = ""
              }}
              disabled={isUploading}
            />
          </div>
        )}
      </div>
    )
  }

  const allDocumentsUploaded = DELIVERY_SIGNUP_DOC_TYPES.every((docType) => hasUploadedDoc(docType))

  return (
    <div className="min-h-screen w-full bg-[#F6EBD7] flex justify-center vist-onboarding" style={{ fontFamily: "'Outfit', sans-serif" }}>
      <div className="w-full max-w-[460px] min-h-screen bg-[#F6EBD7] relative overflow-hidden pb-8">
      <VistAuthHero
        compact
        onBack={handleBack}
        title="Upload Documents"
        subtitle="Step 2 of 2 · Upload clear photos of your documents for verification."
      />

      <div className="relative z-10 px-6 pt-5">

        <form onSubmit={handleSubmit} className="space-y-4">
          <DocumentUpload docType="profilePhoto" label="Profile Photo" required={true} />
          <DocumentUpload docType="aadharPhoto" label="Aadhar Card Photo" required={true} />
          <DocumentUpload docType="panPhoto" label="PAN Card Photo" required={true} />
          <DocumentUpload docType="drivingLicensePhoto" label="Driving License Photo" required={true} />

          <button
            type="submit"
            disabled={isSubmitting || !allDocumentsUploaded}
            className={`w-full py-4 rounded-full font-semibold text-white text-base transition-all mt-6 active:scale-[0.98] ${isSubmitting || !allDocumentsUploaded
              ? "bg-gray-400 cursor-not-allowed shadow-none"
              : "bg-gradient-to-r from-[#6E3B13] to-[#522807] hover:from-[#6E3B13] hover:to-[#3D210F] shadow-[0_8px_20px_rgba(110,59,19,0.3)]"
              }`}
          >
            {isSubmitting ? "Submitting..." : "Complete Signup"}
          </button>
        </form>
      </div>
      </div>
    </div>
  )
}
