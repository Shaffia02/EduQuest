import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useStore } from '../store.js'

const MATH_QUESTIONS = [
  {
    id: 1,
    topic: 'Mean (Rata-Rata) Paket Data',
    dataDisplay: '40, 50, 40, 60, 60 ( dalam byte )',
    prompt:
      'DETEKSI ANOMALI PAKET #01:\nLima paket data yang masuk memiliki ukuran 40, 50, 40, 60, dan 60 byte.\nHitung nilai RATA-RATA (MEAN) ukuran paket untuk menstabilkan buffer!',
    answer: 50,
    unit: 'byte',
    explanation: [
      'Rumus Mean = (Jumlah seluruh nilai data) ÷ (Banyaknya data)',
      'Jumlah nilai data = 40 + 50 + 40 + 60 + 60 = 250',
      'Banyaknya data (n) = 5 paket',
      'Mean = 250 ÷ 5 = 50 byte'
    ]
  },
  {
    id: 2,
    topic: 'Mean Latensi Ping Server',
    dataDisplay: '12, 18, 15, 21, 14 ( dalam ms )',
    prompt:
      'DETEKSI ANOMALI PAKET #02:\nWaktu respons (ping) dari 5 sub-server tercatat: 12, 18, 15, 21, dan 14 ms.\nMasukkan nilai RATA-RATA (MEAN) latensi ping tersebut!',
    answer: 16,
    unit: 'ms',
    explanation: [
      'Rumus Mean = (Jumlah seluruh data) ÷ (Banyaknya data)',
      'Jumlah data = 12 + 18 + 15 + 21 + 14 = 80',
      'Banyaknya data (n) = 5 server',
      'Mean = 80 ÷ 5 = 16 ms'
    ]
  },
  {
    id: 3,
    topic: 'Mean Trafik Bandwidth 6 Kanal',
    dataDisplay: '20, 35, 25, 40, 30, 30 ( dalam MB/s )',
    prompt:
      'DETEKSI ANOMALI PAKET #03:\nEnam kanal jaringan memiliki kecepatan trafik: 20, 35, 25, 40, 30, dan 30 MB/s.\nBerapakah RATA-RATA (MEAN) kecepatan trafik keenam kanal itu?',
    answer: 30,
    unit: 'MB/s',
    explanation: [
      'Rumus Mean = (Jumlah seluruh data) ÷ (Banyaknya data)',
      'Jumlah data = 20 + 35 + 25 + 40 + 30 + 30 = 180',
      'Banyaknya data (n) = 6 kanal',
      'Mean = 180 ÷ 6 = 30 MB/s'
    ]
  },
  {
    id: 4,
    topic: 'Mencari Nilai Data yang Hilang',
    dataDisplay: 'Log 1-4: [ 60%, 70%, 80%, 65% ] | Target Mean 5 Log = 70%',
    prompt:
      'DETEKSI ANOMALI PAKET #04:\nEmpat log pertama beban CPU tercatat: 60, 70, 80, dan 65.\nJika RATA-RATA (MEAN) dari 5 log harus tepat 70, berapakah nilai log ke-5?',
    answer: 75,
    unit: '%',
    explanation: [
      'Total nilai 5 data = Mean × Banyak data = 70 × 5 = 350',
      'Jumlah 4 data pertama = 60 + 70 + 80 + 65 = 275',
      'Nilai data ke-5 = Total 5 data - Jumlah 4 data = 350 - 275 = 75%'
    ]
  },
  {
    id: 5,
    topic: 'Mean Data Berfrekuensi',
    dataDisplay: '10 MB (3 paket) | 20 MB (2 paket) | 30 MB (5 paket)',
    prompt:
      'DETEKSI ANOMALI PAKET #05:\nDalam antrean terdapat: 3 paket berukuran 10 MB, 2 paket berukuran 20 MB, dan 5 paket berukuran 30 MB.\nBerapakah RATA-RATA (MEAN) ukuran dari seluruh 10 paket tersebut?',
    answer: 22,
    unit: 'MB',
    explanation: [
      'Rumus Mean Berfrekuensi = Σ(nilai × frekuensi) ÷ Σ(frekuensi)',
      'Total ukuran = (10 × 3) + (20 × 2) + (30 × 5) = 30 + 40 + 150 = 220',
      'Total banyak paket = 3 + 2 + 5 = 10 paket',
      'Mean = 220 ÷ 10 = 22 MB'
    ]
  },
  {
    id: 6,
    topic: 'Median (Nilai Tengah) Data Ganjil',
    dataDisplay: '18, 12, 25, 10, 30, 15, 22 ( jumlah koneksi )',
    prompt:
      'DETEKSI ANOMALI PAKET #06:\nJumlah koneksi aktif pada 7 node adalah: 18, 12, 25, 10, 30, 15, dan 22.\nTentukan nilai MEDIAN (nilai tengah setelah data diurutkan)!',
    answer: 18,
    unit: 'koneksi',
    explanation: [
      'Langkah 1: Urutkan data dari terkecil ke terbesar:',
      '10, 12, 15, [ 18 ], 22, 25, 30',
      'Langkah 2: Karena jumlah data ganjil (n = 7), posisi tengah ada di data ke-(7+1)/2 = data ke-4.',
      'Data ke-4 pada urutan tersebut adalah 18'
    ]
  },
  {
    id: 7,
    topic: 'Median (Nilai Tengah) Data Genap',
    dataDisplay: '14, 22, 18, 10, 26, 30 ( dalam Gbps )',
    prompt:
      'DETEKSI ANOMALI PAKET #07:\nKecepatan enkripsi pada 6 kluster tercatat: 14, 22, 18, 10, 26, dan 30 Gbps.\nBerapakah nilai MEDIAN dari data kecepatan tersebut?',
    answer: 20,
    unit: 'Gbps',
    explanation: [
      'Langkah 1: Urutkan data dari terkecil ke terbesar:',
      '10, 14, [ 18, 22 ], 26, 30',
      'Langkah 2: Karena jumlah data genap (n = 6), ambil rata-rata dari 2 data paling tengah (data ke-3 dan ke-4):',
      'Median = (18 + 22) ÷ 2 = 40 ÷ 2 = 20 Gbps'
    ]
  },
  {
    id: 8,
    topic: 'Modus (Data Paling Sering Muncul)',
    dataDisplay: '443, 80, 22, 443, 8080, 80, 443, 21, 443',
    prompt:
      'DETEKSI ANOMALI PAKET #08:\nSembilan aktivitas firewall terakhir mengakses nomor port: 443, 80, 22, 443, 8080, 80, 443, 21, dan 443.\nMasukkan nilai MODUS dari nomor port yang diakses!',
    answer: 443,
    unit: 'port',
    explanation: [
      'Modus adalah nilai data yang paling sering muncul (frekuensi tertinggi):',
      '• Port 443 muncul sebanyak 4 kali',
      '• Port 80 muncul sebanyak 2 kali',
      '• Port 22, 8080, dan 21 masing-masing muncul 1 kali',
      'Maka nilai Modus adalah 443'
    ]
  },
  {
    id: 9,
    topic: 'Jangkauan (Range) Suhu Server',
    dataDisplay: '54°C, 72°C, 61°C, 48°C, 83°C, 65°C',
    prompt:
      'DETEKSI ANOMALI PAKET #09:\nSensor termal 6 prosesor mencatat suhu: 54, 72, 61, 48, 83, dan 65 derajat Celcius.\nHitung nilai JANGKAUAN (RANGE) dari data suhu tersebut!',
    answer: 35,
    unit: '°C',
    explanation: [
      'Rumus Jangkauan (Range) = Nilai Maksimum (Tertinggi) - Nilai Minimum (Terendah)',
      'Nilai Maksimum pada data = 83',
      'Nilai Minimum pada data = 48',
      'Jangkauan = 83 - 48 = 35 °C'
    ]
  },
  {
    id: 10,
    topic: 'Rata-Rata Gabungan (Combined Mean)',
    dataDisplay: 'Kluster A: 4 server (Mean = 50%) | Kluster B: 6 server (Mean = 60%)',
    prompt:
      'DETEKSI ANOMALI PAKET #10 (FINAL):\nKluster A terdiri dari 4 server dengan rata-rata beban 50%.\nKluster B terdiri dari 6 server dengan rata-rata beban 60%.\nBerapakah RATA-RATA GABUNGAN dari seluruh 10 server tersebut?',
    answer: 56,
    unit: '%',
    explanation: [
      'Rumus Mean Gabungan = ((nA × Mean A) + (nB × Mean B)) ÷ (nA + nB)',
      'Total beban Kluster A = 4 × 50 = 200',
      'Total beban Kluster B = 6 × 60 = 360',
      'Total beban seluruhnya = 200 + 360 = 560 untuk 10 server',
      'Mean Gabungan = 560 ÷ 10 = 56%'
    ]
  }
]

