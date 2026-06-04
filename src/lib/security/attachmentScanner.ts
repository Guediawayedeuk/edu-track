// Client-side attachment validator: verifies real file type via magic bytes
// and blocks dangerous payloads (executables, scripts, EICAR) before upload.

export type ScanResult = { ok: true } | { ok: false; reason: string };

const EICAR = "X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*";

// Allowed MIME -> magic byte signatures (offset 0 unless noted)
const SIGNATURES: Record<string, Array<{ offset: number; bytes: number[] }>> = {
  "application/pdf": [{ offset: 0, bytes: [0x25, 0x50, 0x44, 0x46] }], // %PDF
  "image/png": [{ offset: 0, bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] }],
  "image/jpeg": [{ offset: 0, bytes: [0xff, 0xd8, 0xff] }],
  "image/jpg": [{ offset: 0, bytes: [0xff, 0xd8, 0xff] }],
  "image/gif": [
    { offset: 0, bytes: [0x47, 0x49, 0x46, 0x38, 0x37, 0x61] }, // GIF87a
    { offset: 0, bytes: [0x47, 0x49, 0x46, 0x38, 0x39, 0x61] }, // GIF89a
  ],
  "image/webp": [{ offset: 0, bytes: [0x52, 0x49, 0x46, 0x46] }], // RIFF (WEBP checked separately)
};

// Dangerous signatures that must never be uploaded, regardless of declared MIME
const FORBIDDEN: Array<{ name: string; offset: number; bytes: number[] }> = [
  { name: "Windows executable (MZ)", offset: 0, bytes: [0x4d, 0x5a] },
  { name: "Linux ELF binary", offset: 0, bytes: [0x7f, 0x45, 0x4c, 0x46] },
  { name: "Mach-O binary", offset: 0, bytes: [0xfe, 0xed, 0xfa, 0xce] },
  { name: "Mach-O binary", offset: 0, bytes: [0xfe, 0xed, 0xfa, 0xcf] },
  { name: "Mach-O binary", offset: 0, bytes: [0xcf, 0xfa, 0xed, 0xfe] },
  { name: "Java class file", offset: 0, bytes: [0xca, 0xfe, 0xba, 0xbe] },
  { name: "MSI installer", offset: 0, bytes: [0xd0, 0xcf, 0x11, 0xe0] },
  { name: "Script shebang (#!)", offset: 0, bytes: [0x23, 0x21] },
];

const FORBIDDEN_EXTENSIONS = [
  "exe", "dll", "scr", "bat", "cmd", "com", "msi", "ps1", "vbs", "vbe", "js", "jse",
  "jar", "sh", "bash", "zsh", "app", "apk", "ipa", "deb", "rpm", "hta", "lnk", "wsf",
  "html", "htm", "svg", "xhtml", "php", "phtml", "asp", "aspx", "jsp",
];

function matches(buf: Uint8Array, offset: number, bytes: number[]): boolean {
  if (buf.length < offset + bytes.length) return false;
  for (let i = 0; i < bytes.length; i++) if (buf[offset + i] !== bytes[i]) return false;
  return true;
}

function containsAscii(buf: Uint8Array, needle: string, maxScan = 4096): boolean {
  const end = Math.min(buf.length, maxScan);
  const chars: number[] = [];
  for (let i = 0; i < needle.length; i++) chars.push(needle.charCodeAt(i));
  outer: for (let i = 0; i <= end - chars.length; i++) {
    for (let j = 0; j < chars.length; j++) if (buf[i + j] !== chars[j]) continue outer;
    return true;
  }
  return false;
}

export async function scanFile(file: File, allowedMimes: string[]): Promise<ScanResult> {
  const ext = (file.name.split(".").pop() || "").toLowerCase();
  if (FORBIDDEN_EXTENSIONS.includes(ext)) {
    return { ok: false, reason: `Extension interdite : .${ext}` };
  }
  if (!allowedMimes.includes(file.type)) {
    return { ok: false, reason: `Type MIME non autorisé : ${file.type || "inconnu"}` };
  }

  const head = new Uint8Array(await file.slice(0, 8192).arrayBuffer());

  // EICAR antivirus test string — always block
  if (containsAscii(head, EICAR)) {
    return { ok: false, reason: "Fichier de test antivirus EICAR détecté" };
  }

  // Block known dangerous binary signatures
  for (const sig of FORBIDDEN) {
    if (matches(head, sig.offset, sig.bytes)) {
      return { ok: false, reason: `Contenu dangereux détecté : ${sig.name}` };
    }
  }

  // ZIP-based formats (PK\x03\x04) are not in our allowlist
  if (matches(head, 0, [0x50, 0x4b, 0x03, 0x04]) || matches(head, 0, [0x50, 0x4b, 0x05, 0x06])) {
    return { ok: false, reason: "Archives ZIP non autorisées" };
  }

  // Inline scripts in any non-text payload
  const lowerSample = new TextDecoder("utf-8", { fatal: false })
    .decode(head)
    .toLowerCase();
  if (/<script[\s>]/i.test(lowerSample) || /javascript:/i.test(lowerSample)) {
    return { ok: false, reason: "Code script intégré détecté" };
  }

  // Verify magic bytes match the declared MIME
  const sigs = SIGNATURES[file.type];
  if (!sigs) return { ok: false, reason: `Type non supporté : ${file.type}` };

  const headerOk = sigs.some((s) => matches(head, s.offset, s.bytes));
  if (!headerOk) {
    return { ok: false, reason: `Le contenu ne correspond pas au type déclaré (${file.type})` };
  }

  // Extra WEBP check: RIFF....WEBP
  if (file.type === "image/webp") {
    if (!matches(head, 8, [0x57, 0x45, 0x42, 0x50])) {
      return { ok: false, reason: "Fichier WEBP invalide" };
    }
  }

  return { ok: true };
}

export async function scanFiles(files: File[], allowedMimes: string[]): Promise<ScanResult> {
  for (const f of files) {
    const r = await scanFile(f, allowedMimes);
    if (!r.ok) return { ok: false, reason: `"${f.name}" — ${(r as { reason: string }).reason}` };
  }
  return { ok: true };
}
