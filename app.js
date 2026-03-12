// Tabs
document.getElementById('tab-resize').addEventListener('click', () => switchTab('resize'));
document.getElementById('tab-radius').addEventListener('click', () => switchTab('radius'));

function switchTab(tab) {
   document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
   document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
   document.getElementById('tab-' + tab).classList.add('active');
   document.getElementById('panel-' + tab).classList.add('active');
}

// Toast (Not bred)
const toast = document.getElementById('toast');
const toastMsg = document.getElementById('toast-msg');

function showToast(icon, msg) {
   toastMsg.textContent = msg;
   toast.querySelector('.material-symbols-rounded').textContent = icon;
   toast.classList.add('show');
   setTimeout(() => toast.classList.remove('show'), 2800);
}

function getMimeType(fmt) {
   return fmt === 'jpg' ? 'image/jpeg' : fmt === 'webp' ? 'image/webp' : 'image/png';
}

function hasTransparency(img) {
   const c = document.createElement('canvas');
   const sw = Math.min(img.width, 64);
   const sh = Math.min(img.height, 64);
   c.width = sw;
   c.height = sh;
   const cx = c.getContext('2d');
   cx.drawImage(img, 0, 0, sw, sh);
   const data = cx.getImageData(0, 0, sw, sh).data;
   for (let i = 3; i < data.length; i += 4) {
      if (data[i] < 255) return true;
   }
   return false;
}

// RESIZE
const rzDrop = document.getElementById('rz-drop');
const rzFile = document.getElementById('rz-file');
const rzCanvas = document.getElementById('rz-canvas');
const rzCtx = rzCanvas.getContext('2d');
const rzPreviewImg = document.getElementById('rz-preview-img');
const rzPreviewWrap = document.getElementById('rz-preview-wrap');
const rzPreviewBox = document.getElementById('rz-preview-box');
const rzSettings = document.getElementById('rz-settings');
const rzInfoRow = document.getElementById('rz-info-row');
const rzAlphaChip = document.getElementById('rz-alpha-chip');
const rzQuality = document.getElementById('rz-quality');
const rzQualityVal = document.getElementById('rz-quality-val');
const rzQualitySection = document.getElementById('rz-quality-section');
const rzScaleChip = document.getElementById('rz-scale-chip');
const rzOutDims = document.getElementById('rz-out-dims');
const rzOutRatio = document.getElementById('rz-out-ratio');
const rzBadge = document.getElementById('rz-badge');
const rzDlLabel = document.getElementById('rz-dl-label');

let rzImg = null,
   rzScale = 1,
   rzFmt = 'jpg',
   rzHasAlpha = false;

rzDrop.addEventListener('click', () => rzFile.click());
rzDrop.addEventListener('dragover', (e) => {
   e.preventDefault();
   rzDrop.classList.add('drag-over');
});
rzDrop.addEventListener('dragleave', () => rzDrop.classList.remove('drag-over'));
rzDrop.addEventListener('drop', (e) => {
   e.preventDefault();
   rzDrop.classList.remove('drag-over');
   const f = e.dataTransfer.files[0];
   if (f && f.type.startsWith('image/')) rzLoad(f);
});
rzFile.addEventListener('change', (e) => {
   if (e.target.files[0]) rzLoad(e.target.files[0]);
});

function rzLoad(file) {
   const reader = new FileReader();
   reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
         rzImg = img;
         rzScale = 1;
         rzHasAlpha = hasTransparency(img);
         document.getElementById('rz-filename').textContent =
            file.name.length > 22 ? file.name.substring(0, 20) + '…' : file.name;
         document.getElementById('rz-origsize').textContent = img.width + ' × ' + img.height + 'px';
         rzInfoRow.style.display = 'flex';
         rzAlphaChip.style.display = rzHasAlpha ? 'flex' : 'none';

         if (rzHasAlpha) {
            rzPreviewBox.classList.add('checker');
            rzFmt = 'png';
            document.querySelectorAll('#rz-format-chips .format-chip').forEach(c =>
               c.classList.toggle('active', c.dataset.fmt === 'png'));
            rzQualitySection.style.display = 'none';
            rzDlLabel.textContent = 'Download PNG';
         } else {
            rzPreviewBox.classList.remove('checker');
            rzFmt = 'jpg';
            document.querySelectorAll('#rz-format-chips .format-chip').forEach(c =>
               c.classList.toggle('active', c.dataset.fmt === 'jpg'));
            rzQualitySection.style.display = '';
            rzDlLabel.textContent = 'Download JPG';
         }

         document.querySelectorAll('#rz-scale-btns .chip-btn').forEach(b =>
            b.classList.toggle('active', b.dataset.scale === '1'));
         rzScaleChip.textContent = '1×';
         rzRender();
         rzPreviewWrap.classList.add('visible');
         rzSettings.style.display = 'block';
      };
      img.src = e.target.result;
   };
   reader.readAsDataURL(file);
}

