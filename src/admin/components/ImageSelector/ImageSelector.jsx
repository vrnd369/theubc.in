import React, { useState, useEffect, useRef } from "react";
import {
  getAllImages,
  uploadImage,
  getImageById,
  deleteImage,
} from "../../services/imageService";
import { collection, getDocs, getDoc, doc } from "firebase/firestore";
import { db } from "../../../firebase/config";
import "./ImageSelector.css";

/**
 * Resize and compress an image file to under 500KB
 * Preserves PNG transparency - only converts to JPEG for non-transparent images or very large files
 * @param {File} file - Original image file
 * @param {number} maxWidth - Maximum width in pixels (default: 1200)
 * @param {number} maxHeight - Maximum height in pixels (default: 1200)
 * @param {number} initialQuality - Initial JPEG quality 0-1 (default: 0.85)
 * @returns {Promise<File>} Resized and compressed image file under 500KB
 */
const resizeAndCompressImage = (
  file,
  maxWidth = 1200,
  maxHeight = 1200,
  initialQuality = 0.85
) => {
  const MAX_SIZE = 500 * 1024; // 500KB in bytes (leaves room for other document fields)

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Calculate new dimensions
        let width = img.width;
        let height = img.height;

        // Resize if image is larger than max dimensions
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }

        // Create canvas and resize
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d", { alpha: true }); // Enable alpha channel for transparency

        // Check if image has transparency (PNG, GIF, WebP support transparency)
        const hasTransparency =
          file.type === "image/png" ||
          file.type === "image/gif" ||
          file.type === "image/webp";

        // Only convert to JPEG if:
        // 1. Image is very large (>300KB) AND not a transparent format, OR
        // 2. It's already a non-transparent format (JPEG, etc.) and large
        // Preserve PNG/GIF/WebP format to maintain transparency
        const shouldConvertToJpeg = !hasTransparency && file.size > 300 * 1024;

        // Preserve PNG format for transparent images, otherwise use original or JPEG
        const outputType = hasTransparency
          ? file.type || "image/png"
          : shouldConvertToJpeg
          ? "image/jpeg"
          : file.type || "image/jpeg";

        // Clear canvas to ensure transparency (important for PNG)
        ctx.clearRect(0, 0, width, height);

        // Only add white background when converting to JPEG (not for PNG with transparency)
        if (shouldConvertToJpeg && outputType === "image/jpeg") {
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, width, height);
        }
        // For PNG with transparency, don't fill - let it stay transparent

        ctx.drawImage(img, 0, 0, width, height);

        // Iterative compression to ensure under 500KB
        const compress = (quality) => {
          // For PNG, don't use quality parameter (preserves transparency)
          // For JPEG, use quality parameter
          const qualityParam =
            outputType === "image/png" ||
            outputType === "image/gif" ||
            outputType === "image/webp"
              ? undefined
              : quality;

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("Failed to compress image"));
                return;
              }

              // For PNG/GIF/WebP, only reduce dimensions (no quality setting)
              // For JPEG, try reducing quality first, then dimensions
              if (blob.size > MAX_SIZE) {
                if (
                  outputType === "image/png" ||
                  outputType === "image/gif" ||
                  outputType === "image/webp"
                ) {
                  // For transparent formats, only reduce dimensions
                  console.log(
                    `PNG/GIF/WebP still too large (${(blob.size / 1024).toFixed(
                      2
                    )}KB), reducing dimensions...`
                  );
                  const newWidth = Math.floor(width * 0.9);
                  const newHeight = Math.floor(height * 0.9);
                  canvas.width = newWidth;
                  canvas.height = newHeight;

                  // Clear canvas to ensure transparency (important for PNG)
                  ctx.clearRect(0, 0, newWidth, newHeight);

                  // Don't fill background for transparent formats
                  ctx.drawImage(img, 0, 0, newWidth, newHeight);
                  width = newWidth;
                  height = newHeight;
                  compress(undefined); // No quality for PNG
                } else if (quality > 0.1) {
                  // For JPEG, reduce quality first
                  const newQuality = Math.max(0.1, quality - 0.1);
                  console.log(
                    `Image still too large (${(blob.size / 1024).toFixed(
                      2
                    )}KB), reducing quality to ${newQuality.toFixed(2)}...`
                  );
                  compress(newQuality);
                } else {
                  // If still too large after quality reduction, reduce dimensions
                  console.log(
                    `Image still too large after quality reduction, reducing dimensions...`
                  );
                  const newWidth = Math.floor(width * 0.9);
                  const newHeight = Math.floor(height * 0.9);
                  canvas.width = newWidth;
                  canvas.height = newHeight;

                  // Clear and fill with white background for JPEG
                  ctx.clearRect(0, 0, newWidth, newHeight);
                  ctx.fillStyle = "#FFFFFF";
                  ctx.fillRect(0, 0, newWidth, newHeight);
                  ctx.drawImage(img, 0, 0, newWidth, newHeight);
                  width = newWidth;
                  height = newHeight;
                  compress(0.7); // Try with medium quality after resize
                }
              } else {
                // Successfully compressed under 500KB
                // Only change filename extension if actually converting to JPEG
                const fileName =
                  shouldConvertToJpeg && outputType === "image/jpeg"
                    ? file.name.replace(/\.(png|gif|webp)$/i, ".jpg")
                    : file.name;
                const compressedFile = new File([blob], fileName, {
                  type: outputType,
                  lastModified: Date.now(),
                });
                const qualityInfo =
                  outputType === "image/png" ||
                  outputType === "image/gif" ||
                  outputType === "image/webp"
                    ? "PNG/GIF/WebP (no quality setting)"
                    : `Quality: ${quality.toFixed(2)}`;
                console.log(
                  `✓ Image compressed: ${img.width}x${
                    img.height
                  } -> ${width}x${height}, Size: ${(file.size / 1024).toFixed(
                    2
                  )}KB -> ${(blob.size / 1024).toFixed(2)}KB, Format: ${
                    file.type
                  } -> ${outputType}, ${qualityInfo}`
                );
                resolve(compressedFile);
              }
            },
            outputType,
            qualityParam
          );
        };

        // Start compression - use undefined quality for PNG/GIF/WebP, initialQuality for JPEG
        const startQuality =
          outputType === "image/png" ||
          outputType === "image/gif" ||
          outputType === "image/webp"
            ? undefined
            : initialQuality;
        compress(startQuality);
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
  });
};