const ENGLISH_QUESTIONS = [
  {
    id: 1,
    topic: 'Identifying Argument Against (AI Security)',
    context: 'Topic: Implementing Autonomous AI in Cybersecurity',
    prompt:
      'LOG #01: INTERCEPTED AI PROTOCOL DEBATE\nWhich of the following statements represents an ARGUMENT AGAINST (kontra) relying solely on AI in cybersecurity?',
    options: {
      A: 'AI systems can scan millions of network packets in milliseconds.',
      B: 'Relying solely on AI creates blind spots in complex human-led forensic analysis.',
      C: 'Automated threat detection significantly lowers operational server costs.',
      D: 'Machine learning models help security teams respond faster to zero-day attacks.'
    },
    answer: 'B',
    explanation: [
      'Dalam Discussion Text, "Argument Against" (argumen kontra) berisi risiko, kelemahan, atau dampak negatif dari suatu kebijakan.',
      'Opsi A, C, dan D semuanya menyebutkan kelebihan/manfaat AI (Argument For / Pro).',
      'Opsi B menunjukkan risiko/kelemahan ("creates blind spots" / menciptakan titik buta analisis), sehingga B adalah Argument Against yang tepat.'
    ]
  },
  {
    id: 2,
    topic: 'Identifying Argument For (Remote Learning)',
    context: 'Topic: Cloud-Based Virtual Classrooms in High Schools',
    prompt:
      'LOG #02: EDUCATION NETWORK ARCHIVE\nWhich statement functions as an ARGUMENT FOR (pro/mendukung) cloud-based virtual classrooms?',
    options: {
      A: 'Students from remote areas can access high-quality learning materials anytime.',
      B: 'Prolonged screen time often causes eye strain and digital fatigue among teenagers.',
      C: 'Unstable internet connections prevent many students from joining live sessions.',
      D: 'Virtual classrooms reduce direct social interaction between peers.'
    },
    answer: 'A',
    explanation: [
      '"Argument For" (Pro) adalah argumen yang mendukung topik dengan menyebutkan manfaat atau dampak positif.',
      'Opsi B, C, dan D menyebutkan dampak negatif (kelelahan mata, kendala sinyal, kurangnya interaksi sosial).',
      'Opsi A menyebutkan manfaat positif (akses materi berkualitas kapan saja dari mana saja).'
    ]
  },
  {
    id: 3,
    topic: 'Generic Structure of Discussion Text',
    context: 'Text Structure Analysis // Paragraph #1',
    prompt:
      'LOG #03: STRUCTURAL DECRYPTION\n"Nowadays, facial recognition cameras are widely installed in public spaces. While supporters claim it enhances public safety, critics argue it violates citizen privacy."\nIn a Discussion Text, what is this opening part called?',
    options: {
      A: 'Conclusion / Recommendation',
      B: 'Arguments Against',
      C: 'Issue (Statement of Issue & Preview)',
      D: 'Reorientation'
    },
    answer: 'C',
    explanation: [
      'Struktur Discussion Text terdiri dari: 1) Issue, 2) Arguments For, 3) Arguments Against, 4) Conclusion/Recommendation.',
      'Paragraf pembuka yang memperkenalkan topik perdebatan serta gambaran dua sudut pandang (pro & kontra) disebut "Issue".'
    ]
  },
  {
    id: 4,
    topic: 'Connectives of Contrast (Conjunctions)',
    context: 'Grammar & Cohesion Check',
    prompt:
      'LOG #04: SYNTAX COMPLETION\n"Nuclear energy produces massive electricity with zero carbon emissions. __________, the problem of radioactive waste disposal remains a serious environmental threat."\nChoose the best contrastive connector to complete the sentence!',
    options: {
      A: 'Furthermore',
      B: 'On the other hand',
      C: 'Consequently',
      D: 'In addition'
    },
    answer: 'B',
    explanation: [
      'Kalimat pertama berisi sisi positif (zero carbon emissions), sedangkan kalimat kedua berisi sisi negatif (radioactive waste threat).',
      'Untuk mempertentangkan dua argumen berlawanan dalam Discussion Text, gunakan kata hubung kontras seperti "On the other hand" (Di sisi lain) atau "However".',
      '"Furthermore" dan "In addition" digunakan untuk menambah argumen searah, sedangkan "Consequently" menyatakan akibat.'
    ]
  },
  {
    id: 5,
    topic: 'Identifying Argument Against (Cashless Society)',
    context: 'Topic: Transitioning to a 100% Cashless Digital Economy',
    prompt:
      'LOG #05: FINANCIAL PROTOCOL DEBATE\nIdentify the statement that expresses an ARGUMENT AGAINST a completely cashless society!',
    options: {
      A: 'Digital transactions are recorded automatically, reducing tax evasion.',
      B: 'Consumers no longer need to carry bulky physical wallets.',
      C: 'Cyber outages or hacking attacks could instantly freeze citizens’ access to their own money.',
      D: 'Contactless payments speed up queues at public transportation gates.'
    },
    answer: 'C',
    explanation: [
      'Kita mencari "Argument Against" (kelemahan/ancaman dari masyarakat tanpa uang tunai).',
      'Opsi C menjelaskan bahaya nyata jika sistem siber mati atau diretas (warga tidak bisa mengakses uangnya).',
      'Opsi A, B, dan D adalah keuntungan pembayaran digital (Arguments For).'
    ]
  },
  {
    id: 6,
    topic: 'Identifying Conclusion / Recommendation',
    context: 'Text Structure Analysis // Final Paragraph',
    prompt:
      'LOG #06: FINAL PARAGRAPH CLASSIFICATION\n"In conclusion, social media algorithms can boost educational content, but they also amplify misinformation. Therefore, users should verify sources critically before sharing information."\nWhich part of a Discussion Text does this passage represent?',
    options: {
      A: 'Issue',
      B: 'Supporting Points',
      C: 'Contrasting Points',
      D: 'Conclusion / Recommendation'
    },
    answer: 'D',
    explanation: [
      'Paragraf tersebut diawali dengan penanda "In conclusion..." yang merangkum kedua sisi (pro dan kontra) lalu diikuti saran ("Therefore, users should...").',
      'Bagian penutup dalam Discussion Text yang merangkum argumen dan memberikan jalan tengah/saran disebut "Conclusion / Recommendation".'
    ]
  },
  {
    id: 7,
    topic: 'Communicative Purpose of Discussion Text',
    context: 'Discourse Analysis Protocol',
    prompt:
      'LOG #07: PURPOSE IDENTIFICATION\nWhat is the main communicative purpose (social function) of a Discussion Text?',
    options: {
      A: 'To present at least two different points of view (pros and cons) about a controversial issue.',
      B: 'To retell past events in chronological order to entertain the readers.',
      C: 'To describe a specific person, place, or server facility in detail.',
      D: 'To explain step-by-step instructions on how to configure a firewall.'
    },
    answer: 'A',
    explanation: [
      'Tujuan komunikatif (social function) dari Discussion Text adalah menyajikan minimal dua sudut pandang berbeda (pro dan kontra) mengenai suatu isu agar pembaca mendapatkan perspektif yang seimbang.',
      'Opsi B adalah Recount/Narrative, Opsi C adalah Descriptive, dan Opsi D adalah Procedure Text.'
    ]
  },
  {
    id: 8,
    topic: 'Language Features: Modal & Thinking Verbs',
    context: 'Lexical & Grammatical Analysis',
    prompt:
      'LOG #08: LANGUAGE FEATURE SCAN\n"Critics ________ that biometric databases ________ be exploited by unauthorized third parties if encryption fails."\nWhich pair of words best fits the academic style of a Discussion Text?',
    options: {
      A: 'argued — yesterday',
      B: 'argue — might',
      C: 'command — must not to',
      D: 'laughing — will'
    },
    answer: 'B',
    explanation: [
      'Discussion Text menggunakan Simple Present Tense dengan "thinking/saying verbs" (seperti argue, believe, claim) dan "modal verbs" untuk menyatakan kemungkinan (can, may, might, could, should).',
      'Pasangan "argue — might" ("Critics argue that biometric databases might be exploited...") sangat tepat secara tata bahasa dan konteks akademik.'
    ]
  },
  {
    id: 9,
    topic: 'Evaluating Balanced Perspective (Electric Vehicles)',
    context: 'Topic: Mandatory Electric Vehicles (EVs) in Big Cities',
    prompt:
      'LOG #09: COUNTER-CLAIM DETECTION\nSupporters state that Electric Vehicles (EVs) eliminate tailpipe air pollution in cities.\nWhich sentence is the most relevant COUNTER-ARGUMENT (bantahan/kontra) to that claim?',
    options: {
      A: 'Electric cars have quieter motors compared to gasoline vehicles.',
      B: 'Many governments offer tax incentives for citizens buying electric cars.',
      C: 'However, mining lithium for EV batteries causes severe soil and water contamination.',
      D: 'Furthermore, electric vehicles can be charged at home overnight.'
    },
    answer: 'C',
    explanation: [
      'Klaim pendukung fokus pada dampak lingkungan yang bersih (mengurangi polusi udara).',
      'Bantahan (counter-argument) yang paling relevan dan kontras adalah Opsi C: diawali kata "However" (Namun) dan menunjukkan bahwa penambangan baterai litium tetap mencemari tanah dan air.'
    ]
  },
  {
    id: 10,
    topic: 'Synthesizing a Recommendation (Open-Source Software)',
    context: 'Topic: Using Open-Source Software in Government Servers',
    prompt:
      'LOG #10 (FINAL): POLICY RECOMMENDATION\nPros: Open-source software is free and transparent.\nCons: Without dedicated experts, misconfigured open-source servers are vulnerable to exploits.\nBased on both sides, which is the most balanced RECOMMENDATION?',
    options: {
      A: 'Governments should ban all computers and return to paper archives immediately.',
      B: 'Governments should adopt open-source software while investing in certified security training for IT staff.',
      C: 'Software security does not matter as long as the license is completely free.',
      D: 'Only private companies should be allowed to use the internet.'
    },
    answer: 'B',
    explanation: [
      'Rekomendasi (Recommendation) yang baik dalam Discussion Text menggabungkan solusi atas kedua sudut pandang (mengambil manfaat Pro sekaligus mengatasi risiko Kontra).',
      'Opsi B menyarankan adopsi open-source (mengambil manfaat hemat & transparan) sambil membekali staf IT dengan pelatihan keamanan (mengatasi risiko celah konfigurasi).'
    ]
  }
]

