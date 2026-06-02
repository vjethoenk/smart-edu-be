export const getCertificateTemplate = (
  studentName: string,
  courseName: string,
  issueDate: string,
  certificateCode: string,
): string => {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1120" height="792" viewBox="0 0 1120 792">
  <defs>
    <style>
      .bg { fill: #FEFCF5; }
      .border-outer { fill: none; stroke: #D4AF37; stroke-width: 4; }
      .border-middle { fill: none; stroke: #C5A059; stroke-width: 1.5; }
      .border-inner { fill: none; stroke: #D4AF37; stroke-width: 0.5; stroke-dasharray: 8 4; }
      
      /* Typography */
      .academy-name { font-family: 'Georgia', serif; font-size: 18px; fill: #9B7B3C; letter-spacing: 6px; font-weight: 600; text-anchor: middle; }
      .academy-slogan { font-family: 'Arial', sans-serif; font-size: 10px; fill: #B89B5B; letter-spacing: 3px; text-anchor: middle; }
      .cert-title { font-family: 'Georgia', serif; font-size: 62px; fill: #2C1810; letter-spacing: 12px; font-weight: bold; text-anchor: middle; }
      .cert-subtitle { font-family: 'Georgia', serif; font-size: 38px; fill: #D4AF37; letter-spacing: 6px; font-weight: normal; text-anchor: middle; }
      .present-text { font-family: 'Arial', sans-serif; font-size: 12px; fill: #9B7B3C; letter-spacing: 3px; text-anchor: middle; }
      .student-name { font-family: 'Georgia', serif; font-size: 72px; fill: #1A1A2E; text-anchor: middle; font-weight: bold; }
      .desc-text { font-family: 'Arial', sans-serif; font-size: 14px; fill: #666666; text-anchor: middle; }
      .course-name { font-family: 'Georgia', serif; font-size: 32px; fill: #D4AF37; text-anchor: middle; font-weight: bold; font-style: italic; }
      .label-text { font-family: 'Arial', sans-serif; font-size: 10px; fill: #B89B5B; letter-spacing: 2px; text-anchor: middle; text-transform: uppercase; }
      .value-text { font-family: 'Arial', sans-serif; font-size: 12px; fill: #2C1810; text-anchor: middle; }
      .signature-name { font-family: 'Georgia', serif; font-size: 28px; fill: #9B7B3C; text-anchor: middle; font-style: italic; }
      .signature-title { font-family: 'Arial', sans-serif; font-size: 10px; fill: #B89B5B; letter-spacing: 1px; text-anchor: middle; }
      .footer-text { font-family: 'Arial', sans-serif; font-size: 9px; fill: #CCB580; text-anchor: middle; }
    </style>
    
    <!-- Gradients -->
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
      <feDropShadow dx="0" dy="3" stdDeviation="6" flood-color="#1A1A2E" flood-opacity="0.15"/>
    </filter>

    <filter id="sealGlow">
      <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#D4AF37" flood-opacity="0.3"/>
    </filter>
  </defs>
  
  <!-- ===== BACKGROUND ===== -->
  <rect width="1120" height="792" class="bg"/>
  
  <!-- Subtle floral pattern background -->
  <g opacity="0.02">
    <circle cx="80" cy="80" r="120" fill="none" stroke="#D4AF37" stroke-width="1"/>
    <circle cx="80" cy="80" r="100" fill="none" stroke="#D4AF37" stroke-width="0.5"/>
    <circle cx="1040" cy="712" r="120" fill="none" stroke="#D4AF37" stroke-width="1"/>
    <circle cx="1040" cy="712" r="100" fill="none" stroke="#D4AF37" stroke-width="0.5"/>
    <circle cx="560" cy="396" r="300" fill="none" stroke="#D4AF37" stroke-width="0.5"/>
    <circle cx="560" cy="396" r="280" fill="none" stroke="#D4AF37" stroke-width="0.3"/>
  </g>
  
  <!-- ===== BORDERS ===== -->
  <!-- Outer thick border -->
  <rect x="25" y="25" width="1070" height="742" rx="6" class="border-outer"/>
  <!-- Middle border -->
  <rect x="38" y="38" width="1044" height="716" rx="4" class="border-middle"/>
  <!-- Inner dashed border -->
  <rect x="48" y="48" width="1024" height="696" rx="3" class="border-inner"/>
  
  <!-- ===== CORNER ORNAMENTS ===== -->
  <g fill="url(#goldGradient)" opacity="0.8">
    <!-- Top Left -->
    <path d="M 25 80 Q 25 25 80 25" stroke="url(#goldGradient)" stroke-width="3" fill="none"/>
    <circle cx="45" cy="45" r="4"/>
    <circle cx="60" cy="35" r="2.5"/>
    <circle cx="35" cy="60" r="2.5"/>
    
    <!-- Top Right -->
    <path d="M 1095 80 Q 1095 25 1040 25" stroke="url(#goldGradient)" stroke-width="3" fill="none"/>
    <circle cx="1075" cy="45" r="4"/>
    <circle cx="1060" cy="35" r="2.5"/>
    <circle cx="1085" cy="60" r="2.5"/>
    
    <!-- Bottom Left -->
    <path d="M 25 712 Q 25 767 80 767" stroke="url(#goldGradient)" stroke-width="3" fill="none"/>
    <circle cx="45" cy="747" r="4"/>
    <circle cx="60" cy="757" r="2.5"/>
    <circle cx="35" cy="732" r="2.5"/>
    
    <!-- Bottom Right -->
    <path d="M 1095 712 Q 1095 767 1040 767" stroke="url(#goldGradient)" stroke-width="3" fill="none"/>
    <circle cx="1075" cy="747" r="4"/>
    <circle cx="1060" cy="757" r="2.5"/>
    <circle cx="1085" cy="732" r="2.5"/>
  </g>
  
  <!-- ===== TOP DECORATIVE LINE ===== -->
  <rect x="200" y="110" width="720" height="1" fill="url(#goldLight)"/>
  
  <!-- ===== HEADER / LOGO AREA ===== -->
  <g transform="translate(560, 95)">
    <!-- Laurel wreath left -->
    <g transform="translate(-90, 0)" opacity="0.6">
      <path d="M 0,0 Q -20,-20 -15,-40 Q -5,-50 5,-40 Q 15,-30 10,-10 Z" fill="#D4AF37" opacity="0.3"/>
      <path d="M -5,5 Q -25,-15 -20,-35 Q -10,-45 0,-35 Q 10,-25 5,-5 Z" fill="#D4AF37" opacity="0.2"/>
    </g>
    
    <!-- Laurel wreath right -->
    <g transform="translate(90, 0)" opacity="0.6">
      <path d="M 0,0 Q 20,-20 15,-40 Q 5,-50 -5,-40 Q -15,-30 -10,-10 Z" fill="#D4AF37" opacity="0.3"/>
      <path d="M 5,5 Q 25,-15 20,-35 Q 10,-45 0,-35 Q -10,-25 -5,-5 Z" fill="#D4AF37" opacity="0.2"/>
    </g>
    
    <!-- Academy Emblem -->
    <circle cx="0" cy="-8" r="28" fill="url(#goldGradient)" opacity="0.15"/>
    <circle cx="0" cy="-8" r="24" fill="none" stroke="#D4AF37" stroke-width="1.5"/>
    <circle cx="0" cy="-8" r="18" fill="none" stroke="#D4AF37" stroke-width="0.5" stroke-dasharray="3 3"/>
    
    <!-- Emblem Star -->
    <polygon points="0,-28 4,-18 15,-18 6,-11 9,0 0,-6 -9,0 -6,-11 -15,-18 -4,-18" fill="#D4AF37"/>
    
    <text x="0" y="36" class="academy-name">HỌC VIỆN SMARTEDU</text>
    <text x="0" y="50" class="academy-slogan">TINH HOA TRI THỨC • KIẾN TẠO TƯƠNG LAI</text>
  </g>
  
  <!-- ===== MAIN TITLE ===== -->
  <text x="560" y="240" class="cert-title">CHỨNG CHỈ</text>
  
  <!-- Decorative divider under main title -->
  <g transform="translate(560, 260)">
    <line x1="-140" y1="0" x2="-50" y2="0" stroke="#D4AF37" stroke-width="1"/>
    <polygon points="-35,-3 -25,0 -35,3" fill="#D4AF37"/>
    <circle cx="-12" cy="0" r="2" fill="#D4AF37"/>
    <circle cx="0" cy="0" r="3" fill="#D4AF37"/>
    <circle cx="12" cy="0" r="2" fill="#D4AF37"/>
    <polygon points="25,-3 35,0 25,3" fill="#D4AF37"/>
    <line x1="50" y1="0" x2="140" y2="0" stroke="#D4AF37" stroke-width="1"/>
  </g>
  
  <text x="560" y="305" class="cert-subtitle">HOÀN THÀNH KHÓA HỌC</text>
  
  <!-- ===== PRESENT TO SECTION ===== -->
  <text x="560" y="360" class="present-text">TRÂN TRỌNG TRAO TẶNG</text>
  
  <!-- Student Name with decorative underline -->
  <text x="560" y="445" class="student-name" filter="url(#softShadow)">${studentName}</text>
  
  <g transform="translate(560, 465)">
    <line x1="-250" y1="0" x2="-30" y2="0" stroke="#D4AF37" stroke-width="1" opacity="0.4"/>
    <rect x="-20" y="-3" width="40" height="6" rx="3" fill="#D4AF37" opacity="0.6"/>
    <line x1="30" y1="0" x2="250" y2="0" stroke="#D4AF37" stroke-width="1" opacity="0.4"/>
  </g>
  
  <!-- ===== DESCRIPTION ===== -->
  <text x="560" y="520" class="desc-text">Vì đã xuất sắc hoàn thành chương trình đào tạo</text>
  
  <!-- Course Name - highlighted box -->
  <g transform="translate(560, 555)">
    <rect x="-320" y="-22" width="640" height="44" rx="22" fill="url(#goldGradient)" opacity="0.08"/>
    <text x="0" y="8" class="course-name">${courseName}</text>
  </g>
  
  <text x="560" y="610" class="desc-text" font-size="12">Đã thể hiện sự nỗ lực vượt bậc, tinh thần học tập nghiêm túc</text>
  <text x="560" y="632" class="desc-text" font-size="12">và đạt được những thành tích đáng ghi nhận trong suốt khóa học</text>
  
  <!-- ===== BOTTOM DECORATIVE LINE ===== -->
  <rect x="200" y="660" width="720" height="1" fill="url(#goldLight)"/>
  
  <!-- ===== LEFT SECTION: CERTIFICATE CODE ===== -->
  <g transform="translate(200, 705)">
    <text x="0" y="-8" class="label-text">Mã chứng chỉ</text>
    <rect x="-100" y="0" width="200" height="26" rx="4" fill="#F5F0E6" stroke="#D4AF37" stroke-width="0.5"/>
    <text x="0" y="17" class="value-text" font-weight="bold">${certificateCode}</text>
  </g>
  
  <!-- ===== RIGHT SECTION: ISSUE DATE ===== -->
  <g transform="translate(920, 705)">
    <text x="0" y="-8" class="label-text">Ngày cấp</text>
    <rect x="-100" y="0" width="200" height="26" rx="4" fill="#F5F0E6" stroke="#D4AF37" stroke-width="0.5"/>
    <text x="0" y="17" class="value-text" font-weight="bold">${issueDate}</text>
  </g>
  
  <!-- ===== CENTER: SEAL ===== -->
  <g transform="translate(560, 705)" filter="url(#sealGlow)">
    <circle r="38" fill="url(#goldGradient)" opacity="0.95"/>
    <circle r="38" fill="none" stroke="#C5A059" stroke-width="1.5"/>
    <circle r="30" fill="none" stroke="#FEFCF5" stroke-width="1" stroke-dasharray="4 3"/>
    <circle r="28" fill="none" stroke="#C5A059" stroke-width="0.5"/>
    
    <!-- Inner star -->
    <polygon points="0,-20 4,-12 12,-12 6,-7 8,0 0,-4 -8,0 -6,-7 -12,-12 -4,-12" fill="#C5A059"/>
    
    <text x="0" y="26" text-anchor="middle" fill="#C5A059" font-size="7" font-weight="bold" letter-spacing="1">BẢO CHỨNG</text>
  </g>
  
  <!-- ===== SIGNATURE SECTION ===== -->
  <g transform="translate(560, 660)">
    <text x="0" y="-10" class="signature-title">NGƯỜI ĐẠI DIỆN</text>
    
    <!-- Signature line -->
    <path d="M -120 5 Q -90 -15 -60 0 T -20 -2 T 10 8 T 50 2 T 90 5" 
          stroke="#C5A059" 
          stroke-width="2" 
          fill="none"
          opacity="0.7"/>
    
    <text x="0" y="22" class="signature-name">TS. Nguyễn Văn Sỹ</text>
    
    <line x1="-140" y1="35" x2="140" y2="35" stroke="#D4AF37" stroke-width="0.5" opacity="0.3"/>
    
    <text x="0" y="54" class="signature-title">GIÁM ĐỐC HỌC VIỆN</text>
  </g>
  
  <!-- ===== FOOTER ===== -->
  <text x="560" y="780" class="footer-text">Chứng chỉ này có giá trị kiểm tra tại www.smartedu.vn/verify | Mã số: ${certificateCode}</text>
  
  <!-- ===== QR CODE PLACEHOLDER ===== -->
  <g transform="translate(70, 730)" opacity="0.35">
    <rect width="36" height="36" fill="none" stroke="#D4AF37" stroke-width="1" rx="2"/>
    <rect x="6" y="6" width="8" height="8" fill="#D4AF37"/>
    <rect x="6" y="18" width="8" height="8" fill="#D4AF37"/>
    <rect x="18" y="6" width="8" height="8" fill="#D4AF37"/>
    <rect x="18" y="18" width="8" height="8" fill="#D4AF37"/>
    <rect x="22" y="26" width="8" height="4" fill="#D4AF37"/>
    <rect x="26" y="22" width="4" height="4" fill="#D4AF37"/>
  </g>
  
</svg>`;
};