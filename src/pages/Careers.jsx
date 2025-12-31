import React, { useEffect, useMemo, useState } from "react";
import "./Careers.css";
import heroImage from "../assets/career.png";
import starImage from "../assets/star.png";
import { subscribeCareersConfig } from "../admin/services/careersService";
import { parseInlineFormatting } from "../admin/components/BrandPageEditor/InlineFontEditor";
import { submitForm } from "../admin/services/formSubmissionService";
import { resolveImageUrl } from "../utils/imageUtils";

export default function Careers() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    requirement: "",
    message: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  // Try to load from cache immediately
  const getCachedConfig = () => {
    try {
      const cached = localStorage.getItem('ubc_careers_config');
      if (cached) {
        const parsed = JSON.parse(cached);
        // Check if cache is less than 5 minutes old
        if (parsed.timestamp && Date.now() - parsed.timestamp < 300000) {
          return parsed.data || null;
        }
      }
    } catch (e) {
      // Ignore cache errors
    }
    return null;
  };
  
  const [config, setConfig] = useState(getCachedConfig());

  // Resolve hero background image - initialize as null to prevent default flash
  const [heroBgImage, setHeroBgImage] = useState(null);
  const [previousImageRef, setPreviousImageRef] = useState(null);

  useEffect(() => {
    // Subscribe to real-time updates for fast rendering
    const unsubscribe = subscribeCareersConfig(
      async (data) => {
        if (data?.pageTitle) {
          document.title = data.pageTitle;
        } else {
          document.title = "Careers - UBC | United Brothers Company";
        }

        const currentImageRef = data?.hero?.backgroundImage;

        // If image reference changed, clear old image immediately to prevent showing stale data
        if (currentImageRef !== previousImageRef) {
          // Clear old image immediately when config changes
          setHeroBgImage(null);
        }

        setConfig(data);
        
        // Cache the config
        try {
          localStorage.setItem('ubc_careers_config', JSON.stringify({
            data: data,
            timestamp: Date.now()
          }));
        } catch (e) {
          // Ignore cache errors
        }

        // Load hero image immediately when config loads/updates
        if (currentImageRef) {
          try {
            // Always fetch fresh image from server (no cache)
            const resolved = await resolveImageUrl(currentImageRef);
            if (resolved) {
              // Only set image once it's fully loaded
              setHeroBgImage(resolved);
              setPreviousImageRef(currentImageRef);
            } else {
              // If no resolved image, use default
              setHeroBgImage(heroImage);
              setPreviousImageRef(null);
            }
          } catch (error) {
            console.error("Error resolving hero image:", error);
            setHeroBgImage(heroImage);
            setPreviousImageRef(null);
          }
        } else {
          // No custom image, use default
          setHeroBgImage(heroImage);
          setPreviousImageRef(null);
        }
      },
      (error) => {
        console.error("Error loading careers config:", error);
        document.title = "Careers - UBC | United Brothers Company";
        setHeroBgImage(heroImage);
      }
    );

    return () => unsubscribe();
  }, [previousImageRef]); // Include previousImageRef to detect changes

  const handleOpenModal = (job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden";
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedJob(null);
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      requirement: "",
      message: "",
    });
    setSelectedFile(null);
    setFileError("");
    // Restore body scroll
    document.body.style.overflow = "unset";
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type - only allow .doc, .docx, and .pdf
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      const allowedExtensions = ['.pdf', '.doc', '.docx'];
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
      
      if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
        setFileError("Please upload a resume in PDF, DOC, or DOCX format only");
        setSelectedFile(null);
        e.target.value = ""; // Clear the input
        return;
      }
      
      // Check file size (5MB = 5 * 1024 * 1024 bytes)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        setFileError("File size must be less than 5MB");
        setSelectedFile(null);
        e.target.value = ""; // Clear the input
      } else {
        setSelectedFile(file);
        setFileError("");
      }
    } else {
      setSelectedFile(null);
      setFileError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedJob) return;

    // Validate that a resume is uploaded (required)
    if (!selectedFile) {
      setFileError("Please upload a resume to submit your application.");
      // Scroll to file input to show error
      const fileInput = document.getElementById("fileUpload");
      if (fileInput) {
        fileInput.scrollIntoView({ behavior: "smooth", block: "center" });
        fileInput.focus();
      }
      return;
    }

    // Clear any previous file errors
    setFileError("");

    // Define payload outside try block so it's accessible in catch
    const payload = {
      source: "careers",
      jobTitle: selectedJob.title,
      ...formData,
      requirement: formData.requirement,
    };

    try {
      setSubmitting(true);
      // Pass the file to submitForm - it will handle the upload
      console.log("📤 Submitting form with file:", {
        hasFile: !!selectedFile,
        fileName: selectedFile?.name,
        fileSize: selectedFile?.size,
        fileType: selectedFile?.type,
        fileObject: selectedFile,
      });

      console.log("✅ File will be uploaded:", {
        name: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type,
        sizeKB: (selectedFile.size / 1024).toFixed(2) + "KB",
      });

      console.log("📋 About to call submitForm with:", {
        hasPayload: !!payload,
        hasFile: !!selectedFile,
        filePassed: selectedFile,
      });

      const submissionId = await submitForm(payload, selectedFile);
      console.log("✅ Form submitted successfully with ID:", submissionId);

      alert(
        `Application submitted successfully!\n\nFile "${selectedFile.name}" has been uploaded.`
      );
      handleCloseModal();
    } catch (error) {
      console.error("❌ Error submitting application:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        hasFile: !!selectedFile,
        fileName: selectedFile?.name,
      });

      alert(
        `Failed to submit application: ${
          error.message || "Unknown error"
        }\n\nPlease check the browser console (F12) for more details.`
      );
    } finally {
      setSubmitting(false);
    }
  };

  const defaultJobs = [
    {
      title: "Community Manager",
      date: "10th Mar 2025",
      blurb:
        "We're looking for a warm, people-first individual to lead member engagement, curate events, and cultivate a welcoming coworking culture.",
      description:
        "As a Community Manager, you'll be the heart of our coworking space, fostering connections and creating an inclusive environment. Your role involves organizing networking events, managing member relationships, and ensuring our community thrives. You'll work closely with members to understand their needs, facilitate introductions, and maintain the vibrant culture that makes our space unique. This position requires excellent communication skills, empathy, and a passion for bringing people together.",
    },
    {
      title: "Space Operations Coordinator",
      date: "10th Mar 2025",
      blurb:
        "Support the day-to-day operations of our space—keeping things running smoothly, maintaining high standards, and ensuring an excellent member experience.",
      description:
        "The Space Operations Coordinator is responsible for maintaining the physical space and ensuring everything operates seamlessly. You'll manage facility maintenance, coordinate with vendors, oversee cleaning schedules, and handle any operational issues that arise. Your attention to detail and proactive approach will ensure our members always have a clean, functional, and welcoming workspace. This role requires strong organizational skills, problem-solving abilities, and a commitment to excellence in every aspect of space management.",
    },
    {
      title: "Membership Experience Associate",
      date: "10th Mar 2025",
      blurb:
        "Be the first point of contact for our members—whether onboarding new joiners or handling queries, you'll help everyone feel right at home.",
      description:
        "As a Membership Experience Associate, you'll be the friendly face that greets members daily and helps them navigate their coworking journey. Your responsibilities include conducting tours for prospective members, managing the onboarding process, handling member inquiries, and ensuring everyone feels supported. You'll maintain member records, process memberships, and serve as a liaison between members and management. This role is perfect for someone who is personable, organized, and dedicated to creating exceptional experiences from first contact to ongoing support.",
    },
    {
      title: "Events & Partnerships Executive",
      date: "10th Mar 2025",
      blurb:
        "Plan and deliver events that bring our community together, while building relationships with local partners to enrich our member offerings.",
      description:
        "The Events & Partnerships Executive plays a crucial role in building our community through strategic events and valuable partnerships. You'll plan and execute a diverse calendar of events including workshops, networking sessions, and social gatherings. Additionally, you'll identify and cultivate partnerships with local businesses, service providers, and organizations to enhance member benefits. This position requires creativity, strong relationship-building skills, and the ability to manage multiple projects simultaneously while ensuring each event delivers value to our community.",
    },
  ];

  const jobs = useMemo(() => {
    if (
      config?.openingsSection?.jobs &&
      config.openingsSection.jobs.length > 0
    ) {
      return config.openingsSection.jobs
        .filter((job) => job.enabled !== false)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
    }
    return defaultJobs;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config]);

  const heroBadgeText = config?.hero?.badgeText || "★ Opportunity";
  const heroTitle = useMemo(() => {
    const text = config?.hero?.title || "Life at\nUnited Brothers";
    const parts = String(text).split("\\n");
    return parts.map((line, idx) => (
      <React.Fragment key={idx}>
        {parseInlineFormatting(line)}
        {idx < parts.length - 1 && <br />}
      </React.Fragment>
    ));
  }, [config]);

  const heroSubtitle = useMemo(() => {
    const text =
      config?.hero?.subtitle ||
      "At the United Brothers Company, we are more than just a team; we are a family of innovators, creators, and professionals.";
    return parseInlineFormatting(text);
  }, [config]);

  const whyBadgeText = config?.whySection?.badgeText || "★ Why";
  const whyTitle = config?.whySection?.title || "Why Join Us?";
  const whyCards = useMemo(() => {
    return config?.whySection?.cards && config.whySection.cards.length > 0
      ? config.whySection.cards
      : [
          {
            title: "Nurture Your\nPotential",
            text: "We invest in our people through continuous learning and development opportunities, empowering you to grow both professionally and personally.",
            icon: starImage,
          },
          {
            title: "A Culture\nof Integrity",
            text: "Our core values of purity, quality, and trust are reflected in every aspect of our work, from our products to our people.",
            icon: starImage,
          },
          {
            title: "Make an\nImpact",
            text: "Be a part of a company that is shaping the future of the FMCG industry and making a positive difference in households worldwide.",
            icon: starImage,
          },
        ];
  }, [config?.whySection?.cards]);

  const [resolvedIcons, setResolvedIcons] = useState({});

  useEffect(() => {
    const resolveIcons = async () => {
      // Keep existing icons while loading new ones
      const newResolved = { ...resolvedIcons };

      for (const card of whyCards) {
        const cardKey = card.id || card.title;
        const currentIcon = card.icon;

        // If icon reference changed, load new one
        if (currentIcon && currentIcon !== newResolved[cardKey]) {
          if (
            currentIcon &&
            !currentIcon.startsWith("data:") &&
            !currentIcon.startsWith("http")
          ) {
            try {
              // Load new icon in background
              const resolved = await resolveImageUrl(currentIcon);
              if (resolved) {
                // Only update once new icon is loaded
                newResolved[cardKey] = resolved;
                setResolvedIcons({ ...newResolved });
              }
            } catch (err) {
              console.error("Error resolving icon:", err);
              newResolved[cardKey] = starImage;
              setResolvedIcons({ ...newResolved });
            }
          } else {
            // Direct URL, use immediately
            newResolved[cardKey] = currentIcon || starImage;
            setResolvedIcons({ ...newResolved });
          }
        } else if (!newResolved[cardKey]) {
          // New card without existing icon, use default
          newResolved[cardKey] = currentIcon || starImage;
          setResolvedIcons({ ...newResolved });
        }
      }

      // Remove icons for cards that no longer exist
      const currentCardKeys = new Set(whyCards.map((c) => c.id || c.title));
      const filtered = Object.fromEntries(
        Object.entries(newResolved).filter(([key]) => currentCardKeys.has(key))
      );
      if (Object.keys(filtered).length !== Object.keys(newResolved).length) {
        setResolvedIcons(filtered);
      }
    };
    resolveIcons();
  }, [whyCards, resolvedIcons]);

  const openingsBadgeText = config?.openingsSection?.badgeText || "★ Join Us";
  const openingsTitle = config?.openingsSection?.title || "Our Openings";

  const requirementLabel =
    config?.formSettings?.requirementLabel || "Requirement";
  const requirementOptions = config?.formSettings?.requirementOptions || [
    "Full-time",
    "Part-time",
    "Contract",
    "Internship",
  ];
  const submitButtonText = config?.formSettings?.submitButtonText || "Submit";

  // Don't show loading spinner - render immediately with cached/default data
  // if (loading || (config && config?.hero?.backgroundImage && !heroBgImage)) {
  //   return (
  //     <main className="careers">
  //       <div
  //         style={{
  //           padding: "4rem",
  //           textAlign: "center",
  //           minHeight: "50vh",
  //           display: "flex",
  //           flexDirection: "column",
  //           alignItems: "center",
  //           justifyContent: "center",
  //         }}
  //       >
  //         <div
  //           className="admin-spinner"
  //           style={{
  //             width: "40px",
  //             height: "40px",
  //             borderWidth: "4px",
  //             margin: "0 auto",
  //           }}
  //         ></div>
  //         <p style={{ marginTop: "1rem", color: "#64748b" }}>
  //           {loading ? "Loading careers page..." : "Loading image..."}
  //         </p>
  //       </div>
  //     </main>
  //   );
  // }

  return (
    <main className="careers">
      <section
        className="careers-hero"
        style={{
          backgroundImage: `linear-gradient(0deg, rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url(${
            heroBgImage || heroImage
          })`,
        }}
        aria-label="Careers hero"
      >
        <div className="site-container">
          <span className="pill pill-outline">{heroBadgeText}</span>
          <h1 className="hero-title">{heroTitle}</h1>
          <p className="hero-sub">{heroSubtitle}</p>
        </div>
      </section>

      <section className="why">
        <div className="site-container">
          <span className="pill pill-soft">{whyBadgeText}</span>
          <h2 className="section-title">{whyTitle}</h2>

          <div className="why-grid">
            {whyCards.map((card, index) => {
              const titleLines = String(card.title || "").split("\\n");
              const cardIcon =
                resolvedIcons[card.id || card.title] || card.icon || starImage;
              return (
                <div className="why-card" key={card.id || index}>
                  <div className="why-icon">
                    <img src={cardIcon} alt={`${card.title || 'Career'} feature icon`} />
                  </div>
                  <h3 className="why-head">
                    {titleLines.map((line, i) => (
                      <React.Fragment key={i}>
                        {parseInlineFormatting(line)}
                        {i < titleLines.length - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </h3>
                  <p className="why-text">
                    {parseInlineFormatting(card.text || "")}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="openings" aria-label="Current openings">
        <div className="site-container">
          <span className="pill pill-outline inverted">
            {openingsBadgeText}
          </span>
          <h2 className="section-title inverted">{openingsTitle}</h2>

          <ul className="job-list">
            {jobs.map((job) => (
              <li key={job.title} className="job-row">
                <div className="job-left">
                  <h3 className="job-title">{job.title}</h3>
                  <p className="job-date">
                    <span>Posted Date</span> / {job.date}
                  </p>
                </div>

                <div className="job-right">
                  <p className="job-blurb">{job.blurb}</p>
                  <button
                    className="btn-apply"
                    type="button"
                    aria-label={`Apply for ${job.title}`}
                    onClick={() => handleOpenModal(job)}
                  >
                    Apply Now
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Application Modal */}
      {isModalOpen && (
        <div className="apply-modal-overlay" onClick={handleCloseModal}>
          <div
            className="apply-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="apply-modal-close"
              onClick={handleCloseModal}
              aria-label="Close modal"
            >
              ×
            </button>
            <div className="apply-modal-header">
              <h2 className="apply-modal-title">
                Apply for {selectedJob?.title}
              </h2>
              {selectedJob?.description && (
                <p className="apply-modal-description">
                  {selectedJob.description}
                </p>
              )}
            </div>
            <form
              className="apply-modal-form"
              onSubmit={handleSubmit}
              autoComplete="on"
            >
              <div className="form-group">
                <div className="input-wrapper">
                  <label
                    htmlFor="firstName"
                    className={`input-label ${
                      formData.firstName ? "label-filled" : ""
                    }`}
                  >
                    First Name <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="John"
                    autoComplete="given-name"
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <div className="input-wrapper">
                  <label
                    htmlFor="lastName"
                    className={`input-label ${
                      formData.lastName ? "label-filled" : ""
                    }`}
                  >
                    Last Name <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Smith"
                    autoComplete="family-name"
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <div className="input-wrapper">
                  <label
                    htmlFor="email"
                    className={`input-label ${
                      formData.email ? "label-filled" : ""
                    }`}
                  >
                    Email <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="John@gmail.com"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <div className="input-wrapper">
                  <label
                    htmlFor="requirement"
                    className={`input-label ${
                      formData.requirement ? "label-filled" : ""
                    }`}
                  >
                    {requirementLabel} <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <select
                    id="requirement"
                    name="requirement"
                    value={formData.requirement}
                    onChange={handleChange}
                    autoComplete="off"
                    required
                  >
                    <option value="">
                      Select {requirementLabel.toLowerCase()}
                    </option>
                    {requirementOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <div className="input-wrapper">
                  <label
                    htmlFor="message"
                    className={`input-label ${
                      formData.message ? "label-filled" : ""
                    }`}
                  >
                    Message <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Your message here..."
                    autoComplete="off"
                    required
                  ></textarea>
                </div>
              </div>
              <div className="form-group">
                <div className="input-wrapper">
                  <label htmlFor="fileUpload" className="input-label">
                    Upload Resume (Max 5MB) <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <input
                    type="file"
                    id="fileUpload"
                    name="fileUpload"
                    onChange={handleFileChange}
                    accept=".doc,.docx,.pdf,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    className="file-input"
                    required
                  />
                  {fileError && <p className="file-error">{fileError}</p>}
                  {selectedFile && !fileError && (
                    <p className="file-success">
                      Selected: {selectedFile.name}
                    </p>
                  )}
                  {!fileError && !selectedFile && (
                    <p className="file-hint" style={{ 
                      fontSize: "12px", 
                      color: "#6b7280", 
                      marginTop: "4px" 
                    }}>
                      Please upload your resume in PDF, DOC, or DOCX format (required)
                    </p>
                  )}
                </div>
              </div>
              <button
                type="submit"
                className="apply-modal-submit-btn"
                disabled={submitting}
              >
                {submitting ? "Submitting..." : submitButtonText}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