const QUEST_CONFIG = {
  dataNode: {
    script: 'root@eduquest:~# analisis_data.sh',
    label: 'DATA NODE // STATISTIKA MATEMATIKA (10 SOAL)'
  },
  commsNode: {
    script: 'root@eduquest:~# discussion_text.sh',
    label: 'COMMS NODE // BAHASA INGGRIS (10 SOAL ABCD)'
  }
}

let audioCtx = null

function playBeep(type) {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (!AudioContextClass) return
    if (!audioCtx) {
      audioCtx = new AudioContextClass()
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume()
    }
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    const now = audioCtx.currentTime

    if (type === 'open') {
      osc.type = 'sine'
      osc.frequency.setValueAtTime(520, now)
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.09)
      gain.gain.setValueAtTime(0.08, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1)
      osc.connect(gain)
      gain.connect(audioCtx.destination)
      osc.start(now)
      osc.stop(now + 0.1)
    } else if (type === 'success') {
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(587.33, now)
      osc.frequency.setValueAtTime(880, now + 0.08)
      osc.frequency.setValueAtTime(1174.66, now + 0.16)
      gain.gain.setValueAtTime(0.12, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32)
      osc.connect(gain)
      gain.connect(audioCtx.destination)
      osc.start(now)
      osc.stop(now + 0.32)
    } else if (type === 'fail') {
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(180, now)
      osc.frequency.linearRampToValueAtTime(110, now + 0.22)
      gain.gain.setValueAtTime(0.11, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24)
      osc.connect(gain)
      gain.connect(audioCtx.destination)
      osc.start(now)
      osc.stop(now + 0.24)
    }
  } catch {
    // Ignore WebAudio blocks
  }
}

