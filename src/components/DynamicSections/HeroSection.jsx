import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { resolveVideoUrl } from '../../utils/videoUtils';
import { parseInlineFormatting } from '../../admin/components/BrandPageEditor/InlineFontEditor';
import '../Hero.css';
import './DynamicSections.css';
import heroVideo from '../../assets/trac.mp4';

// Helper function to extract YouTube video ID
const extractYouTubeVideoId = (url) => {
  if (!url) return null;
  
  // YouTube Shorts format: https://youtube.com/shorts/VIDEO_ID
  const shortsMatch = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/);
  if (shortsMatch) {
    return shortsMatch[1];
  }
  // Regular YouTube format: https://youtube.com/watch?v=VIDEO_ID
  else if (url.includes('youtube.com/watch')) {
    const match = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
    if (match) return match[1];
  }
  // Short URL format: https://youtu.be/VIDEO_ID
  else if (url.includes('youtu.be/')) {
    const match = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
    if (match) return match[1];
  }
  // Embed format: https://youtube.com/embed/VIDEO_ID
  else if (url.includes('youtube.com/embed/')) {
    const match = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/);
    if (match) return match[1];
  }
  
  return null;
};

// Helper function to get YouTube thumbnail URL
const getYouTubeThumbnail = (videoId) => {
  if (!videoId) return null;
  // Use maxresdefault for best quality, fallback to hqdefault
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
};

// Helper function to detect and convert YouTube URLs to embed format
const getYouTubeEmbedUrl = (url) => {
  if (!url) return null;
  
  // Check if already an embed URL (only return if it's already in embed format)
  if (url.includes('youtube.com/embed/')) {
    return url;
  }
  
  const videoId = extractYouTubeVideoId(url);
  
  if (videoId) {
    // Return proper embed URL with autoplay and loop settings
    // Added enablejsapi=1 for better loop control and seamless playback
    // playlist parameter ensures seamless looping without black screen
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&mute=1&controls=0&playlist=${videoId}&modestbranding=1&rel=0&wmode=opaque&iv_load_policy=3&fs=0&enablejsapi=1`;
  }
  
  return null;
};

// Check if URL is a YouTube URL
const isYouTubeUrl = (url) => {
  if (!url) return false;
  return url.includes('youtube.com') || url.includes('youtu.be');
};

// Check if URL is a Vimeo URL
const isVimeoUrl = (url) => {
  if (!url) return false;
  return url.includes('vimeo.com');
};

// Get Vimeo embed URL
const getVimeoEmbedUrl = (url) => {
  if (!url) return null;
  
  // Check if already an embed URL
  if (url.includes('player.vimeo.com/video/')) {
    // Ensure autoplay parameters are included
    const hasParams = url.includes('?');
    return hasParams 
      ? `${url}&autoplay=1&loop=1&muted=1&background=1`
      : `${url}?autoplay=1&loop=1&muted=1&background=1`;
  }
  
  // Extract video ID from various Vimeo URL formats
  // Format 1: https://vimeo.com/123456789
  // Format 2: https://vimeo.com/channels/staffpicks/123456789
  // Format 3: https://vimeo.com/groups/name/videos/123456789
  // Format 4: https://player.vimeo.com/video/123456789
  let videoId = null;
  
  // Try player.vimeo.com format first
  const playerMatch = url.match(/player\.vimeo\.com\/video\/(\d+)/);
  if (playerMatch) {
    videoId = playerMatch[1];
  } else {
    // Try regular vimeo.com format (extract last number sequence)
    const vimeoMatch = url.match(/vimeo\.com\/.*\/(\d+)/);
    if (vimeoMatch) {
      videoId = vimeoMatch[1];
    } else {
      // Try simple vimeo.com/123456789 format
      const simpleMatch = url.match(/vimeo\.com\/(\d+)/);
      if (simpleMatch) {
        videoId = simpleMatch[1];
      }
    }
  }
  
  if (videoId) {
    return `https://player.vimeo.com/video/${videoId}?autoplay=1&loop=1&muted=1&background=1`;
  }
  
  return null;
};

// Check if URL is an external embeddable video URL (not a direct video file)
const isExternalVideoUrl = (url) => {
  if (!url) return false;
  
  // Check for common video hosting platforms
  const externalVideoDomains = [
    'youtube.com',
    'youtu.be',
    'vimeo.com',
    'drive.google.com',
    'dailymotion.com',
    'dai.ly',
    'wistia.com',
    'wistia.net',
    'twitch.tv',
    'facebook.com',
    'fb.watch',
    'instagram.com',
    'tiktok.com',
    'bilibili.com',
    'streamable.com',
    'loom.com',
    'vidyard.com',
    'brightcove.com',
    'jwplayer.com',
    'kaltura.com'
  ];
  
  // Check if URL contains any external video domain
  const lowerUrl = url.toLowerCase();
  return externalVideoDomains.some(domain => lowerUrl.includes(domain));
};