function rzRender() {
   if (!rzImg) return;
   const w = Math.round(rzImg.width * rzScale);
   const h = Math.round(rzImg.height * rzScale);
   rzCanvas.width = w;
   rzCanvas.height = h;
   rzCtx.clearRect(0, 0, w, h);
   rzCtx.drawImage(rzImg, 0, 0, w, h);
   rzPreviewImg.src = rzCanvas.toDataURL(getMimeType(rzFmt), rzQuality.value / 100);
   rzBadge.textContent = w + ' × ' + h;
   rzOutDims.textContent = w + ' × ' + h + ' px';
   const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
   const g = gcd(w, h);
   rzOutRatio.textContent = 'Ratio ' + (w / g) + ':' + (h / g) + ' · Original ratio preserved';
}

document.getElementById('rz-scale-btns').addEventListener('click', (e) => {
   const btn = e.target.closest('.chip-btn');
   if (!btn) return;
   rzScale = parseFloat(btn.dataset.scale);
   rzScaleChip.textContent = btn.dataset.scale + '×';
   document.querySelectorAll('#rz-scale-btns .chip-btn').forEach(b => b.classList.remove('active'));
   btn.classList.add('active');
   rzRender();
});

document.getElementById('rz-format-chips').addEventListener('click', (e) => {
   const chip = e.target.closest('.format-chip');
   if (!chip) return;
   rzFmt = chip.dataset.fmt;
   document.querySelectorAll('#rz-format-chips .format-chip').forEach(c => c.classList.remove('active'));
   chip.classList.add('active');
   rzQualitySection.style.display = rzFmt !== 'png' ? '' : 'none';
   rzDlLabel.textContent = 'Download ' + rzFmt.toUpperCase();
   rzRender();
});

rzQuality.addEventListener('input', () => {
   rzQualityVal.textContent = rzQuality.value + '%';
   rzQuality.style.setProperty('--pct', ((rzQuality.value - 10) / 90 * 100) + '%');
   if (rzImg) rzRender();
});
rzQuality.style.setProperty('--pct', '91.1%');

document.getElementById('rz-download').addEventListener('click', () => {
   if (!rzImg) return;
   const w = Math.round(rzImg.width * rzScale);
   const h = Math.round(rzImg.height * rzScale);
   const link = document.createElement('a');
   link.download = 'resized_' + w + 'x' + h + '.' + rzFmt;
   link.href = rzCanvas.toDataURL(getMimeType(rzFmt), rzQuality.value / 100);
   link.click();
   showToast('check_circle', 'Saved as ' + rzFmt.toUpperCase() + '!');
});

document.getElementById('rz-reset').addEventListener('click', () => {
   rzFile.value = '';
   rzImg = null;
   rzScale = 1;
   rzFmt = 'jpg';
   rzHasAlpha = false;
   rzCtx.clearRect(0, 0, rzCanvas.width, rzCanvas.height);
   rzPreviewImg.src = '';
   rzPreviewBox.classList.remove('checker');
   rzPreviewWrap.classList.remove('visible');
   rzSettings.style.display = 'none';
   rzInfoRow.style.display = 'none';
   rzAlphaChip.style.display = 'none';
   rzQuality.value = 92;
   rzQualityVal.textContent = '92%';
   rzQuality.style.setProperty('--pct', '91.1%');
   rzQualitySection.style.display = '';
   document.querySelectorAll('#rz-scale-btns .chip-btn').forEach(b =>
      b.classList.toggle('active', b.dataset.scale === '1'));
   document.querySelectorAll('#rz-format-chips .format-chip').forEach(c =>
      c.classList.toggle('active', c.dataset.fmt === 'jpg'));
   rzScaleChip.textContent = '1×';
   rzDlLabel.textContent = 'Download JPG';
   showToast('restart_alt', 'Reset');
});

// BORDER RADIUS
const brDrop = document.getElementById('br-drop');
const brFile = document.getElementById('br-file');
const brCanvas = document.getElementById('br-canvas');
const brCtx = brCanvas.getContext('2d');
const brPreviewWrap = document.getElementById('br-preview-wrap');
const brSettings = document.getElementById('br-settings');
const brSlider = document.getElementById('br-slider');
const brRadiusVal = document.getElementById('br-radius-val');
const brQuality = document.getElementById('br-quality');
const brQualityVal = document.getElementById('br-quality-val');
const brQualitySection = document.getElementById('br-quality-section');
const brDlLabel = document.getElementById('br-dl-label');

let brImg = null,
   brFmt = 'png';

brDrop.addEventListener('click', () => brFile.click());
brDrop.addEventListener('dragover', (e) => {
   e.preventDefault();
   brDrop.classList.add('drag-over');
});
brDrop.addEventListener('dragleave', () => brDrop.classList.remove('drag-over'));
brDrop.addEventListener('drop', (e) => {
   e.preventDefault();
   brDrop.classList.remove('drag-over');
   const f = e.dataTransfer.files[0];
   if (f && f.type.startsWith('image/')) brLoad(f);
});
brFile.addEventListener('change', (e) => {
   if (e.target.files[0]) brLoad(e.target.files[0]);
});