export default function HUD() {
  const quests = useStore((s) => s.quests)
  const mathStage = useStore((s) => s.mathStage)
  const mathTotal = useStore((s) => s.mathTotal)
  const advanceMathStage = useStore((s) => s.advanceMathStage)
  const engStage = useStore((s) => s.engStage)
  const engTotal = useStore((s) => s.engTotal)
  const advanceEngStage = useStore((s) => s.advanceEngStage)
  const activeTerminal = useStore((s) => s.activeTerminal)
  const systemStatus = useStore((s) => s.systemStatus)
  const nearTerminal = useStore((s) => s.nearTerminal)
  const attempts = useStore((s) => s.attempts)
  const showFlash = useStore((s) => s.showFlash)
  const closeTerminal = useStore((s) => s.closeTerminal)
  const completeQuest = useStore((s) => s.completeQuest)
  const registerAttempt = useStore((s) => s.registerAttempt)
  const resetGame = useStore((s) => s.resetGame)

  const [booted, setBooted] = useState(false)
  const [typedText, setTypedText] = useState('')
  const [typingDone, setTypingDone] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [selectedChoice, setSelectedChoice] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [shakeKey, setShakeKey] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const inputRef = useRef(null)
  const completeTimeoutRef = useRef(null)

  const completedCount = (quests.dataNode ? 1 : 0) + (quests.commsNode ? 1 : 0)
  const currentMathObj = MATH_QUESTIONS[mathStage] || MATH_QUESTIONS[0]
  const currentEngObj = ENGLISH_QUESTIONS[engStage] || ENGLISH_QUESTIONS[0]

  // Reset modal state and start typewriter animation when terminal or stage changes
  useEffect(() => {
    if (completeTimeoutRef.current) {
      clearTimeout(completeTimeoutRef.current)
      completeTimeoutRef.current = null
    }

    if (!activeTerminal) {
      setTypedText('')
      setTypingDone(false)
      setInputValue('')
      setSelectedChoice(null)
      setFeedback(null)
      setIsSubmitting(false)
      return
    }

    playBeep('open')
    const fullText =
      activeTerminal === 'dataNode'
        ? currentMathObj.prompt
        : currentEngObj.prompt

    setTypedText('')
    setTypingDone(false)
    setInputValue('')
    setSelectedChoice(null)
    setFeedback(null)
    setIsSubmitting(false)

    let index = 0
    const intervalId = setInterval(() => {
      index += 1
      setTypedText(fullText.slice(0, index))
      if (index >= fullText.length) {
        clearInterval(intervalId)
        setTypingDone(true)
      }
    }, 15)

    return () => {
      clearInterval(intervalId)
      if (completeTimeoutRef.current) {
        clearTimeout(completeTimeoutRef.current)
        completeTimeoutRef.current = null
      }
    }
  }, [activeTerminal, mathStage, engStage, currentMathObj.prompt, currentEngObj.prompt])

  // Focus text input after typewriter finishes
  useEffect(() => {
    if (activeTerminal === 'dataNode' && typingDone && inputRef.current) {
      inputRef.current.focus()
    }
  }, [activeTerminal, typingDone, mathStage])

  // Escape key closes active terminal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && activeTerminal !== null) {
        e.stopPropagation()
        closeTerminal()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeTerminal, closeTerminal])

  const stopKeyPropagation = useCallback(
    (e) => {
      e.stopPropagation()
      if (e.key === 'Escape') {
        closeTerminal()
      }
    },
    [closeTerminal]
  )

  const handleDataSubmit = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (isSubmitting || activeTerminal !== 'dataNode') return

    const trimmed = inputValue.trim().replace(',', '.')
    if (trimmed === '') return
    const parsed = Number(trimmed)

    if (!Number.isNaN(parsed) && parsed === currentMathObj.answer) {
      setIsSubmitting(true)
      playBeep('success')

      const isFinalQuestion = mathStage + 1 >= mathTotal
      setFeedback({
        type: 'success',
        message: isFinalQuestion
          ? 'SELURUH 10 PAKET DATA STABIL! NODE MATEMATIKA PULIH 100%.'
          : `TEPAT! Jawaban (${currentMathObj.answer} ${currentMathObj.unit}) terverifikasi. Memuat soal berikutnya...`
      })

      completeTimeoutRef.current = setTimeout(() => {
        const finishedAll = advanceMathStage()
        if (finishedAll) {
          completeQuest('dataNode')
        }
      }, 1100)
    } else {
      playBeep('fail')
      registerAttempt('dataNode')
      setShakeKey((k) => k + 1)
      setFeedback({
        type: 'error',
        userAnswer: inputValue.trim(),
        message: `AKSES DITOLAK: Nilai "${inputValue.trim()}" belum tepat.`,
        explanation: currentMathObj.explanation,
        correctAnswer: `${currentMathObj.answer} ${currentMathObj.unit}`
      })
    }
  }

  const handleCommsChoice = (choiceKey) => {
    if (isSubmitting || activeTerminal !== 'commsNode') return
    setSelectedChoice(choiceKey)

    if (choiceKey === currentEngObj.answer) {
      setIsSubmitting(true)
      playBeep('success')

      const isFinalQuestion = engStage + 1 >= engTotal
      setFeedback({
        type: 'success',
        message: isFinalQuestion
          ? 'SELURUH 10 LOG KOMUNIKASI TERDEKRIPSI! COMMS NODE PULIH 100%.'
          : `TEPAT! Opsi [${choiceKey}] benar. Memuat log komunikasi berikutnya...`
      })

      completeTimeoutRef.current = setTimeout(() => {
        const finishedAll = advanceEngStage()
        if (finishedAll) {
          completeQuest('commsNode')
        }
      }, 1100)
    } else {
      playBeep('fail')
      registerAttempt('commsNode')
      setShakeKey((k) => k + 1)
      setFeedback({
        type: 'error',
        message: `ACCESS DENIED: Pilihan [${choiceKey}] kurang tepat.`,
        explanation: currentEngObj.explanation,
        correctAnswer: `Opsi [${currentEngObj.answer}]`
      })
    }
  }

  const handleBoot = () => {
    playBeep('open')
    setBooted(true)
  }

  const currentAttempts = activeTerminal ? attempts[activeTerminal] || 0 : 0

  return (
    <div className="fixed inset-0 pointer-events-none z-20 font-mono select-none">
      {/* Subtle CRT Scanlines */}
      <div className="absolute inset-0 crt-scanlines pointer-events-none opacity-40" />

      {/* Full-screen SECURED flash */}
      {showFlash && (
        <div className="absolute inset-0 animate-securedFlash pointer-events-none z-40" />
      )}

      {/* Top-Left Dashboard */}
      <div className="absolute top-4 left-4 bg-[#0b0f14]/90 border-2 border-[#00e5ff]/50 p-4 rounded-xl shadow-[0_0_25px_rgba(0,229,255,0.2)] w-80 pointer-events-auto backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-[#00e5ff]/25 pb-2 mb-2.5">
          <span className="text-[11px] tracking-widest text-[#00e5ff] font-bold">
            EDUQUEST XII // ROBLOX WORLD
          </span>
          <span className="text-[10px] px-2 py-0.5 bg-[#00ff41]/15 text-[#00ff41] border border-[#00ff41]/40 rounded-full font-bold">
            KELAS XII
          </span>
        </div>

        <div className="text-xs font-bold flex items-center justify-between mb-3">
          <span className="text-gray-300">STATUS KOTA:</span>
          {systemStatus === 'COMPROMISED' ? (
            <span className="text-[#ff2a2a] glow-red flex items-center">
              [COMPROMISED]
              <span className="ml-1 animate-pulse">█</span>
            </span>
          ) : (
            <span className="text-[#00ff41] glow-green flex items-center">
              [SECURED]
              <span className="ml-1 animate-pulse">█</span>
            </span>
          )}
        </div>

        {/* Overall Progress Bar */}
        <div className="mb-3">
          <div className="flex justify-between text-[11px] text-[#00e5ff] mb-1">
            <span>MISI DUNIA SIBER</span>
            <span>{completedCount} / 2 STASIUN</span>
          </div>
          <div className="w-full h-2.5 bg-[#11161d] border border-[#00e5ff]/35 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#00e5ff] to-[#00ff41] transition-all duration-500"
              style={{ width: `${(completedCount / 2) * 100}%` }}
            />
          </div>
        </div>

        {/* Checklist for both 10-question nodes */}
        <div className="space-y-2 text-xs">
          {/* Math Node */}
          <div className="p-2.5 rounded-lg bg-[#05070a]/85 border border-[#00e5ff]/25">
            <div
              className={
                quests.dataNode
                  ? 'text-[#00ff41] glow-green font-bold'
                  : 'text-gray-100 font-semibold'
              }
            >
              [{quests.dataNode ? '✓' : ' '}] Matematika: Statistika
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#00e5ff] mt-1">
              <span>Progres Soal:</span>
              <span className="font-bold">
                {quests.dataNode ? mathTotal : mathStage} / {mathTotal} Soal
              </span>
            </div>
            <div className="w-full h-1.5 bg-[#11161d] mt-1 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#00ff41] transition-all duration-300"
                style={{
                  width: `${
                    ((quests.dataNode ? mathTotal : mathStage) / mathTotal) *
                    100
                  }%`
                }}
              />
            </div>
          </div>

          {/* English Node */}
          <div className="p-2.5 rounded-lg bg-[#05070a]/85 border border-[#00e5ff]/25">
            <div
              className={
                quests.commsNode
                  ? 'text-[#00ff41] glow-green font-bold'
                  : 'text-gray-100 font-semibold'
              }
            >
              [{quests.commsNode ? '✓' : ' '}] B. Inggris: Discussion Text
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#00e5ff] mt-1">
              <span>Progres Soal (ABCD):</span>
              <span className="font-bold">
                {quests.commsNode ? engTotal : engStage} / {engTotal} Soal
              </span>
            </div>
            <div className="w-full h-1.5 bg-[#11161d] mt-1 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#00e5ff] transition-all duration-300"
                style={{
                  width: `${
                    ((quests.commsNode ? engTotal : engStage) / engTotal) * 100
                  }%`
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Top-Right Mini Map Guide */}
      <div className="absolute top-4 right-4 bg-[#0b0f14]/90 border-2 border-[#00e5ff]/40 px-4 py-3 rounded-xl text-xs space-y-1.5 hidden sm:block backdrop-blur-md">
        <div className="text-[11px] text-[#00e5ff] font-bold tracking-wider border-b border-[#00e5ff]/20 pb-1">
          PETA KOTA EDUQUEST
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              quests.dataNode ? 'bg-[#00ff41]' : 'bg-[#ff2a2a] animate-ping'
            }`}
          />
          <span className="text-gray-300">Paviliun Barat (Kiri):</span>
          <span className="text-[#00ff41] font-bold">MATEMATIKA (10 Soal)</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              quests.commsNode ? 'bg-[#00ff41]' : 'bg-[#ff2a2a] animate-ping'
            }`}
          />
          <span className="text-gray-300">Paviliun Timur (Kanan):</span>
          <span className="text-[#00e5ff] font-bold">B. INGGRIS (10 ABCD)</span>
        </div>
        <div className="text-[11px] text-yellow-300 pt-0.5">
          ★ Area Tengah: Taman Kota &amp; Obby Parkour
        </div>
      </div>

      {/* Center Interaction Banner when near an unsolved terminal */}
      {nearTerminal && !activeTerminal && !quests[nearTerminal] && (
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0b0f14]/95 border-2 border-[#00ff41] px-6 py-3 rounded-xl shadow-[0_0_30px_rgba(0,255,65,0.45)]">
          <div className="text-xs text-[#00e5ff] text-center tracking-widest font-bold">
            {QUEST_CONFIG[nearTerminal]?.label}
          </div>
          <div className="text-sm font-bold text-[#00ff41] glow-green text-center mt-1 animate-pulse">
            [ TEKAN TOMBOL F UNTUK MEMBUKA SOAL ]
          </div>
        </div>
      )}

      {/* Persistent Banner when System is SECURED */}
      {systemStatus === 'SECURED' && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-[#0b0f14]/95 border-2 border-[#00ff41] px-8 py-5 rounded-xl text-center shadow-[0_0_45px_rgba(0,255,65,0.6)] pointer-events-auto z-30">
          <div className="text-xs text-[#00e5ff] tracking-widest mb-1">
            SELURUH 20 SOAL (MATEMATIKA &amp; BAHASA INGGRIS) SELESAI!
          </div>
          <div className="text-xl font-bold text-[#00ff41] glow-green tracking-wider mb-4">
            SYSTEM SECURED. ROOT ACCESS GRANTED!
          </div>
          <button
            type="button"
            onClick={() => {
              playBeep('open')
              resetGame()
            }}
            onKeyDown={stopKeyPropagation}
            onKeyUp={stopKeyPropagation}
            className="px-6 py-2 bg-[#00ff41]/20 hover:bg-[#00ff41]/35 border-2 border-[#00ff41] text-[#00ff41] text-xs font-bold tracking-widest rounded-lg transition cursor-pointer"
          >
            [ MAIN LAGI DARI AWAL ]
          </button>
        </div>
      )}

      {/* Bottom-Left Controls Hint */}
      <div className="absolute bottom-4 left-4 bg-[#0b0f14]/90 border border-[#00e5ff]/40 px-4 py-2 rounded-lg text-xs text-gray-200">
        <span className="text-[#00e5ff] font-bold">KONTROL ROBLOX:</span> WASD Jalan | SHIFT Lari Cepat | SPACE Lompat | Q/E atau Drag Mouse: Putar Kamera | F: Buka Terminal
      </div>

      {/* Terminal Hacking Modal */}
      {activeTerminal && (
        <div
          className="absolute inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 pointer-events-auto z-30"
          onKeyDown={stopKeyPropagation}
          onKeyUp={stopKeyPropagation}
        >
          <div
            key={shakeKey}
            className={`w-full max-w-2xl bg-[#05070a] border-2 border-[#00ff41] rounded-xl shadow-[0_0_50px_rgba(0,255,65,0.35)] overflow-hidden max-h-[92vh] flex flex-col ${
              shakeKey > 0 && feedback?.type === 'error' ? 'animate-shake' : ''
            }`}
          >
            {/* Title Bar */}
            <div className="bg-[#11161d] border-b border-[#00ff41]/40 px-4 py-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#ff2a2a] inline-block" />
                <span className="w-3 h-3 rounded-full bg-yellow-400 inline-block" />
                <span className="w-3 h-3 rounded-full bg-[#00ff41] inline-block" />
                <span className="ml-2 text-xs text-[#00e5ff] font-bold tracking-wider">
                  {QUEST_CONFIG[activeTerminal]?.script}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs bg-[#00ff41]/15 border border-[#00ff41]/50 text-[#00ff41] px-2.5 py-0.5 rounded-full font-bold">
                  SOAL{' '}
                  {activeTerminal === 'dataNode'
                    ? `${mathStage + 1} / ${mathTotal}`
                    : `${engStage + 1} / ${engTotal}`}
                </span>
                <button
                  type="button"
                  onClick={closeTerminal}
                  onKeyDown={stopKeyPropagation}
                  onKeyUp={stopKeyPropagation}
                  className="text-xs text-[#ff2a2a] hover:bg-[#ff2a2a]/20 border border-[#ff2a2a]/60 px-2.5 py-0.5 rounded cursor-pointer transition"
                >
                  [X] TUTUP
                </button>
              </div>
            </div>

            {/* Terminal Body */}
            <div className="p-6 space-y-4 text-sm overflow-y-auto">
              {/* Subheader & 10-Step Progress Bar for BOTH Math and English */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#00e5ff] font-bold tracking-wide">
                    TOPIK:{' '}
                    {activeTerminal === 'dataNode'
                      ? currentMathObj.topic.toUpperCase()
                      : currentEngObj.topic.toUpperCase()}
                  </span>
                  <span className="text-gray-400">
                    Tahap{' '}
                    {activeTerminal === 'dataNode'
                      ? `${mathStage + 1} dari ${mathTotal}`
                      : `${engStage + 1} dari ${engTotal}`}
                  </span>
                </div>

                {/* 10-step segmented bar */}
                <div className="grid grid-cols-10 gap-1">
                  {Array.from({ length: 10 }).map((_, idx) => {
                    const currentIdx =
                      activeTerminal === 'dataNode' ? mathStage : engStage
                    return (
                      <div
                        key={idx}
                        className={`h-2 rounded-sm transition-all ${
                          idx < currentIdx
                            ? 'bg-[#00ff41] shadow-[0_0_8px_#00ff41]'
                            : idx === currentIdx
                            ? 'bg-[#00e5ff] animate-pulse'
                            : 'bg-[#11161d] border border-gray-700'
                        }`}
                      />
                    )
                  })}
                </div>

                {/* Context / Data Box */}
                <div className="bg-[#0b0f14] border border-[#00e5ff]/40 px-4 py-2.5 rounded-lg flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    {activeTerminal === 'dataNode' ? 'DATA STREAM:' : 'CONTEXT:'}
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-[#00e5ff] glow-cyan tracking-wide">
                    {activeTerminal === 'dataNode'
                      ? `[ ${currentMathObj.dataDisplay} ]`
                      : currentEngObj.context}
                  </span>
                </div>
              </div>

              {/* Typewriter Quest Output */}
              <div className="bg-[#0b0f14]/80 border-l-4 border-[#00ff41] p-4 rounded-r-lg whitespace-pre-line text-[#00ff41] glow-green leading-relaxed min-h-[76px] text-sm">
                {typedText}
                {!typingDone && <span className="animate-pulse ml-0.5">█</span>}
              </div>

              {/* Terminal 1: Data Node (10 Soal Matematika Bahasa Indonesia) */}
              {activeTerminal === 'dataNode' && (
                <form onSubmit={handleDataSubmit} className="space-y-3 pt-1">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[#00ff41] font-bold text-xs sm:text-sm shrink-0">
                      jawaban@{mathStage + 1}:~#
                    </span>
                    <div className="relative flex-1">
                      <input
                        ref={inputRef}
                        type="text"
                        inputMode="numeric"
                        autoFocus
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={stopKeyPropagation}
                        onKeyUp={stopKeyPropagation}
                        disabled={isSubmitting}
                        placeholder={`Ketik angka jawaban (${currentMathObj.unit})...`}
                        className="w-full bg-[#0b0f14] border-2 border-[#00ff41]/70 focus:border-[#00e5ff] px-3.5 py-2 text-[#00ff41] placeholder-green-800 rounded-lg focus:outline-none font-bold"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#00e5ff]/70">
                        {currentMathObj.unit}
                      </span>
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      onKeyDown={stopKeyPropagation}
                      onKeyUp={stopKeyPropagation}
                      className="px-5 py-2 bg-[#00ff41]/20 hover:bg-[#00ff41]/35 border-2 border-[#00ff41] text-[#00ff41] font-bold tracking-wider rounded-lg transition cursor-pointer shrink-0"
                    >
                      [KIRIM]
                    </button>
                  </div>
                </form>
              )}

              {/* Terminal 2: Comms Node (10 Soal Bahasa Inggris Pilihan Ganda A, B, C, D) */}
              {activeTerminal === 'commsNode' && (
                <div className="grid grid-cols-1 gap-2.5 pt-1">
                  {['A', 'B', 'C', 'D'].map((letter) => {
                    const optionText = currentEngObj.options[letter]
                    const isPicked = selectedChoice === letter
                    const isRightOption =
                      feedback && letter === currentEngObj.answer
                    let btnStyle =
                      'bg-[#0b0f14] hover:bg-[#00e5ff]/15 border-[#00e5ff]/45 hover:border-[#00e5ff] text-gray-200'

                    if (feedback?.type === 'success' && isPicked) {
                      btnStyle =
                        'bg-[#00ff41]/20 border-[#00ff41] text-[#00ff41] font-bold'
                    } else if (feedback?.type === 'error') {
                      if (isRightOption) {
                        btnStyle =
                          'bg-[#00ff41]/15 border-[#00ff41] text-[#00ff41]'
                      } else if (isPicked) {
                        btnStyle =
                          'bg-[#ff2a2a]/20 border-[#ff2a2a] text-[#ff2a2a]'
                      }
                    }

                    return (
                      <button
                        key={letter}
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => handleCommsChoice(letter)}
                        onKeyDown={stopKeyPropagation}
                        onKeyUp={stopKeyPropagation}
                        className={`w-full text-left p-3 border-2 rounded-lg transition cursor-pointer flex items-start gap-3 ${btnStyle}`}
                      >
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-[#00e5ff]/20 border border-[#00e5ff] text-[#00e5ff] font-bold text-xs shrink-0 mt-0.5">
                          {letter}
                        </span>
                        <span className="text-xs sm:text-sm leading-relaxed">
                          {optionText}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Feedback & Pembahasan Lengkap */}
              {feedback && (
                <div
                  className={`p-4 border-2 rounded-lg space-y-2.5 text-xs ${
                    feedback.type === 'success'
                      ? 'bg-[#00ff41]/10 border-[#00ff41] text-[#00ff41]'
                      : 'bg-[#ff2a2a]/10 border-[#ff2a2a] text-[#ff2a2a]'
                  }`}
                >
                  <div className="font-bold text-sm tracking-wide flex items-center justify-between">
                    <span>&gt; {feedback.message}</span>
                  </div>

                  {/* Box Pembahasan Lengkap saat salah */}
                  {feedback.type === 'error' && feedback.explanation && (
                    <div className="bg-[#05070a]/95 border border-[#00e5ff]/60 p-3.5 rounded-lg text-gray-200 space-y-1.5 mt-2">
                      <div className="text-[#00e5ff] font-bold tracking-wider flex items-center justify-between border-b border-[#00e5ff]/25 pb-1.5">
                        <span>📘 PEMBAHASAN &amp; PENJELASAN JAWABAN:</span>
                        {feedback.correctAnswer && (
                          <span className="bg-[#00ff41]/20 text-[#00ff41] border border-[#00ff41]/50 px-2.5 py-0.5 rounded font-bold">
                            Jawaban Benar: {feedback.correctAnswer}
                          </span>
                        )}
                      </div>
                      <ul className="space-y-1 text-xs leading-relaxed text-gray-300 pt-1">
                        {feedback.explanation.map((step, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-[#00ff41] font-bold">
                              {i + 1}.
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="text-[11px] text-[#00e5ff] pt-1 italic">
                        {activeTerminal === 'dataNode'
                          ? 'Silakan ketik jawaban yang benar pada kolom di atas lalu klik [KIRIM] untuk lanjut!'
                          : `Silakan klik pilihan ${feedback.correctAnswer} di atas untuk melanjutkan ke soal berikutnya!`}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="text-[11px] text-gray-500 flex justify-between pt-1 border-t border-gray-800">
                <span>PERCOBAAN SALAH: {currentAttempts}x</span>
                <span>TEKAN [ESC] UNTUK KEMBALI KE DUNIA 3D</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Start Screen: BOOT SEQUENCE Overlay */}
      {!booted && (
        <div className="absolute inset-0 bg-[#05070a]/90 backdrop-blur-md flex items-center justify-center p-6 pointer-events-auto z-50">
          <div className="max-w-lg w-full bg-[#0b0f14] border-2 border-[#00e5ff] rounded-2xl p-8 shadow-[0_0_50px_rgba(0,229,255,0.3)] space-y-6">
            <div className="border-b border-[#00e5ff]/30 pb-4">
              <div className="text-xs text-[#00e5ff] tracking-widest mb-1 font-bold">
                ROBLOX CYBER-CAMPUS // EDUQUEST XII
              </div>
              <h1 className="text-2xl font-bold text-[#00ff41] glow-green tracking-wider">
                EDUQUEST XII: PROTOCOL BREACH
              </h1>
            </div>

            <div className="space-y-3 text-xs text-gray-200 leading-relaxed">
              <p>
                Selamat datang di dunia 3D **EduQuest Cyber-City**! Kendalikan karakter bergaya **Roblox** milikmu menjelajahi taman kota, jembatan parkour (obby), dan dua paviliun terminal utama:
              </p>
              <ul className="space-y-2 text-[#00e5ff] pl-2">
                <li>
                  &gt; <span className="font-bold text-[#00ff41]">PAVILIUN BARAT (Kiri)</span>: 10 Soal **Matematika (Statistika &amp; Analisis Data)** dalam Bahasa Indonesia + Pembahasan Lengkap.
                </li>
                <li>
                  &gt; <span className="font-bold text-[#00ff41]">PAVILIUN TIMUR (Kanan)</span>: 10 Soal Pilihan Ganda **ABCD Bahasa Inggris (Discussion Text)** + Pembahasan Lengkap.
                </li>
              </ul>
            </div>

            <div className="bg-[#05070a] border border-[#00ff41]/35 rounded-xl p-3.5 text-xs space-y-1 text-gray-300">
              <div className="text-[#00ff41] font-bold mb-1">
                KENDALI KARAKTER ROBLOX:
              </div>
              <div>
                <span className="text-[#00e5ff] font-bold">WASD / Panah</span> : Jalan Kaki
              </div>
              <div>
                <span className="text-[#00e5ff] font-bold">SHIFT + Jalan</span> : Lari Cepat (Sprint)
              </div>
              <div>
                <span className="text-[#00e5ff] font-bold">SPACE</span> : Lompat (Parkour / Obby)
              </div>
              <div>
                <span className="text-[#00e5ff] font-bold">Q / E / Drag Mouse</span> : Putar Sudut Kamera
              </div>
              <div>
                <span className="text-[#00e5ff] font-bold">Tombol F</span> : Buka Terminal Soal
              </div>
            </div>

            <button
              type="button"
              onClick={handleBoot}
              className="w-full py-3.5 bg-[#00ff41]/20 hover:bg-[#00ff41]/35 border-2 border-[#00ff41] rounded-xl text-[#00ff41] glow-green font-bold text-sm tracking-widest transition cursor-pointer"
            >
              [ PLAY / MULAI PETUALANGAN ]
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