// Check if URL is a Google Drive URL
const isGoogleDriveUrl = (url) => {
  if (!url) return false;
  return url.includes('drive.google.com');
};

// Extract Google Drive file ID from URL
const extractGoogleDriveFileId = (url) => {
  if (!url || !url.includes('drive.google.com')) {
    return null;
  }

  // Format 1: /file/d/FILE_ID/
  const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) {
    return fileMatch[1];
  }
  // Format 2: ?id=FILE_ID
  const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch) {
    return idMatch[1];
  }

  return null;
};

// Get Google Drive direct video stream URL
// This works if the file is shared with "Anyone with the link"
const getGoogleDriveVideoUrl = (url) => {
  const fileId = extractGoogleDriveFileId(url);
  if (fileId) {
    // Use 'view' export format which is better for streaming videos
    // This format works better with HTML5 video elements
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  }

  return null;
};

// Get embed URL for any external video platform
const getExternalVideoEmbedUrl = (url) => {
  if (!url) return null;
  
  // If it's already an embed URL (contains /embed/ or player.), return it with autoplay params
  if (url.includes('/embed/') || url.includes('/player/') || url.includes('player.')) {
    // Check if it already has query parameters
    const hasParams = url.includes('?');
    const separator = hasParams ? '&' : '?';
    return `${url}${separator}autoplay=1&muted=1`;
  }
  
  // Try YouTube first
  if (isYouTubeUrl(url)) {
    return getYouTubeEmbedUrl(url);
  }
  
  // Try Vimeo
  if (isVimeoUrl(url)) {
    return getVimeoEmbedUrl(url);
  }
  
  // Note: Google Drive is handled separately - it cannot be embedded due to CSP restrictions
  // So we don't try to convert it here
  
  // For other platforms, try to detect if it's an embeddable URL
  // If it's an external video URL but we can't convert it, return null
  // The component will handle it as a direct video or show an error
  return null;
};