function brLoad(file) {
   const reader = new FileReader();
   reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
         brImg = img;
         brCanvas.width = img.width;
         brCanvas.height = img.height;
         const maxD = 480;
         const scale = Math.min(maxD / img.width, maxD / img.height, 1);
         brCanvas.style.width = Math.round(img.width * scale) + 'px';
         brCanvas.style.height = Math.round(img.height * scale) + 'px';
         brSlider.value = 0;
         brSlider.style.setProperty('--pct', '0%');
         brRadiusVal.textContent = '0px';
         setActiveBrPreset('0');
         brRender();
         brPreviewWrap.classList.add('visible');
         brSettings.style.display = 'block';
      };
      img.src = e.target.result;
   };
   reader.readAsDataURL(file);
}

function brRender() {
   if (!brImg) return;
   const w = brCanvas.width,
      h = brCanvas.height;
   const radius = (parseInt(brSlider.value) / 100) * Math.min(w, h);
   brCtx.clearRect(0, 0, w, h);
   brCtx.save();
   roundedRect(brCtx, 0, 0, w, h, radius);
   brCtx.clip();
   brCtx.drawImage(brImg, 0, 0, w, h);
   brCtx.restore();
}

function roundedRect(ctx, x, y, w, h, r) {
   ctx.beginPath();
   ctx.moveTo(x + r, y);
   ctx.lineTo(x + w - r, y);
   ctx.quadraticCurveTo(x + w, y, x + w, y + r);
   ctx.lineTo(x + w, y + h - r);
   ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
   ctx.lineTo(x + r, y + h);
   ctx.quadraticCurveTo(x, y + h, x, y + h - r);
   ctx.lineTo(x, y + r);
   ctx.quadraticCurveTo(x, y, x + r, y);
   ctx.closePath();
}

brSlider.addEventListener('input', () => {
   const val = brSlider.value;
   const minSide = brImg ? Math.min(brCanvas.width, brCanvas.height) : 0;
   brRadiusVal.textContent = Math.round((val / 100) * minSide) + 'px';
   brSlider.style.setProperty('--pct', (val / brSlider.max * 100) + '%');
   document.querySelectorAll('#br-presets .chip-btn').forEach(c => c.classList.remove('active'));
   brRender();
});

document.getElementById('br-presets').addEventListener('click', (e) => {
   const chip = e.target.closest('.chip-btn');
   if (!chip) return;
   const val = chip.dataset.value;
   brSlider.value = val;
   brSlider.style.setProperty('--pct', (val / brSlider.max * 100) + '%');
   const minSide = brImg ? Math.min(brCanvas.width, brCanvas.height) : 0;
   brRadiusVal.textContent = brImg ? Math.round((val / 100) * minSide) + 'px' : '0px';
   setActiveBrPreset(val);
   brRender();
});

function setActiveBrPreset(val) {
   document.querySelectorAll('#br-presets .chip-btn').forEach(c =>
      c.classList.toggle('active', c.dataset.value === val));
}

document.getElementById('br-format-chips').addEventListener('click', (e) => {
   const chip = e.target.closest('.format-chip');
   if (!chip) return;
   brFmt = chip.dataset.fmt;
   document.querySelectorAll('#br-format-chips .format-chip').forEach(c => c.classList.remove('active'));
   chip.classList.add('active');
   brQualitySection.style.display = brFmt !== 'png' ? '' : 'none';
   brDlLabel.textContent = 'Save as ' + brFmt.toUpperCase();
});

brQuality.addEventListener('input', () => {
   brQualityVal.textContent = brQuality.value + '%';
   brQuality.style.setProperty('--pct', ((brQuality.value - 10) / 90 * 100) + '%');
});
brQuality.style.setProperty('--pct', '91.1%');

document.getElementById('br-download').addEventListener('click', () => {
   if (!brImg) return;
   const link = document.createElement('a');
   link.download = 'rounded-image.' + brFmt;
   link.href = brCanvas.toDataURL(getMimeType(brFmt), brQuality.value / 100);
   link.click();
   showToast('check_circle', 'Saved as ' + brFmt.toUpperCase() + '!');
});

document.getElementById('br-reset').addEventListener('click', () => {
   brFile.value = '';
   brImg = null;
   brFmt = 'png';
   brCtx.clearRect(0, 0, brCanvas.width, brCanvas.height);
   brPreviewWrap.classList.remove('visible');
   brSettings.style.display = 'none';
   brSlider.value = 0;
   brSlider.style.setProperty('--pct', '0%');
   brRadiusVal.textContent = '0px';
   setActiveBrPreset('0');
   brQuality.value = 92;
   brQualityVal.textContent = '92%';
   brQuality.style.setProperty('--pct', '91.1%');
   brQualitySection.style.display = 'none';
   document.querySelectorAll('#br-format-chips .format-chip').forEach(c =>
      c.classList.toggle('active', c.dataset.fmt === 'png'));
   brDlLabel.textContent = 'Save as PNG';
   showToast('restart_alt', 'Reset');
});