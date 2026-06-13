export const getCertificateTemplate = (
  studentName: string,
  courseName: string,
  issueDate: string,
  certificateCode: string,
): string => {
  // Xử lý tên khóa học nếu quá dài
  const maxChars = 45;
  let displayCourseName = courseName;
  let courseFontSize = 32;

  if (courseName.length > maxChars) {
    // Nếu quá dài, giảm font size
    courseFontSize = Math.max(
      22,
      32 - Math.floor((courseName.length - maxChars) / 5) * 2,
    );
  }

  // Nếu tên vẫn quá dài, cắt bớt
  if (courseName.length > 60) {
    displayCourseName = courseName.substring(0, 57) + '...';
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="700" height="495" viewBox="0 0 1120 792">
  <defs>
    <style>
      .bg { fill: #FEFCF5; }
      .border-outer { fill: none; stroke: #D4AF37; stroke-width: 4; }
      .border-middle { fill: none; stroke: #C5A059; stroke-width: 1.5; }
      .border-inner { fill: none; stroke: #D4AF37; stroke-width: 0.5; stroke-dasharray: 8 4; }
      
      /* Typography */
      .academy-name { font-family: 'Georgia', serif; font-size: 16px; fill: #9B7B3C; letter-spacing: 4px; font-weight: 600; text-anchor: middle; }
      .academy-slogan { font-family: 'Arial', sans-serif; font-size: 9px; fill: #B89B5B; letter-spacing: 2px; text-anchor: middle; }
      .cert-title { font-family: 'Georgia', serif; font-size: 52px; fill: #2C1810; letter-spacing: 10px; font-weight: bold; text-anchor: middle; }
      .cert-subtitle { font-family: 'Georgia', serif; font-size: 30px; fill: #D4AF37; letter-spacing: 5px; font-weight: normal; text-anchor: middle; }
      .present-text { font-family: 'Arial', sans-serif; font-size: 11px; fill: #9B7B3C; letter-spacing: 2px; text-anchor: middle; }
      .student-name { font-family: 'Georgia', serif; font-size: 58px; fill: #1A1A2E; text-anchor: middle; font-weight: bold; }
      .desc-text { font-family: 'Arial', sans-serif; font-size: 12px; fill: #666666; text-anchor: middle; }
      .course-name { font-family: 'Georgia', serif; font-size: ${courseFontSize}px; fill: #D4AF37; text-anchor: middle; font-weight: bold; font-style: italic; }
      .label-text { font-family: 'Arial', sans-serif; font-size: 9px; fill: #B89B5B; letter-spacing: 1.5px; text-anchor: middle; }
      .value-text { font-family: 'Arial', sans-serif; font-size: 11px; fill: #2C1810; text-anchor: middle; }
      .signature-name { font-family: 'Georgia', serif; font-size: 24px; fill: #9B7B3C; text-anchor: middle; font-style: italic; }
      .signature-title { font-family: 'Arial', sans-serif; font-size: 9px; fill: #B89B5B; letter-spacing: 1px; text-anchor: middle; }
      .footer-text { font-family: 'Arial', sans-serif; font-size: 7px; fill: #CCB580; text-anchor: middle; }
    </style>
    
    <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E8D5A3"/>
      <stop offset="30%" stop-color="#D4AF37"/>
      <stop offset="60%" stop-color="#F9E8B6"/>
      <stop offset="100%" stop-color="#C5A059"/>
    </linearGradient>
    
    <linearGradient id="goldLight" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#D4AF37" stop-opacity="0"/>
      <stop offset="50%" stop-color="#D4AF37" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#D4AF37" stop-opacity="0"/>
    </linearGradient>

    <filter id="softShadow">
      <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#1A1A2E" flood-opacity="0.12"/>
    </filter>

    <filter id="sealGlow">
      <feDropShadow dx="0" dy="1" stdDeviation="3" flood-color="#D4AF37" flood-opacity="0.3"/>
    </filter>
  </defs>
  
  <!-- ===== BACKGROUND ===== -->
  <rect width="1120" height="792" class="bg"/>
  
  <!-- Subtle floral pattern background -->
  <g opacity="0.02">
    <circle cx="80" cy="80" r="120" fill="none" stroke="#D4AF37" stroke-width="1"/>
    <circle cx="1040" cy="712" r="120" fill="none" stroke="#D4AF37" stroke-width="1"/>
    <circle cx="560" cy="396" r="300" fill="none" stroke="#D4AF37" stroke-width="0.5"/>
  </g>
  
  <!-- ===== BORDERS ===== -->
  <rect x="25" y="25" width="1070" height="742" rx="6" class="border-outer"/>
  <rect x="38" y="38" width="1044" height="716" rx="4" class="border-middle"/>
  <rect x="48" y="48" width="1024" height="696" rx="3" class="border-inner"/>
  
  <!-- ===== CORNER ORNAMENTS ===== -->
  <g fill="url(#goldGradient)" opacity="0.8">
    <path d="M 25 80 Q 25 25 80 25" stroke="url(#goldGradient)" stroke-width="3" fill="none"/>
    <circle cx="45" cy="45" r="4"/>
    <path d="M 1095 80 Q 1095 25 1040 25" stroke="url(#goldGradient)" stroke-width="3" fill="none"/>
    <circle cx="1075" cy="45" r="4"/>
    <path d="M 25 712 Q 25 767 80 767" stroke="url(#goldGradient)" stroke-width="3" fill="none"/>
    <circle cx="45" cy="747" r="4"/>
    <path d="M 1095 712 Q 1095 767 1040 767" stroke="url(#goldGradient)" stroke-width="3" fill="none"/>
    <circle cx="1075" cy="747" r="4"/>
  </g>
  
  <!-- ===== HEADER ===== -->
  <g transform="translate(560, 90)">
    <circle cx="0" cy="-8" r="24" fill="url(#goldGradient)" opacity="0.15"/>
    <circle cx="0" cy="-8" r="20" fill="none" stroke="#D4AF37" stroke-width="1.5"/>
    <polygon points="0,-24 3,-16 12,-16 5,-10 7,-2 0,-7 -7,-2 -5,-10 -12,-16 -3,-16" fill="#D4AF37"/>
    <text x="0" y="30" class="academy-name">HỌC VIỆN SMARTEDU</text>
    <text x="0" y="43" class="academy-slogan">TINH HOA TRI THỨC • KIẾN TẠO TƯƠNG LAI</text>
  </g>
  
  <!-- ===== MAIN TITLE ===== -->
  <text x="560" y="210" class="cert-title">CHỨNG CHỈ</text>
  
  <g transform="translate(560, 230)">
    <line x1="-120" y1="0" x2="-40" y2="0" stroke="#D4AF37" stroke-width="1"/>
    <polygon points="-28,-3 -20,0 -28,3" fill="#D4AF37"/>
    <circle cx="-8" cy="0" r="2" fill="#D4AF37"/>
    <circle cx="0" cy="0" r="2.5" fill="#D4AF37"/>
    <circle cx="8" cy="0" r="2" fill="#D4AF37"/>
    <polygon points="20,-3 28,0 20,3" fill="#D4AF37"/>
    <line x1="40" y1="0" x2="120" y2="0" stroke="#D4AF37" stroke-width="1"/>
  </g>
  
  <text x="560" y="270" class="cert-subtitle">HOÀN THÀNH KHÓA HỌC</text>
  
  <!-- ===== PRESENT TO ===== -->
  <text x="560" y="320" class="present-text">TRÂN TRỌNG TRAO TẶNG</text>
  
  <!-- Student Name -->
  <text x="560" y="395" class="student-name" filter="url(#softShadow)">${studentName}</text>
  
  <g transform="translate(560, 415)">
    <line x1="-220" y1="0" x2="-25" y2="0" stroke="#D4AF37" stroke-width="1" opacity="0.4"/>
    <rect x="-18" y="-3" width="36" height="6" rx="3" fill="#D4AF37" opacity="0.6"/>
    <line x1="25" y1="0" x2="220" y2="0" stroke="#D4AF37" stroke-width="1" opacity="0.4"/>
  </g>
  
  <!-- ===== DESCRIPTION & COURSE ===== -->
  <text x="560" y="465" class="desc-text">Vì đã xuất sắc hoàn thành chương trình đào tạo</text>
  
  <!-- Course Name - with dynamic width -->
  <g transform="translate(560, 500)">
    <rect x="-360" y="-20" width="720" height="40" rx="20" fill="url(#goldGradient)" opacity="0.08"/>
    <text x="0" y="7" class="course-name">${displayCourseName}</text>
  </g>
  
  <text x="560" y="555" class="desc-text" font-size="10">Đã thể hiện sự nỗ lực vượt bậc, tinh thần học tập nghiêm túc</text>
  <text x="560" y="572" class="desc-text" font-size="10">và đạt được những thành tích đáng ghi nhận trong suốt khóa học</text>
  
  <!-- ===== BOTTOM SECTION ===== -->
  <rect x="200" y="600" width="720" height="1" fill="url(#goldLight)"/>
  
  <!-- Certificate Code -->
  <g transform="translate(250, 640)">
    <text x="0" y="-6" class="label-text">Mã chứng chỉ</text>
    <rect x="-90" y="0" width="180" height="22" rx="4" fill="#F5F0E6" stroke="#D4AF37" stroke-width="0.5"/>
    <text x="0" y="15" class="value-text" font-weight="bold">${certificateCode}</text>
  </g>
  
  <!-- Issue Date -->
  <g transform="translate(870, 640)">
    <text x="0" y="-6" class="label-text">Ngày cấp</text>
    <rect x="-90" y="0" width="180" height="22" rx="4" fill="#F5F0E6" stroke="#D4AF37" stroke-width="0.5"/>
    <text x="0" y="15" class="value-text" font-weight="bold">${issueDate}</text>
  </g>
  
  <!-- Seal -->
  <g transform="translate(560, 640)" filter="url(#sealGlow)">
    <circle r="32" fill="url(#goldGradient)" opacity="0.95"/>
    <circle r="32" fill="none" stroke="#C5A059" stroke-width="1.5"/>
    <circle r="25" fill="none" stroke="#FEFCF5" stroke-width="1" stroke-dasharray="3 3"/>
    <polygon points="0,-17 3,-10 10,-10 4,-6 6,0 0,-4 -6,0 -4,-6 -10,-10 -3,-10" fill="#C5A059"/>
    <text x="0" y="22" text-anchor="middle" fill="#C5A059" font-size="6" font-weight="bold" letter-spacing="1">BẢO CHỨNG</text>
  </g>
  
  <!-- Signature -->
  <g transform="translate(560, 595)">
    <text x="0" y="-8" class="signature-title">NGƯỜI ĐẠI DIỆN</text>
    <path d="M -100 5 Q -75 -10 -50 -2 T -15 -3 T 15 6 T 50 2 T 85 5" stroke="#C5A059" stroke-width="1.5" fill="none" opacity="0.7"/>
    <text x="0" y="18" class="signature-name">TS. Nguyễn Văn Sỹ</text>
    <line x1="-120" y1="28" x2="120" y2="28" stroke="#D4AF37" stroke-width="0.5" opacity="0.3"/>
    <text x="0" y="42" class="signature-title">GIÁM ĐỐC HỌC VIỆN</text>
  </g>
  
  <!-- Footer -->
  <text x="560" y="695" class="footer-text">Chứng chỉ này có giá trị kiểm tra tại www.smartedu.vn/verify | Mã số: ${certificateCode}</text>
  
  <!-- QR Code -->
  <g transform="translate(70, 660)" opacity="0.35">
    <rect width="30" height="30" fill="none" stroke="#D4AF37" stroke-width="1" rx="2"/>
    <rect x="5" y="5" width="6" height="6" fill="#D4AF37"/>
    <rect x="5" y="14" width="6" height="6" fill="#D4AF37"/>
    <rect x="14" y="5" width="6" height="6" fill="#D4AF37"/>
    <rect x="14" y="14" width="6" height="6" fill="#D4AF37"/>
  </g>
  
</svg>`;
};