export default function HeroSection({ content, styles = {} }) {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const videoRef = useRef(null);
  const textAlignment = content?.textAlignment || 'left';
  const [resolvedVideoUrl, setResolvedVideoUrl] = useState(null);
  const [isResolvingVideo, setIsResolvingVideo] = useState(false);
  const blobUrlRef = useRef(null); // Blob URL for base64 videos (better performance)
  const [shouldLoadIframe, setShouldLoadIframe] = useState(false);
  const [iframeScale, setIframeScale] = useState(1.5);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const iframeRef = useRef(null);
  const youtubePlayerRef = useRef(null);
  
  // Resolve video URL (handles Firestore IDs, base64, and external URLs) - optimized
  useEffect(() => {
    const resolveUrl = async () => {
      // Clean up previous blob URL if it exists
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
      
      if (content?.videoUrl) {
        // Check if it's already a full URL (doesn't need resolution)
        const isFullUrl = content.videoUrl.startsWith('data:') || 
                         content.videoUrl.startsWith('http://') || 
                         content.videoUrl.startsWith('https://') ||
                         isExternalVideoUrl(content.videoUrl);
        
        if (isFullUrl) {
          // Already a full URL - set immediately, convert blob in background
          setResolvedVideoUrl(content.videoUrl);
          setIsResolvingVideo(false);
          
          // Convert base64 to blob in background (non-blocking)
          if (content.videoUrl.startsWith('data:video/')) {
            // Don't await - let it happen in background
            fetch(content.videoUrl)
              .then(response => {
                if (response.ok) {
                  return response.blob();
                }
                throw new Error('Failed to fetch');
              })
              .then(blob => {
                if (blob.size > 0) {
                  const blobUrlObj = URL.createObjectURL(blob);
                  if (blobUrlRef.current) {
                    URL.revokeObjectURL(blobUrlRef.current);
                  }
                  blobUrlRef.current = blobUrlObj;
                  setResolvedVideoUrl(blobUrlObj);
                }
              })
              .catch(() => {
                // Keep using data URL if conversion fails
              });
          }
        } else {
          // It's a Firestore ID, need to resolve it
          setIsResolvingVideo(true);
          try {
            const url = await resolveVideoUrl(content.videoUrl);
            
            if (url) {
              // Set URL immediately
              setResolvedVideoUrl(url);
              setIsResolvingVideo(false);
              
              // Convert base64 to blob in background if needed
              if (url.startsWith('data:video/')) {
                fetch(url)
                  .then(response => {
                    if (response.ok) {
                      return response.blob();
                    }
                    throw new Error('Failed to fetch');
                  })
                  .then(blob => {
                    if (blob.size > 0) {
                      const blobUrlObj = URL.createObjectURL(blob);
                      if (blobUrlRef.current) {
                        URL.revokeObjectURL(blobUrlRef.current);
                      }
                      blobUrlRef.current = blobUrlObj;
                      setResolvedVideoUrl(blobUrlObj);
                    }
                  })
                  .catch(() => {
                    // Keep using data URL if conversion fails
                  });
              }
            } else {
              // If video resolution fails, use static fallback
              setResolvedVideoUrl(heroVideo);
              setIsResolvingVideo(false);
            }
          } catch (error) {
            // If video resolution fails, use static fallback
            setResolvedVideoUrl(heroVideo);
            setIsResolvingVideo(false);
          }
        }
      } else {
        // No video URL set in CMS - use static fallback video
        setResolvedVideoUrl(heroVideo);
        setIsResolvingVideo(false);
      }
    };
    resolveUrl();
    
    // Cleanup blob URL on unmount or when video changes
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, [content?.videoUrl]);
  
  // Determine video type and embed URL - use resolved URL or fallback to static video
  const videoUrl = resolvedVideoUrl || heroVideo;
  const isYouTube = videoUrl && isYouTubeUrl(videoUrl);
  const isVimeo = videoUrl && isVimeoUrl(videoUrl);
  const isGoogleDrive = videoUrl && isGoogleDriveUrl(videoUrl);
  // Get Google Drive direct video URL (if available)
  const googleDriveVideoUrl = isGoogleDrive ? getGoogleDriveVideoUrl(videoUrl) : null;
  // Track if Google Drive video failed to load
  const [googleDriveVideoFailed, setGoogleDriveVideoFailed] = useState(false);
  // Google Drive can be used as direct video if we have the stream URL
  const isExternalVideo = videoUrl && isExternalVideoUrl(videoUrl) && !isGoogleDrive;
  // Static video (heroVideo) should always be treated as direct video
  // Check if videoUrl is the static video (either exact match or contains trac.mp4)
  const isStaticVideo = videoUrl === heroVideo || (typeof videoUrl === 'string' && (videoUrl.includes('trac.mp4') || videoUrl === heroVideo));
  const isDirectVideo = videoUrl && (isStaticVideo || (!isExternalVideo || (isGoogleDrive && googleDriveVideoUrl && !googleDriveVideoFailed)));
  
  
  const youtubeEmbedUrl = isYouTube ? getYouTubeEmbedUrl(videoUrl) : null;
  const vimeoEmbedUrl = isVimeo ? getVimeoEmbedUrl(videoUrl) : null;
  const externalEmbedUrl = isExternalVideo ? getExternalVideoEmbedUrl(videoUrl) : null;
  
  // Get YouTube video ID and thumbnail (after videoUrl is defined)
  const youtubeVideoId = videoUrl && isYouTube ? extractYouTubeVideoId(videoUrl) : null;
  const youtubeThumbnail = youtubeVideoId ? getYouTubeThumbnail(youtubeVideoId) : null;


  // Detect video MIME type from data URL or default to webm/mp4
  const getVideoMimeType = (url) => {
    if (!url) return 'video/mp4';
    
    // Check if it's a data URL
    if (url.startsWith('data:video/')) {
      const mimeMatch = url.match(/data:video\/([^;]+)/);
      if (mimeMatch) {
        return `video/${mimeMatch[1]}`;
      }
    }
    
    // Check file extension
    if (url.includes('.webm')) return 'video/webm';
    if (url.includes('.mp4')) return 'video/mp4';
    if (url.includes('.mov')) return 'video/quicktime';
    if (url.includes('.ogg')) return 'video/ogg';
    
    // Default to webm (compressed videos are usually webm)
    return 'video/webm';
  };

  const videoMimeType = isDirectVideo ? getVideoMimeType(videoUrl) : 'video/mp4';

  // Extract styles - only non-dimension properties
  const backgroundColor = styles?.backgroundColor;

  // Build section style - only colors, NO dimensions
  const sectionStyle = {
    ...(backgroundColor && { backgroundColor }), // Only colors allowed
  };

  // No containerStyle - dimensions handled by CSS
  const containerStyle = {};

  // Build heading style with font formatting
  // Dimensions are hardcoded - users can only change content/features, not layout dimensions
  const headingStyle = {
    ...(styles?.headingFontFamily && { fontFamily: styles.headingFontFamily }),
    ...(styles?.headingColor && { color: styles.headingColor }),
    ...(styles?.headingFontSize && { fontSize: `${styles.headingFontSize}px` }),
    ...(styles?.headingFontWeight && { fontWeight: styles.headingFontWeight }),
    ...(styles?.headingFontStyle && { fontStyle: styles.headingFontStyle }),
    ...(styles?.headingTextTransform && { textTransform: styles.headingTextTransform }),
    ...(styles?.headingLineHeight && { lineHeight: styles.headingLineHeight }),
    ...(styles?.headingLetterSpacing && { letterSpacing: `${styles.headingLetterSpacing}em` }),
    // Don't set textAlign in inline style - let CSS handle it (especially for mobile)
    // Hardcoded dimensions - not editable by users
    maxWidth: '700px',
    marginBottom: '24px',
  };

  // Build description style with font formatting
  const descriptionStyle = {
    ...(styles?.descriptionFontFamily && { fontFamily: styles.descriptionFontFamily }),
    ...(styles?.descriptionColor && { color: styles.descriptionColor }),
    ...(styles?.descriptionFontSize && { fontSize: `${styles.descriptionFontSize}px` }),
    ...(styles?.descriptionFontWeight && { fontWeight: styles.descriptionFontWeight }),
    ...(styles?.descriptionFontStyle && { fontStyle: styles.descriptionFontStyle }),
    ...(styles?.descriptionTextTransform && { textTransform: styles.descriptionTextTransform }),
    ...(styles?.descriptionLineHeight && { lineHeight: styles.descriptionLineHeight }),
    ...(styles?.descriptionLetterSpacing && { letterSpacing: `${styles.descriptionLetterSpacing}em` }),
    ...(styles?.descriptionMaxWidth && { maxWidth: `${styles.descriptionMaxWidth}px` }),
    ...(styles?.descriptionMarginBottom && { marginBottom: `${styles.descriptionMarginBottom}px` }),
    // Don't set textAlign in inline style - let CSS handle it (especially for mobile)
  };

  // Build primary button style
  const primaryButtonStyle = {
    ...(styles?.primaryButtonBackgroundColor && { backgroundColor: styles.primaryButtonBackgroundColor }),
    ...(styles?.primaryButtonTextColor && { color: styles.primaryButtonTextColor }),
  };

  // Build secondary button style
  const secondaryButtonStyle = {
    ...(styles?.secondaryButtonBackgroundColor && { backgroundColor: styles.secondaryButtonBackgroundColor }),
    ...(styles?.secondaryButtonTextColor && { color: styles.secondaryButtonTextColor }),
  };

  // Ensure video plays when ready - optimized (reduced listeners and checks)
  useEffect(() => {
    if (!isDirectVideo || !videoRef.current || !videoUrl) return;

    const videoEl = videoRef.current;
    let pauseCheckInterval = null;

    // Simplified play attempt - don't wait for full load
    const attemptPlay = () => {
      if (videoEl.readyState >= 2) { // Have metadata at least
        videoEl.play().catch(() => {
          // Retry once after a short delay
          setTimeout(() => {
            if (videoEl.readyState >= 2) {
              videoEl.play().catch(() => {});
            }
          }, 300);
        });
      }
    };

    // Try to play immediately if ready, otherwise wait for canplay
    if (videoEl.readyState >= 2) {
      attemptPlay();
    } else {
      const handleCanPlay = () => {
        attemptPlay();
        videoEl.removeEventListener('canplay', handleCanPlay);
      };
      videoEl.addEventListener('canplay', handleCanPlay, { once: true });
    }

    // Reduced pause check interval - only check every 5 seconds instead of 2
    pauseCheckInterval = setInterval(() => {
      if (videoEl && !videoEl.ended && videoEl.paused && videoEl.readyState >= 2) {
        videoEl.play().catch(() => {});
      }
    }, 5000); // Check every 5 seconds (reduced frequency)

    // Minimal event listeners - only essential ones
    const handleWaiting = () => {
      // Resume when buffering completes
      const resumeWhenReady = () => {
        if (videoEl.readyState >= 2 && videoEl.paused && !videoEl.ended) {
          videoEl.play().catch(() => {});
        }
        videoEl.removeEventListener('canplay', resumeWhenReady);
      };
      videoEl.addEventListener('canplay', resumeWhenReady, { once: true });
    };

    videoEl.addEventListener('waiting', handleWaiting);

    return () => {
      if (pauseCheckInterval) clearInterval(pauseCheckInterval);
      videoEl.removeEventListener('waiting', handleWaiting);
    };
  }, [videoUrl, isDirectVideo]);

  useEffect(() => {
    // Only apply parallax to direct video files, not iframes
    if (typeof window === 'undefined' || !isDirectVideo || !videoRef.current) return;

    const handleScroll = () => {
      const videoEl = videoRef.current;
      const heroEl = heroRef.current;

      if (!videoEl || !heroEl) return;

      const isDesktop = window.innerWidth >= 768;

      // Disable parallax on mobile/tablet for performance & layout safety
      if (!isDesktop) {
        videoEl.style.transform = 'translate3d(0, 0, 0)';
        return;
      }

      const rect = heroEl.getBoundingClientRect();
      const speed = 0.25; // tweak for stronger/weaker parallax

      // When you scroll down, rect.top becomes negative.
      // This moves the video slightly and creates the parallax feel.
      const offsetY = rect.top * speed;

      // Keep it horizontally centered with -50% and move vertically with offsetY
      videoEl.style.transform = `translate3d(-50%, ${offsetY}px, 0)`;
    };

    // Run once on mount
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [content?.videoUrl, isDirectVideo]);

  // Calculate optimal iframe scale based on container dimensions
  // This ensures YouTube iframe always covers container without black bars
  useEffect(() => {
    if (!heroRef.current || (!isYouTube && !isVimeo && !isExternalVideo)) {
      return;
    }

    const calculateScale = () => {
      const container = heroRef.current;
      if (!container) return;

      const containerWidth = container.offsetWidth;
      const containerHeight = container.offsetHeight;
      const containerAspectRatio = containerWidth / containerHeight;
      
      // YouTube videos are 16:9 (1.7778)
      const videoAspectRatio = 16 / 9;
      
      let scale = 1.5; // Default scale
      
      if (containerAspectRatio > videoAspectRatio) {
        // Container is wider than 16:9, need to scale based on height
        // Video height at scale 1 = containerWidth / videoAspectRatio
        // We need: scale * (containerWidth / videoAspectRatio) >= containerHeight
        // So: scale >= containerHeight / (containerWidth / videoAspectRatio)
        scale = containerHeight / (containerWidth / videoAspectRatio);
      } else {
        // Container is taller than 16:9, need to scale based on width
        // Video width at scale 1 = containerHeight * videoAspectRatio
        // We need: scale * (containerHeight * videoAspectRatio) >= containerWidth
        // So: scale >= containerWidth / (containerHeight * videoAspectRatio)
        scale = containerWidth / (containerHeight * videoAspectRatio);
      }
      
      // Add 15% extra to ensure full coverage (no black bars)
      scale = scale * 1.15;
      
      // Ensure minimum scale of 1.2 and maximum of 2.5
      scale = Math.max(1.2, Math.min(2.5, scale));
      
      setIframeScale(scale);
    };

    // Calculate on mount and resize
    calculateScale();
    const resizeObserver = new ResizeObserver(calculateScale);
    if (heroRef.current) {
      resizeObserver.observe(heroRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [isYouTube, isVimeo, isExternalVideo, videoUrl]);

  // Initialize YouTube IFrame API for seamless looping (enhancement, not required)
  useEffect(() => {
    if (!isYouTube || !youtubeVideoId || !shouldLoadIframe) {
      return;
    }

    let retryCount = 0;
    const maxRetries = 15; // Try for up to 1.5 seconds

    // Wait for YouTube IFrame API to load and enhance the existing iframe
    const initYouTubePlayer = () => {
      if (window.YT && window.YT.Player && iframeRef.current) {
        try {
          // Destroy existing player if any
          if (youtubePlayerRef.current) {
            try {
              youtubePlayerRef.current.destroy();
            } catch (e) {
              // Ignore errors
            }
          }

          // Enhance the existing iframe with API control
          // The iframe already exists, we're just adding API control
          youtubePlayerRef.current = new window.YT.Player(iframeRef.current, {
            events: {
              onReady: (event) => {
                // Video is already playing via iframe, just track state
                setVideoPlaying(true);
                setIframeLoaded(true);
              },
              onStateChange: (event) => {
                // When video ends, immediately restart to prevent black screen
                if (event.data === window.YT.PlayerState.ENDED) {
                  // Restart video immediately - seek to start and play
                  if (youtubePlayerRef.current) {
                    youtubePlayerRef.current.seekTo(0, true);
                    youtubePlayerRef.current.playVideo();
                  }
                }
                // Track playing state
                if (event.data === window.YT.PlayerState.PLAYING) {
                  setVideoPlaying(true);
                } else if (event.data === window.YT.PlayerState.ENDED) {
                  // Keep video playing state true even when ended (will restart immediately)
                  setVideoPlaying(true);
                }
              },
              onError: (event) => {
                // YouTube player error
              }
            }
          });
        } catch (error) {
          // Continue with regular iframe - API is just an enhancement
        }
      } else {
        // Retry if API not loaded yet
        retryCount++;
        if (retryCount < maxRetries) {
          setTimeout(initYouTubePlayer, 100);
        }
        // If API doesn't load, that's fine - regular iframe will work
      }
    };

    // Check if API is already loaded
    if (window.YT && window.YT.Player) {
      // Wait a bit for iframe to be ready
      setTimeout(initYouTubePlayer, 500);
    } else {
      // Wait for API to load
      const originalCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (originalCallback) originalCallback();
        setTimeout(initYouTubePlayer, 500);
      };
      // Also try after a delay in case the event already fired
      setTimeout(initYouTubePlayer, 1000);
    }

    return () => {
      if (youtubePlayerRef.current) {
        try {
          youtubePlayerRef.current.destroy();
        } catch (e) {
          // Ignore errors
        }
        youtubePlayerRef.current = null;
      }
    };
  }, [isYouTube, youtubeVideoId, shouldLoadIframe]);

  // Defer iframe loading until after initial page render for faster page load
  // This allows the page to render first, then load the heavy YouTube iframe
  useEffect(() => {
    if (!videoUrl || (!isYouTube && !isVimeo && !isExternalVideo)) {
      return;
    }

    // Reset states when video changes
    setIframeLoaded(false);
    setVideoPlaying(false);

    // Load iframe immediately (no delay) - thumbnail already shown
    setShouldLoadIframe(true);
  }, [videoUrl, isYouTube, isVimeo, isExternalVideo]);

  return (
    <section className="hero dynamic-hero-section" ref={heroRef} style={sectionStyle}>
      {isResolvingVideo && (
        <div className="hero-video-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
          <p style={{ color: '#fff', zIndex: 1 }}>Loading video...</p>
        </div>
      )}
      {!isResolvingVideo && videoUrl && (
        <div className="hero-video-wrapper">
          {isYouTube && youtubeEmbedUrl ? (
            <>
              {/* Show thumbnail as background - visible when video not playing to prevent black screen */}
              {youtubeThumbnail && (
                <div 
                  className="hero-video dynamic-hero-video"
                  style={{
                    backgroundImage: `url(${youtubeThumbnail})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    opacity: (iframeLoaded && videoPlaying) ? 0 : 1,
                    transition: 'opacity 0.3s ease-in-out',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 1,
                    pointerEvents: 'none'
                  }}
                />
              )}
              {shouldLoadIframe ? (
                <>
                  {/* Always show iframe - API will enhance it if available */}
                  <iframe
                    ref={iframeRef}
                    id={`youtube-player-${youtubeVideoId}`}
                    src={youtubeEmbedUrl}
                    className="hero-video dynamic-hero-video"
                    frameBorder="0"
                    allow="autoplay; encrypted-media; accelerometer; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="YouTube video player"
                    loading="lazy"
                    fetchPriority="low"
                    style={{
                      transform: `translate(-50%, -50%) scale(${iframeScale})`,
                      opacity: iframeLoaded ? 1 : 0,
                      transition: 'opacity 0.3s ease-in-out',
                      zIndex: 2,
                      backgroundColor: 'transparent'
                    }}
                    onLoad={() => {
                      // If API is available, it will enhance the player
                      // Otherwise, just show the iframe
                      setTimeout(() => {
                        setIframeLoaded(true);
                        setVideoPlaying(true);
                      }, 300);
                    }}
                  />
                </>
              ) : (
                <div 
                  className="hero-video dynamic-hero-video"
                  style={{
                    backgroundImage: youtubeThumbnail ? `url(${youtubeThumbnail})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    backgroundColor: '#000',
                    display: youtubeThumbnail ? 'none' : 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 1
                  }}
                >
                  {!youtubeThumbnail && <p>Loading video...</p>}
                </div>
              )}
            </>
          ) : isVimeo && vimeoEmbedUrl ? (
            shouldLoadIframe ? (
              <iframe
                ref={iframeRef}
                src={vimeoEmbedUrl}
                className="hero-video dynamic-hero-video"
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                title="Vimeo video player"
                loading="lazy"
                fetchPriority="low"
                style={{
                  transform: `translate(-50%, -50%) scale(${iframeScale})`
                }}
              />
            ) : (
              <div 
                className="hero-video dynamic-hero-video"
                style={{
                  background: '#000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff'
                }}
              >
                <p>Loading video...</p>
              </div>
            )
          ) : isGoogleDriveUrl(videoUrl) && googleDriveVideoUrl && !googleDriveVideoFailed ? (
            // Try to use Google Drive as direct video (works if file is publicly shared)
            <video
              ref={videoRef}
              src={googleDriveVideoUrl}
              autoPlay
              loop
              muted
              playsInline
              controls={false}
              className="hero-video dynamic-hero-video"
              preload="auto"
              style={{ display: googleDriveVideoFailed ? 'none' : 'block' }}
              onError={(e) => {
                // If direct video fails, try alternative URL format
                const videoEl = e.target;
                const currentSrc = videoEl.src;
                let triedAlt = false;
                
                // If we're using 'view' format and it fails, try 'download' format
                if (currentSrc.includes('export=view') && !videoEl.dataset.triedAlt) {
                  const fileId = extractGoogleDriveFileId(videoUrl);
                  if (fileId) {
                    const altUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
                    videoEl.dataset.triedAlt = 'true';
                    videoEl.src = altUrl;
                    triedAlt = true;
                  }
                }
                
                // If both formats fail or we've already tried, mark as failed and show message
                if (!triedAlt) {
                  setGoogleDriveVideoFailed(true);
                }
              }}
              onLoadedData={() => {
                const videoEl = videoRef.current;
                if (videoEl) {
                  videoEl.play().catch(() => {});
                }
              }}
              onCanPlay={() => {
                const videoEl = videoRef.current;
                if (videoEl) {
                  videoEl.play().catch(() => {});
                }
              }}
            >
              <source src={googleDriveVideoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (isGoogleDriveUrl(videoUrl) && googleDriveVideoFailed) || (isGoogleDriveUrl(videoUrl) && !googleDriveVideoUrl) ? (
            // Google Drive video failed to load or invalid URL - show helpful message
            <div style={{ 
              position: 'absolute', 
              top: '50%', 
              left: '50%', 
              transform: 'translate(-50%, -50%)',
              color: '#fff',
              zIndex: 1,
              textAlign: 'center',
              padding: '24px',
              background: 'rgba(0, 0, 0, 0.85)',
              borderRadius: '8px',
              maxWidth: '90%',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
            }}>
              <p style={{ marginBottom: '12px', fontSize: '18px', fontWeight: 600 }}>
                ⚠️ Google Drive Video Not Available
              </p>
              <p style={{ marginBottom: '16px', fontSize: '14px', lineHeight: '1.6', color: '#e5e7eb' }}>
                Google Drive videos cannot be streamed directly due to technical limitations, even when publicly shared.
              </p>
              <div style={{ 
                marginBottom: '16px', 
                padding: '12px', 
                background: 'rgba(59, 130, 246, 0.2)', 
                borderRadius: '6px',
                border: '1px solid rgba(59, 130, 246, 0.3)'
              }}>
                <p style={{ marginBottom: '8px', fontSize: '13px', fontWeight: 500, color: '#93c5fd' }}>
                  📥 How to Fix:
                </p>
                <ol style={{ textAlign: 'left', fontSize: '12px', color: '#cbd5e1', margin: '0', paddingLeft: '20px', lineHeight: '1.8' }}>
                  <li>Download the video from Google Drive</li>
                  <li>Go to your CMS admin panel</li>
                  <li>Use the "Upload Video" button to upload it directly</li>
                  <li>The video will be automatically compressed to under 1MB</li>
                </ol>
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <a 
                  href={videoUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    display: 'inline-block',
                    padding: '10px 20px',
                    background: '#3b82f6',
                    color: '#fff',
                    textDecoration: 'none',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 500,
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#2563eb'}
                  onMouseLeave={(e) => e.target.style.background = '#3b82f6'}
                >
                  Open in Google Drive
                </a>
              </div>
            </div>
          ) : isExternalVideo && externalEmbedUrl ? (
            shouldLoadIframe ? (
              <iframe
                ref={iframeRef}
                src={externalEmbedUrl}
                className="hero-video dynamic-hero-video"
                frameBorder="0"
                allow="autoplay; encrypted-media; accelerometer; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
                title="External video player"
                loading="lazy"
                fetchPriority="low"
                style={{
                  transform: `translate(-50%, -50%) scale(${iframeScale})`
                }}
                onError={(e) => {
                  // External video iframe error
                }}
              />
            ) : (
              <div 
                className="hero-video dynamic-hero-video"
                style={{
                  background: '#000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff'
                }}
              >
                <p>Loading video...</p>
              </div>
            )
          ) : isExternalVideo && !externalEmbedUrl ? (
            // Fallback: try to use the URL directly as iframe src for other platforms
            shouldLoadIframe ? (
              <iframe
                ref={iframeRef}
                src={videoUrl}
                className="hero-video dynamic-hero-video"
                frameBorder="0"
                allow="autoplay; encrypted-media; accelerometer; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
                title="External video player"
                loading="lazy"
                fetchPriority="low"
                style={{
                  transform: `translate(-50%, -50%) scale(${iframeScale})`
                }}
                onError={(e) => {
                  // External video iframe error
                }}
              />
            ) : (
              <div 
                className="hero-video dynamic-hero-video"
                style={{
                  background: '#000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff'
                }}
              >
                <p>Loading video...</p>
              </div>
            )
          ) : isDirectVideo && videoUrl ? (
            <video
              ref={videoRef}
              src={videoUrl}
              autoPlay
              loop
              muted
              playsInline
              controls={false}
              className="hero-video dynamic-hero-video"
              preload="metadata"
              fetchPriority="high"
              onEnded={(e) => {
                // Ensure video loops properly without pause
                const videoEl = e.target;
                // Immediately restart without pause
                videoEl.currentTime = 0;
                // Use requestAnimationFrame for smooth restart
                requestAnimationFrame(() => {
                  videoEl.play().catch(() => {
                    // Retry after short delay
                    setTimeout(() => {
                      videoEl.play().catch(() => {});
                    }, 100);
                  });
                });
              }}
              onPause={(e) => {
                // Prevent unwanted pausing (except when video ends)
                const videoEl = e.target;
                if (!videoEl.ended && videoEl.readyState >= 3) {
                  // Video paused unintentionally, resume it
                  setTimeout(() => {
                    if (videoEl.paused && !videoEl.ended) {
                      videoEl.play().catch(() => {});
                    }
                  }, 100);
                }
              }}
              onError={(e) => {
                const videoEl = e.target;
                const error = videoEl?.error;
                
                // If it's a codec error, try without type attribute
                if (error?.code === 4) { // MEDIA_ERR_SRC_NOT_SUPPORTED
                  // Video codec not supported
                }
              }}
              onLoadedData={() => {
                // Video loaded successfully
              }}
              onCanPlay={() => {
                // Video can play
              }}
              onCanPlayThrough={() => {
                // Video is fully buffered, ensure it plays
                const videoEl = videoRef.current;
                if (videoEl && videoEl.paused) {
                  videoEl.play().catch(() => {});
                }
              }}
              onLoadedMetadata={() => {
                const videoEl = videoRef.current;
                if (videoEl) {
                  // Video metadata loaded
                }
              }}
              onTimeUpdate={() => {
                // Track video progress
              }}
              onWaiting={(e) => {
                // Video is buffering - ensure it resumes when ready
                const videoEl = e.target;
                
                // Set up a handler to resume when buffering completes
                const resumeWhenReady = () => {
                  if (videoEl.readyState >= 3 && !videoEl.ended) {
                    if (videoEl.paused) {
                      videoEl.play().catch(() => {});
                    }
                    videoEl.removeEventListener('canplay', resumeWhenReady);
                    videoEl.removeEventListener('canplaythrough', resumeWhenReady);
                    videoEl.removeEventListener('playing', resumeWhenReady);
                  }
                };
                
                videoEl.addEventListener('canplay', resumeWhenReady, { once: true });
                videoEl.addEventListener('canplaythrough', resumeWhenReady, { once: true });
                videoEl.addEventListener('playing', resumeWhenReady, { once: true });
              }}
              onProgress={(e) => {
                // Minimal progress tracking - only resume if paused with enough buffer
                const videoEl = e.target;
                if (videoEl.paused && !videoEl.ended && videoEl.readyState >= 3) {
                  if (videoEl.buffered.length > 0 && videoEl.duration) {
                    const bufferedEnd = videoEl.buffered.end(videoEl.buffered.length - 1);
                    const bufferedPercent = (bufferedEnd / videoEl.duration) * 100;
                    // Only try to play if we have at least 30% buffered
                    if (bufferedPercent > 30) {
                      videoEl.play().catch(() => {});
                    }
                  }
                }
              }}
            >
              <source src={videoUrl} type={videoMimeType} />
              {/* Fallback: try without type attribute for better compatibility */}
              <source src={videoUrl} />
              Your browser does not support the video tag.
            </video>
          ) : isDirectVideo && !isResolvingVideo ? (
            <div style={{ 
              position: 'absolute', 
              top: '50%', 
              left: '50%', 
              transform: 'translate(-50%, -50%)',
              color: '#fff',
              zIndex: 1,
              textAlign: 'center'
            }}>
              <p>Video not available</p>
              <p style={{ fontSize: '12px', marginTop: '8px' }}>
                {videoUrl ? `URL length: ${videoUrl.length}` : 'No video URL'}
              </p>
            </div>
          ) : null}
        </div>
      )}

      <div className="hero-overlay" />

      <div className={`container hero-inner hero-text-${textAlignment}`} style={containerStyle}>
        {content?.heading && (
          <h1 style={headingStyle}>
            {content.heading.split('\n').map((line, i, arr) => (
              <React.Fragment key={i}>
                {parseInlineFormatting(line)}
                {i < arr.length - 1 && <br />}
              </React.Fragment>
            ))}
          </h1>
        )}
        {content?.description && (
          <p 
            className="lead" 
            style={descriptionStyle}
          >
            {content.description.split('\n').map((line, i, arr) => (
              <React.Fragment key={i}>
                {parseInlineFormatting(line)}
                {i < arr.length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
        )}
        <div className="hero-actions">
          {content?.primaryButton?.text && (
            <a 
              className="btn" 
              style={primaryButtonStyle}
              href={content.primaryButton.link || '#'}
              onClick={(e) => {
                if (content.primaryButton.link?.startsWith('/')) {
                  e.preventDefault();
                  navigate(content.primaryButton.link);
                }
              }}
            >
              {content.primaryButton.text}
            </a>
          )}
          {content?.secondaryButton?.text && (
            <a 
              className="btn ghost" 
              style={secondaryButtonStyle}
              href={content.secondaryButton.link || '#'}
              onClick={(e) => {
                if (content.secondaryButton.link?.startsWith('/')) {
                  e.preventDefault();
                  navigate(content.secondaryButton.link);
                }
              }}
            >
              {content.secondaryButton.text}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

