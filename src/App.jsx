import { useState, useEffect, useRef } from 'react'
import QRCodeStyling from 'qr-code-styling'
import { Button } from '@/components/ui/button.jsx'
import { Download, AlertTriangle, Sparkles } from 'lucide-react'
import './App.css'

function App() {
  // QR Code configuration state
  const [qrConfig, setQrConfig] = useState({
    data: 'https://printscribe.ph',
    width: 400,
    height: 400,
    margin: 10,
    qrOptions: {
      errorCorrectionLevel: 'M'
    },
    dotsOptions: {
      color: '#000000',
      type: 'rounded',
      gradient: null
    },
    backgroundOptions: {
      color: '#FFFFFF'
    },
    cornersSquareOptions: {
      color: '#000000',
      type: 'extra-rounded'
    },
    cornersDotOptions: {
      color: '#000000',
      type: 'dot'
    },
    imageOptions: {
      hideBackgroundDots: true,
      imageSize: 0.4,
      margin: 10
    }
  })

  // UI state
  const [inputText, setInputText] = useState('https://printscribe.ph')
  const [dotColor, setDotColor] = useState('#000000')
  const [bgColor, setBgColor] = useState('#FFFFFF')
  const [dotStyle, setDotStyle] = useState('rounded')
  const [cornerSquareStyle, setCornerSquareStyle] = useState('extra-rounded')
  const [cornerDotStyle, setCornerDotStyle] = useState('dot')
  const [errorLevel, setErrorLevel] = useState('M')
  const [logoFile, setLogoFile] = useState(null)
  const [logoSize, setLogoSize] = useState(0.4)
  const [logoMargin, setLogoMargin] = useState(10)
  const [useGradient, setUseGradient] = useState(false)
  const [gradientType, setGradientType] = useState('linear')
  const [gradientColor2, setGradientColor2] = useState('#FFD700')
  const [contrastWarning, setContrastWarning] = useState(false)
  
  const qrCodeRef = useRef(null)
  const qrInstanceRef = useRef(null)

  // Initialize QR Code
  useEffect(() => {
    if (!qrInstanceRef.current) {
      qrInstanceRef.current = new QRCodeStyling(qrConfig)
      if (qrCodeRef.current) {
        qrCodeRef.current.innerHTML = ''
        qrInstanceRef.current.append(qrCodeRef.current)
      }
    }
  }, [])

  // Update QR Code when config changes
  useEffect(() => {
    if (qrInstanceRef.current) {
      const updatedConfig = { ...qrConfig }
      
      // Handle gradient
      if (useGradient) {
        updatedConfig.dotsOptions.gradient = {
          type: gradientType,
          rotation: 0,
          colorStops: [
            { offset: 0, color: dotColor },
            { offset: 1, color: gradientColor2 }
          ]
        }
        updatedConfig.dotsOptions.color = undefined
      } else {
        updatedConfig.dotsOptions.color = dotColor
        updatedConfig.dotsOptions.gradient = null
      }

      qrInstanceRef.current.update(updatedConfig)
      checkContrast()
    }
  }, [qrConfig, useGradient, gradientType, dotColor, gradientColor2])

  // Check color contrast for scannability
  const checkContrast = () => {
    const getColorBrightness = (hex) => {
      const rgb = parseInt(hex.slice(1), 16)
      const r = (rgb >> 16) & 0xff
      const g = (rgb >> 8) & 0xff
      const b = (rgb >> 0) & 0xff
      return (r * 299 + g * 587 + b * 114) / 1000
    }

    const dotBrightness = getColorBrightness(dotColor)
    const bgBrightness = getColorBrightness(bgColor)
    const contrast = Math.abs(dotBrightness - bgBrightness)
    
    setContrastWarning(contrast < 128)
  }

  // Update QR config
  const updateConfig = (updates) => {
    setQrConfig(prev => ({
      ...prev,
      ...updates
    }))
  }

  // Handle text input change
  const handleTextChange = (e) => {
    const value = e.target.value
    setInputText(value)
    updateConfig({ data: value || 'https://printscribe.com' })
  }

  // Handle dot color change
  const handleDotColorChange = (e) => {
    const color = e.target.value
    setDotColor(color)
    updateConfig({
      dotsOptions: {
        ...qrConfig.dotsOptions,
        color: useGradient ? undefined : color
      },
      cornersSquareOptions: {
        ...qrConfig.cornersSquareOptions,
        color: color
      },
      cornersDotOptions: {
        ...qrConfig.cornersDotOptions,
        color: color
      }
    })
  }

  // Handle background color change
  const handleBgColorChange = (e) => {
    const color = e.target.value
    setBgColor(color)
    updateConfig({
      backgroundOptions: {
        color: color
      }
    })
  }

  // Handle dot style change
  const handleDotStyleChange = (e) => {
    const style = e.target.value
    setDotStyle(style)
    updateConfig({
      dotsOptions: {
        ...qrConfig.dotsOptions,
        type: style
      }
    })
  }

  // Handle corner square style change
  const handleCornerSquareStyleChange = (e) => {
    const style = e.target.value
    setCornerSquareStyle(style)
    updateConfig({
      cornersSquareOptions: {
        ...qrConfig.cornersSquareOptions,
        type: style
      }
    })
  }

  // Handle corner dot style change
  const handleCornerDotStyleChange = (e) => {
    const style = e.target.value
    setCornerDotStyle(style)
    updateConfig({
      cornersDotOptions: {
        ...qrConfig.cornersDotOptions,
        type: style
      }
    })
  }

  // Handle error level change
  const handleErrorLevelChange = (e) => {
    const level = e.target.value
    setErrorLevel(level)
    updateConfig({
      qrOptions: {
        errorCorrectionLevel: level
      }
    })
  }

  // Handle logo upload
  const handleLogoUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setLogoFile(event.target.result)
        updateConfig({
          image: event.target.result,
          imageOptions: {
            ...qrConfig.imageOptions,
            imageSize: logoSize,
            margin: logoMargin
          }
        })
      }
      reader.readAsDataURL(file)
    }
  }

  // Remove logo
  const removeLogo = () => {
    setLogoFile(null)
    const newConfig = { ...qrConfig }
    delete newConfig.image
    setQrConfig(newConfig)
  }

  // Handle logo size change
  const handleLogoSizeChange = (e) => {
    const size = parseFloat(e.target.value)
    setLogoSize(size)
    if (logoFile) {
      updateConfig({
        imageOptions: {
          ...qrConfig.imageOptions,
          imageSize: size
        }
      })
    }
  }

  // Handle logo margin change
  const handleLogoMarginChange = (e) => {
    const margin = parseInt(e.target.value)
    setLogoMargin(margin)
    if (logoFile) {
      updateConfig({
        imageOptions: {
          ...qrConfig.imageOptions,
          margin: margin
        }
      })
    }
  }

  // Apply PrintScribe branding preset
  const applyPrintScribeBranding = () => {
    setDotColor('#000000')
    setBgColor('#FFFFFF')
    setDotStyle('rounded')
    setCornerSquareStyle('extra-rounded')
    setCornerDotStyle('dot')
    setUseGradient(false)
    
    updateConfig({
      dotsOptions: {
        color: '#000000',
        type: 'rounded',
        gradient: null
      },
      backgroundOptions: {
        color: '#FFFFFF'
      },
      cornersSquareOptions: {
        color: '#FFD700',
        type: 'extra-rounded'
      },
      cornersDotOptions: {
        color: '#FFD700',
        type: 'dot'
      }
    })
  }

  // Download QR code
  const downloadQR = (format) => {
    if (qrInstanceRef.current) {
      qrInstanceRef.current.download({
        name: 'printscribe-qr',
        extension: format
      })
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-black text-white py-6 px-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-1">
                <span className="text-[#FFD700]">PrintScribe</span> QR Generator
              </h1>
              <p className="text-gray-300 text-sm">Affordable. Quality. Consistency.</p>
            </div>
            <Button 
              onClick={applyPrintScribeBranding}
              className="gold-button flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Apply PrintScribe Branding
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Controls */}
          <div className="space-y-6">
            {/* Content Input */}
            <div className="control-section">
              <label className="control-label">QR Code Content</label>
              <input
                type="text"
                value={inputText}
                onChange={handleTextChange}
                placeholder="Enter URL, text, email, phone..."
                className="input-field"
              />
              <p className="text-xs text-gray-500 mt-2">
                Enter any text, URL, email, or phone number
              </p>
            </div>

            {/* Color Controls */}
            <div className="control-section">
              <label className="control-label">Colors</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Dot Color</label>
                  <input
                    type="color"
                    value={dotColor}
                    onChange={handleDotColorChange}
                    className="color-input"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Background Color</label>
                  <input
                    type="color"
                    value={bgColor}
                    onChange={handleBgColorChange}
                    className="color-input"
                  />
                </div>
              </div>

              {/* Gradient Options */}
              <div className="mt-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useGradient}
                    onChange={(e) => setUseGradient(e.target.checked)}
                    className="w-4 h-4 accent-[#FFD700]"
                  />
                  <span className="text-sm text-gray-700">Use Gradient</span>
                </label>
                
                {useGradient && (
                  <div className="mt-3 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-600 mb-1 block">Gradient Type</label>
                        <select
                          value={gradientType}
                          onChange={(e) => setGradientType(e.target.value)}
                          className="select-field"
                        >
                          <option value="linear">Linear</option>
                          <option value="radial">Radial</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 mb-1 block">Second Color</label>
                        <input
                          type="color"
                          value={gradientColor2}
                          onChange={(e) => setGradientColor2(e.target.value)}
                          className="color-input"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Contrast Warning */}
              {contrastWarning && (
                <div className="warning-box mt-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-yellow-800">Low Contrast Warning</p>
                      <p className="text-xs text-yellow-700 mt-1">
                        The QR code may not be scannable due to low contrast between dots and background.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Style Controls */}
            <div className="control-section">
              <label className="control-label">QR Code Style</label>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Dot Style</label>
                  <select
                    value={dotStyle}
                    onChange={handleDotStyleChange}
                    className="select-field"
                  >
                    <option value="square">Square</option>
                    <option value="dots">Dots</option>
                    <option value="rounded">Rounded</option>
                    <option value="extra-rounded">Extra Rounded</option>
                    <option value="classy">Classy</option>
                    <option value="classy-rounded">Classy Rounded</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Corner Square Style</label>
                  <select
                    value={cornerSquareStyle}
                    onChange={handleCornerSquareStyleChange}
                    className="select-field"
                  >
                    <option value="square">Square</option>
                    <option value="dot">Dot</option>
                    <option value="extra-rounded">Extra Rounded</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Corner Dot Style</label>
                  <select
                    value={cornerDotStyle}
                    onChange={handleCornerDotStyleChange}
                    className="select-field"
                  >
                    <option value="square">Square</option>
                    <option value="dot">Dot</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Error Correction */}
            <div className="control-section">
              <label className="control-label">Error Correction Level</label>
              <select
                value={errorLevel}
                onChange={handleErrorLevelChange}
                className="select-field"
              >
                <option value="L">L - Low (7%)</option>
                <option value="M">M - Medium (15%)</option>
                <option value="Q">Q - Quartile (25%)</option>
                <option value="H">H - High (30%)</option>
              </select>
              <p className="text-xs text-gray-500 mt-2">
                Higher levels allow the QR code to be read even if partially damaged
              </p>
            </div>

            {/* Logo Upload */}
            <div className="control-section">
              <label className="control-label">Logo (Optional)</label>
              {!logoFile ? (
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label
                    htmlFor="logo-upload"
                    className="logo-preview cursor-pointer hover:border-[#FFD700] transition-colors"
                  >
                    <span className="text-gray-400 text-sm">Click to upload logo</span>
                  </label>
                </div>
              ) : (
                <div>
                  <div className="logo-preview">
                    <img src={logoFile} alt="Logo preview" className="max-w-full max-h-full object-contain" />
                  </div>
                  <Button
                    onClick={removeLogo}
                    variant="outline"
                    className="w-full mt-2"
                  >
                    Remove Logo
                  </Button>
                  <div className="mt-4 space-y-3">
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">
                        Logo Size: {(logoSize * 100).toFixed(0)}%
                      </label>
                      <input
                        type="range"
                        min="0.2"
                        max="0.5"
                        step="0.05"
                        value={logoSize}
                        onChange={handleLogoSizeChange}
                        className="w-full accent-[#FFD700]"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">
                        Logo Margin: {logoMargin}px
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="20"
                        step="1"
                        value={logoMargin}
                        onChange={handleLogoMarginChange}
                        className="w-full accent-[#FFD700]"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Preview and Download */}
          <div className="space-y-6">
            {/* Preview */}
            <div className="control-section">
              <label className="control-label">Live Preview</label>
              <div className="qr-preview-container">
                <div ref={qrCodeRef}></div>
              </div>
            </div>

            {/* Download Buttons */}
            <div className="control-section">
              <label className="control-label">Download QR Code</label>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={() => downloadQR('png')}
                  className="gold-button flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  PNG
                </Button>
                <Button
                  onClick={() => downloadQR('svg')}
                  className="gold-button flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  SVG
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-3 text-center">
                Static QR codes • No tracking • Client-side only
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-2">About This Tool</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                This QR code generator runs entirely in your browser. No data is sent to any server, 
                ensuring complete privacy. The generated QR codes are static and will work forever 
                without any tracking or analytics.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black text-white py-6 px-4 mt-12">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-gray-400">
            © 2025 PrintScribe. All rights reserved.
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Affordable. Quality. Consistency.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