export default function ImageSelector({
  value,
  onChange,
  label = "Icon URL",
  isIcon = false,
}) {
  const [showModal, setShowModal] = useState(false);

  // Lock body scroll when modal is open and hide Live Preview
  useEffect(() => {
    if (showModal) {
      // Add class to body to hide Live Preview
      document.body.classList.add('image-selector-modal-open');
      
      // Save current scroll position
      const scrollY = window.scrollY;
      // Lock body scroll
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      
      return () => {
        // Remove class when modal closes
        document.body.classList.remove('image-selector-modal-open');
        
        // Restore scroll position when modal closes
        const scrollY = document.body.style.top;
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        if (scrollY) {
          window.scrollTo(0, parseInt(scrollY || '0') * -1);
        }
      };
    }
  }, [showModal]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [deletingAll, setDeletingAll] = useState(false);
  const [selectedImages, setSelectedImages] = useState(new Set());
  const fileInputRef = useRef(null);

  // Resolve image ID to URL for preview
  useEffect(() => {
    const resolveImageUrl = async () => {
      if (!value) {
        setPreviewUrl(null);
        return;
      }

      // If it's already a URL (base64 or http), use it directly
      if (
        value.startsWith("data:") ||
        value.startsWith("http://") ||
        value.startsWith("https://")
      ) {
        setPreviewUrl(value);
        return;
      }

      // Otherwise, it's an image ID - fetch from Firestore
      try {
        const imageUrl = await getImageById(value);
        setPreviewUrl(imageUrl);
      } catch (error) {
        console.error("Error resolving image:", error);
        setPreviewUrl(null);
      }
    };

    resolveImageUrl();
  }, [value]);

  useEffect(() => {
    if (showModal) {
      loadImages();
      // Clear selection when modal opens
      setSelectedImages(new Set());
    }
  }, [showModal]);

  const loadImages = async () => {
    try {
      setLoading(true);
      // Load uploaded images with timeout
      const uploaded = await Promise.race([
        getAllImages(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Timeout")), 10000)
        ),
      ]);
      setUploadedImages(uploaded);
    } catch (error) {
      console.error("Error loading images:", error);
      setUploadedImages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.target.files[0];

    if (!file) {
      console.log("No file selected - user canceled");
      return;
    }

    console.log("File selected:", file.name, file.type, file.size);

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      e.target.value = ""; // Reset input
      return;
    }

    // Check file size (max 20MB before compression - will be compressed to under 1MB)
    if (file.size > 20 * 1024 * 1024) {
      alert(
        "Image file is too large. Please select an image smaller than 20MB. The image will be automatically compressed to under 1MB."
      );
      e.target.value = ""; // Reset input
      return;
    }

    try {
      setUploading(true);
      setCompressing(true);
      setCompressionProgress("Compressing image...");

      console.log("Starting image processing...");

      // Resize and compress image before upload
      // For icons: smaller dimensions (400x400), for product images: larger (1200x1200)
      const maxWidth = isIcon ? 400 : 1200;
      const maxHeight = isIcon ? 400 : 1200;
      const quality = isIcon ? 0.9 : 0.85; // Higher quality for icons

      console.log(`Resizing image to max ${maxWidth}x${maxHeight}px...`);
      const processedFile = await resizeAndCompressImage(
        file,
        maxWidth,
        maxHeight,
        quality
      );

      setCompressing(false);
      setCompressionProgress("Uploading compressed image...");
      console.log("Uploading processed image to Firestore...");

      const imageId = await uploadImage(processedFile, file.name);
      console.log("Upload successful, Image ID:", imageId);

      await loadImages(); // Reload images
      onChange(imageId); // Set the image document ID as selected

      setCompressionProgress("");
      alert(
        `Image uploaded and optimized successfully!\n\nOriginal: ${(
          file.size / 1024
        ).toFixed(2)}KB\nCompressed: ${(processedFile.size / 1024).toFixed(
          2
        )}KB`
      );
    } catch (error) {
      console.error("Error uploading image:", error);
      setCompressing(false);
      setCompressionProgress("");

      const errorMessage =
        error.message ||
        "Error uploading image. Please check:\n1. Firestore rules allow writes\n2. Image is compressed to under 500KB\n3. You have internet connection";
      alert(errorMessage);
    } finally {
      setUploading(false);
      setCompressing(false);
      setCompressionProgress("");
      e.target.value = ""; // Reset file input
    }
  };

  const handleImageSelect = (imageId, e) => {
    // If clicking on checkbox, don't select the image
    if (e && (e.target.type === "checkbox" || e.target.closest(".image-checkbox"))) {
      return;
    }
    onChange(imageId);
    setShowModal(false);
  };

  const handleImageCheckboxChange = (imageId, checked) => {
    setSelectedImages((prev) => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(imageId);
      } else {
        newSet.delete(imageId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedImages.size === uploadedImages.length) {
      // Deselect all
      setSelectedImages(new Set());
    } else {
      // Select all
      setSelectedImages(new Set(uploadedImages.map((img) => img.id)));
    }
  };

  const handleImageDelete = async (e, imageId, imageName) => {
    e.stopPropagation(); // Prevent selecting the image when clicking delete

    const confirmed = window.confirm(
      `Are you sure you want to delete "${imageName}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      // Delete the image from Firestore
      await deleteImage(imageId);

      // If the deleted image was the currently selected one, clear the selection
      if (value === imageId) {
        onChange("");
        setPreviewUrl(null);
      }

      // Remove from selected images if it was selected
      setSelectedImages((prev) => {
        const newSet = new Set(prev);
        newSet.delete(imageId);
        return newSet;
      });

      // Reload the images list
      await loadImages();

      alert(`Image "${imageName}" has been deleted successfully.`);
    } catch (error) {
      console.error("Error deleting image:", error);
      alert(
        `Failed to delete image: ${error.message || "Unknown error occurred"}`
      );
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedImages.size === 0) {
      alert("No images selected for deletion.");
      return;
    }

    const selectedArray = Array.from(selectedImages);
    const selectedCount = selectedImages.size;
    const selectedImageNames = uploadedImages
      .filter((img) => selectedImages.has(img.id))
      .map((img) => img.name);

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedCount} image(s)?\n\n` +
        `Images to delete:\n${selectedImageNames.join("\n")}\n\n` +
        `This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingAll(true);

      // Delete all selected images
      const deletePromises = selectedArray.map((imageId) => deleteImage(imageId));
      await Promise.all(deletePromises);

      // If the currently selected image was deleted, clear the selection
      if (value && selectedImages.has(value)) {
        onChange("");
        setPreviewUrl(null);
      }

      // Clear selected images
      setSelectedImages(new Set());

      // Reload the images list
      await loadImages();

      alert(
        `Successfully deleted ${selectedCount} image(s).`
      );
    } catch (error) {
      console.error("Error deleting selected images:", error);
      alert(
        `Failed to delete images: ${error.message || "Unknown error occurred"}`
      );
    } finally {
      setDeletingAll(false);
    }
  };

  // Helper function to recursively search for image IDs in an object
  const findImageIdsInObject = (obj, foundIds) => {
    if (!obj || typeof obj !== "object") return;
    if (Array.isArray(obj)) {
      obj.forEach((item) => findImageIdsInObject(item, foundIds));
      return;
    }
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        if (
          typeof value === "string" &&
          value.length > 10 &&
          value.length < 50 &&
          !value.startsWith("http://") &&
          !value.startsWith("https://") &&
          !value.startsWith("data:") &&
          !value.includes("/") &&
          /^[a-zA-Z0-9_-]+$/.test(value)
        ) {
          foundIds.add(value);
        } else if (typeof value === "object" && value !== null) {
          findImageIdsInObject(value, foundIds);
        }
      }
    }
  };

  const handleDeleteUnusedOnly = async () => {
    if (uploadedImages.length === 0) {
      alert("No images to delete.");
      return;
    }

    try {
      setDeletingAll(true);
      const imageIds = uploadedImages.map((img) => img.id);
      const imageIdSet = new Set(imageIds);
      const usedImageIds = new Set();

      // Check collections that might use images
      const collectionsToCheck = [
        "aboutSections",
        "homeSections",
        "brands",
        "categories",
        "products",
        "brandPages",
      ];

      // Check each collection
      for (const collectionName of collectionsToCheck) {
        try {
          const snapshot = await getDocs(collection(db, collectionName));
          snapshot.docs.forEach((docSnap) => {
            const data = docSnap.data();
            const foundIds = new Set();
            findImageIdsInObject(data, foundIds);
            foundIds.forEach((foundId) => {
              if (imageIdSet.has(foundId)) {
                usedImageIds.add(foundId);
              }
            });
          });
        } catch (error) {
          console.warn(`Error checking ${collectionName}:`, error);
        }
      }

      // Check footer and navigation configs
      try {
        const footerDoc = doc(db, "footer", "config");
        const footerSnap = await getDoc(footerDoc);
        if (footerSnap.exists()) {
          const foundIds = new Set();
          findImageIdsInObject(footerSnap.data(), foundIds);
          foundIds.forEach((foundId) => {
            if (imageIdSet.has(foundId)) {
              usedImageIds.add(foundId);
            }
          });
        }
      } catch (error) {
        console.warn("Error checking footer:", error);
      }

      try {
        const navDoc = doc(db, "navigation", "config");
        const navSnap = await getDoc(navDoc);
        if (navSnap.exists()) {
          const foundIds = new Set();
          findImageIdsInObject(navSnap.data(), foundIds);
          foundIds.forEach((foundId) => {
            if (imageIdSet.has(foundId)) {
              usedImageIds.add(foundId);
            }
          });
        }
      } catch (error) {
        console.warn("Error checking navigation:", error);
      }

      // Find unused images
      const unusedImageIds = imageIds.filter((id) => !usedImageIds.has(id));
      const selectedImageId = value;

      if (unusedImageIds.length === 0) {
        alert(
          "All images are currently in use on other pages. No unused images to delete."
        );
        setDeletingAll(false);
        return;
      }

      const confirmed = window.confirm(
        `Found ${unusedImageIds.length} unused image(s) out of ${imageIds.length} total.\n\n` +
          `Used images (${usedImageIds.size}) will be kept safe.\n\n` +
          `Delete ${unusedImageIds.length} unused image(s)?`
      );

      if (!confirmed) {
        setDeletingAll(false);
        return;
      }

      // Delete only unused images
      const deletePromises = unusedImageIds.map((imageId) =>
        deleteImage(imageId)
      );
      await Promise.all(deletePromises);

      // Clear selection if the selected image was deleted
      if (selectedImageId && unusedImageIds.includes(selectedImageId)) {
        onChange("");
        setPreviewUrl(null);
      }

      // Reload the images list
      await loadImages();

      alert(
        `Successfully deleted ${unusedImageIds.length} unused image(s). ${usedImageIds.size} image(s) are still in use and were kept safe.`
      );
    } catch (error) {
      console.error("Error deleting unused images:", error);
      alert(
        `Failed to delete unused images: ${
          error.message || "Unknown error occurred"
        }`
      );
    } finally {
      setDeletingAll(false);
    }
  };

  return (
    <div className="image-selector">
      <label className="admin-label">{label}</label>
      <div className="image-selector-input-group">
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="admin-btn admin-btn-secondary"
          style={{ width: "100%" }}
        >
          {value ? "🖼️ Change Image" : "📷 Select Image"}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="admin-btn admin-btn-danger"
            style={{ marginLeft: "8px" }}
            title="Remove image"
          >
            ✕ Remove
          </button>
        )}
      </div>

      {previewUrl && (
        <div className={`image-preview ${isIcon ? "circular-preview" : ""}`}>
          <img
            src={previewUrl}
            alt="Preview"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        </div>
      )}

      {value && !previewUrl && (
        <div
          style={{
            padding: "8px",
            backgroundColor: "#fef3c7",
            borderRadius: "4px",
            marginTop: "8px",
            fontSize: "12px",
            color: "#92400e",
          }}
        >
          ⚠️ Image selected but preview unavailable. Click "Change Image" to
          verify.
        </div>
      )}

      {showModal && (
        <div
          className="image-selector-modal"
          onClick={() => {
            // Click on backdrop closes modal
            setShowModal(false);
          }}
        >
          <div
            className="image-selector-modal-content"
            onClick={(e) => {
              // Prevent clicks inside content from closing modal
              e.stopPropagation();
            }}
          >
            <div className="modal-header">
              <h3 className="admin-heading-3">Select Image</h3>
              <button
                onClick={() => setShowModal(false)}
                className="modal-close-btn"
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              {loading ? (
                <div className="admin-loading">
                  <div className="admin-spinner"></div>
                  <p className="admin-text-sm">Loading images...</p>
                </div>
              ) : (
                <>
                  <div className="upload-section">
                    <div className="upload-actions">
                      <input
                        ref={fileInputRef}
                        type="file"
                        id="image-upload-input"
                        accept="image/*"
                        onChange={handleFileUpload}
                        disabled={uploading || deletingAll}
                        style={{ display: "none" }}
                      />
                      <button
                        type="button"
                        className={`upload-btn ${uploading ? "uploading" : ""}`}
                        disabled={uploading || deletingAll}
                        onClick={(e) => {
                          e.preventDefault();
                          if (!uploading && fileInputRef.current) {
                            fileInputRef.current.click();
                          }
                        }}
                      >
                        {compressing
                          ? "⏳ Compressing..."
                          : uploading
                          ? "⏳ Uploading..."
                          : "+ Upload New Image"}
                      </button>
                      {uploadedImages.length > 0 && (
                        <>
                          <button
                            type="button"
                            className="select-all-btn"
                            disabled={uploading || deletingAll || loading}
                            onClick={handleSelectAll}
                            title={
                              selectedImages.size === uploadedImages.length
                                ? "Deselect all images"
                                : "Select all images"
                            }
                          >
                            {selectedImages.size === uploadedImages.length
                              ? "☐ Deselect All"
                              : "☑ Select All"}
                          </button>
                          {selectedImages.size > 0 && (
                            <button
                              type="button"
                              className="delete-selected-btn"
                              disabled={uploading || deletingAll || loading}
                              onClick={handleDeleteSelected}
                              title={`Delete ${selectedImages.size} selected image(s)`}
                            >
                              {deletingAll
                                ? "⏳ Deleting..."
                                : `🗑️ Delete Selected (${selectedImages.size})`}
                            </button>
                          )}
                          <button
                            type="button"
                            className="delete-all-btn"
                            disabled={uploading || deletingAll || loading}
                            onClick={handleDeleteUnusedOnly}
                            title="Delete only unused images (safe - won't affect other pages)"
                          >
                            {deletingAll
                              ? "⏳ Checking & Deleting..."
                              : "🗑️ Delete Unused Only"}
                          </button>
                        </>
                      )}
                    </div>
                    {compressing && (
                      <p
                        style={{
                          marginTop: "8px",
                          color: "#3b82f6",
                          fontSize: "12px",
                          textAlign: "center",
                        }}
                      >
                        {compressionProgress ||
                          "Compressing image... This may take a moment."}
                      </p>
                    )}
                    <p className="upload-hint admin-text-sm admin-mt-sm">
                      <strong>Automatic Compression:</strong> Images are
                      automatically compressed to under 500KB before uploading.
                      {isIcon
                        ? " Icons: max 400x400px"
                        : " Product images: max 1200x1200px"}
                      . Supported formats: JPG, PNG, GIF, WebP
                    </p>
                  </div>

                  {uploadedImages.length === 0 && !loading ? (
                    <div className="admin-empty-state">
                      <p className="admin-text-sm">No uploaded images yet.</p>
                      <p className="admin-text-sm admin-mt-sm">
                        Click &quot;Upload New Image&quot; above to upload your
                        first image.
                      </p>
                      <p
                        className="admin-text-sm admin-mt-sm"
                        style={{ color: "#f59e0b", fontWeight: 500 }}
                      >
                        ⚠️ If upload fails, make sure Firestore rules allow
                        writes to the &quot;images&quot; collection.
                      </p>
                    </div>
                  ) : (
                    <div className={`image-grid ${isIcon ? "icon-grid" : ""}`}>
                      {uploadedImages.map((image, index) => {
                        const isSelected = selectedImages.has(image.id);
                        return (
                          <div
                            key={image.id || index}
                            className={`image-item ${isIcon ? "icon-item" : ""} ${
                              isSelected ? "selected" : ""
                            }`}
                            onClick={(e) => handleImageSelect(image.id, e)}
                          >
                            <div className="image-item-wrapper">
                              <img src={image.url} alt={image.name} />
                              <div className="image-checkbox">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    handleImageCheckboxChange(
                                      image.id,
                                      e.target.checked
                                    );
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  title={
                                    isSelected
                                      ? "Deselect image"
                                      : "Select image for deletion"
                                  }
                                />
                              </div>
                              <button
                                className="image-delete-btn"
                                onClick={(e) =>
                                  handleImageDelete(e, image.id, image.name)
                                }
                                title={`Delete ${image.name}`}
                                aria-label={`Delete ${image.name}`}
                              >
                                🗑️
                              </button>
                            </div>
                            <p className="image-name">{image.name}</p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
